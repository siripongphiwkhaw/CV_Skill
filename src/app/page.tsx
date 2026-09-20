import { createClient } from '@/lib/supabase/server';
import { isCv, isProfile, isSession } from '@/lib/validators';
import { emptyCv } from '@/types/cv';
import { Landing } from '@/components/Landing';
import { AppClient } from './AppClient';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <Landing />;

  const { data: row } = await supabase
    .from('cv_profiles')
    .select('cv, profile, session')
    .eq('id', user.id)
    .single();

  const storedCv = row && isCv(row.cv) ? row.cv : null;
  // First load after registration: pre-fill basics from the account fields
  // collected at signup, so the user isn't asked to retype them.
  const cv = storedCv ?? {
    ...emptyCv(),
    basics: {
      ...emptyCv().basics,
      fullName: typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : '',
      email: user.email ?? '',
      phone: typeof user.user_metadata.phone === 'string' ? user.user_metadata.phone : '',
    },
  };

  return (
    <AppClient
      userId={user.id}
      cv={cv}
      profile={row && isProfile(row.profile) ? row.profile : null}
      session={row && isSession(row.session) ? row.session : null}
    />
  );
}
