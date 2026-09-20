import Link from 'next/link';
import { PdpaNotice } from '@/lib/pdpa';

export default function PrivacyPage() {
  return (
    <div className="auth-page">
      <div className="card pdpa-page">
        <Link href="/">← Back</Link>
        <PdpaNotice />
      </div>
    </div>
  );
}
