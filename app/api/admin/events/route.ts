import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const action = searchParams.get('action');

  if (!id || !action) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  }

  const statusMap: Record<string, string> = {
    approve: 'PUBLISHED',
    reject: 'DRAFT',
    suspend: 'SUSPENDED',
    publish: 'PUBLISHED',
    unpublish: 'DRAFT',
    archive: 'ARCHIVED',
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
  }

  await prisma.event.update({
    where: { id },
    data: { status: newStatus as any },
  });

  return NextResponse.json({ ok: true });
}
