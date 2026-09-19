import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isCv, isProfile, isSession } from '@/lib/validators';
import { AppClient } from './AppClient';

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect('/login');

  return (
    <AppClient
      cv={isCv(user.cv) ? user.cv : null}
      profile={isProfile(user.profile) ? user.profile : null}
      session={isSession(user.session) ? user.session : null}
    />
  );
}
