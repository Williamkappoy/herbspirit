import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    organizerProfile: user.organizerProfile
      ? { id: user.organizerProfile.id, name: user.organizerProfile.name, slug: user.organizerProfile.slug }
      : null,
  });
}
