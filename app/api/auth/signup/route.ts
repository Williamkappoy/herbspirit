import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  const { email, password, firstName, lastName, role, organizerName } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'missing' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'exists' }, { status: 400 });
  }

  const isOrganizer = role === 'ORGANIZER';
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
      role: isOrganizer ? 'ORGANIZER' : 'BUYER',
      ...(isOrganizer && organizerName
        ? {
            organizerProfile: {
              create: {
                name: organizerName,
                slug: organizerName
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, ''),
              },
            },
          }
        : {
            buyerProfile: { create: {} },
          }),
    },
    include: { organizerProfile: true },
  });

  const token = generateToken(user.id);
  const response = NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    organizerProfile: user.organizerProfile
      ? { id: user.organizerProfile.id, name: user.organizerProfile.name, slug: user.organizerProfile.slug }
      : null,
  });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
  return response;
}
