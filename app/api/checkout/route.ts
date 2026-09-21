import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { items } = await request.json();
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'empty_cart' }, { status: 400 });
  }

  // Validate items and calculate total
  let totalAmount = 0;
  const validatedItems: { tt: any; quantity: number; unitPrice: number }[] = [];

  for (const item of items) {
    const tt = await prisma.ticketType.findUnique({
      where: { id: item.ticketTypeId },
      include: { event: true },
    });
    if (!tt) continue;

    const available = tt.quantity - tt.sold;
    if (available < item.quantity) {
      return NextResponse.json(
        { error: 'insufficient', ticketType: tt.name },
        { status: 400 }
      );
    }

    const unitPrice = parseFloat(tt.price.toString());
    totalAmount += unitPrice * item.quantity;
    validatedItems.push({ tt, quantity: item.quantity, unitPrice });
  }

  if (validatedItems.length === 0) {
    return NextResponse.json({ error: 'empty_cart' }, { status: 400 });
  }

  const commissionRate = parseFloat(process.env.COMMISSION_RATE || '5');
  const commissionAmount = (totalAmount * commissionRate) / 100;
  const organizerAmount = totalAmount - commissionAmount;

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber: `KAP-${Date.now().toString().slice(-8)}`,
      userId: user.id,
      totalAmount,
      fees: 0,
      status: 'PAID',
      items: {
        create: validatedItems.map((vi) => ({
          ticketTypeId: vi.tt.id,
          quantity: vi.quantity,
          unitPrice: vi.unitPrice,
        })),
      },
    },
  });

  // Create payment (simulated Base44 Payments)
  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: totalAmount,
      status: 'SUCCEEDED',
      method: 'card',
    },
  });

  // Create commission record
  await prisma.commission.create({
    data: {
      orderId: order.id,
      rate: commissionRate,
      grossAmount: totalAmount,
      commissionAmount,
      organizerAmount,
      currency: 'EUR',
    },
  });

  // Generate tickets with unique codes
  for (const vi of validatedItems) {
    for (let i = 0; i < vi.quantity; i++) {
      await prisma.ticket.create({
        data: {
          uniqueCode: `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          ticketTypeId: vi.tt.id,
          eventId: vi.tt.eventId,
          orderId: order.id,
          participantName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
          status: 'PAID',
        },
      });
    }
    // Update sold count
    await prisma.ticketType.update({
      where: { id: vi.tt.id },
      data: { sold: { increment: vi.quantity } },
    });
  }

  // Create notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'ORDER_CONFIRMATION',
      title: 'Commande confirmée',
      message: `Votre commande ${order.orderNumber} a été confirmée. Vos billets sont disponibles dans votre espace.`,
      read: false,
    },
  });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    orderId: order.id,
  });
}
