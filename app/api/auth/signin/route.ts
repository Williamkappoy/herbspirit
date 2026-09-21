import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'missing' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organizerProfile: true },
  });

  if (!user || !(await comparePassword(password, user.password))) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }

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
