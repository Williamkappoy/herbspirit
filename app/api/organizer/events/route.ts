import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, categoryId, image, startDate, endDate, venue, ticketTypes, status } = body;

  if (!title || !description || !startDate) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const organizer = await prisma.organizerProfile.findFirst({ where: { userId: user.id } });
  if (!organizer) {
    return NextResponse.json({ error: 'no_organizer_profile' }, { status: 400 });
  }

  // Create or find venue
  let venueId: string | null = null;
  if (venue && venue.name && venue.city) {
    const existingVenue = await prisma.venue.findFirst({
      where: { name: venue.name, city: venue.city },
    });
    if (existingVenue) {
      venueId = existingVenue.id;
    } else {
      const newVenue = await prisma.venue.create({
        data: {
          name: venue.name,
          address: venue.address || null,
          postalCode: venue.postalCode || null,
          city: venue.city,
          country: venue.country || 'Belgique',
        },
      });
      venueId = newVenue.id;
    }
  }

  // Generate slug
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

  // Create event
  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description,
      image: image || null,
      gallery: [],
      categoryId: categoryId || null,
      organizerId: organizer.id,
      venueId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: status || 'DRAFT',
      ticketTypes: {
        create: (ticketTypes || []).map((tt: any) => ({
          name: tt.name,
          description: tt.description || null,
          price: parseFloat(tt.price) || 0,
          quantity: parseInt(tt.quantity) || 0,
          maxPerOrder: parseInt(tt.maxPerOrder) || 10,
        })),
      },
    },
  });

  return NextResponse.json({ slug: event.slug, id: event.id });
}
