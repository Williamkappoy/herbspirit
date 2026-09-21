import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  const categories = await prisma.eventCategory.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}
