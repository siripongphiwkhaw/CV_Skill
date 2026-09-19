import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isCv, isProfile, isSession } from '@/lib/validators';

const FIELD_VALIDATORS = { cv: isCv, profile: isProfile, session: isSession } as const;
type Field = keyof typeof FIELD_VALIDATORS;

function isField(value: unknown): value is Field {
  return value === 'cv' || value === 'profile' || value === 'session';
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  const field = body && typeof body === 'object' && 'field' in body ? body.field : undefined;
  const value = body && typeof body === 'object' && 'value' in body ? body.value : undefined;

  if (!isField(field) || !FIELD_VALIDATORS[field](value)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { [field]: value } });
  return NextResponse.json({ ok: true });
}
