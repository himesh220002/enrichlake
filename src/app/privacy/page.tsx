import type { Metadata } from 'next';
import LegalShell, { LegalH } from '@/components/site/LegalShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Enricher privacy policy — what data is collected, how browser-stored keys work, and your rights.',
};

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Privacy policy"
      title="Your research stays yours."
      intro="Short version: we collect the minimum needed to run the service. Your AI keys never leave your browser, and your saved dossiers live in your own workspace."
    >
      <LegalH>1. What we collect</LegalH>
      <p>
        When you run a workspace, the service processes the inputs you provide — domains, queries,
        URLs and handles — to perform the requested scrape or enrichment. Server logs may record
        request timestamps, error traces and aggregate usage counts for reliability and abuse
        prevention. We do not sell personal data, and we do not share research inputs with
        advertisers.
      </p>
      <LegalH>2. Browser-stored data</LegalH>
      <p>
        Bring-your-own-key credentials, saved profiles, ratings and remarks are stored in your
        browser&apos;s local storage on your device — not on our servers. Clearing site data
        removes them permanently. API keys you enter are sent only to the AI provider you select,
        directly from your browser session, and are never logged by us.
      </p>
      <LegalH>3. Public sources only</LegalH>
      <p>
        All enrichment draws from publicly accessible web surfaces. The product does not bypass
        logins, purchase private data, or collect non-public personal information. If you believe
        a result contains data that should not be public, contact us and we will review it.
      </p>
      <LegalH>4. Analytics</LegalH>
      <p>
        If analytics is enabled, anonymized page-view statistics help us understand which
        workspaces are useful. Analytics can be configured or disabled by the site operator without
        affecting core functionality.
      </p>
      <LegalH>5. Your rights & contact</LegalH>
      <p>
        You may request access, correction or deletion of any data associated with you by reaching
        out through the contact page. This policy may be updated as the product evolves; material
        changes will be reflected on this page with a revised date.
      </p>
      <p className="text-sm text-[#8a97b3]">Last updated: October 2026.</p>
    </LegalShell>
  );
}
