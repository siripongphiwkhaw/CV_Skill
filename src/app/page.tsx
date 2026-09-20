import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isCv, isProfile, isSession } from '@/lib/validators';
import { AppClient } from './AppClient';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: row } = await supabase
    .from('cv_profiles')
    .select('cv, profile, session')
    .eq('id', user.id)
    .single();

  return (
    <AppClient
      userId={user.id}
      cv={row && isCv(row.cv) ? row.cv : null}
      profile={row && isProfile(row.profile) ? row.profile : null}
      session={row && isSession(row.session) ? row.session : null}
    />
  );
}
