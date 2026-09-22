import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LocaleToggle } from './LocaleToggle';
import type { Step } from '../types/jobFit';

interface Props {
  name: string;
  maxStep: Step;
  onGo: (step: Step) => void;
}

const LINKS: { label: string; step: Step }[] = [
  { label: 'Profile', step: 1 },
  { label: 'Job & match', step: 2 },
  { label: 'Tailor & build', step: 3 },
  { label: 'Interview prep', step: 4 },
];

export function TopBar({ name, maxStep, onGo }: Props) {
  const router = useRouter();
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="topbar no-print">
      <div className="topbar-brand"><span className="topbar-mark" aria-hidden="true" />CVskills</div>
      <nav className="topbar-nav" aria-label="Steps">
        {LINKS.map((l) => (
          <button key={l.step} type="button" disabled={l.step > maxStep} onClick={() => onGo(l.step)}>{l.label}</button>
        ))}
      </nav>
      <div className="topbar-note">No API key · synced to your account</div>
      <div className="topbar-user">
        <LocaleToggle />
        <div className="avatar" aria-hidden="true">{initial}</div>
        <span>{name.trim() ? name.split(' ')[0] : 'You'}</span>
        <button type="button" className="btn btn-quiet btn-sm" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
