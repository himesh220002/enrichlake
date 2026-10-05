import type { Metadata } from 'next';
import LegalShell, { LegalH } from '@/components/site/LegalShell';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Enricher terms and conditions — acceptable use, data accuracy, and service terms.',
};

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Terms & conditions"
      title="Fair rules for a shared resource."
      intro="By using Enricher workspaces you agree to these terms. They exist to keep the service fast, lawful and useful for everyone."
    >
      <LegalH>1. Acceptable use</LegalH>
      <p>
        Use the workspaces for lawful research — prospecting, sourcing, market analysis, content
        creation and due diligence. Do not use the service to harass individuals, build spam lists
        in violation of anti-spam law, circumvent access controls, or scrape at abusive rates that
        degrade the service for others. Automated bulk access that violates a target site&apos;s
        terms is your responsibility.
      </p>
      <LegalH>2. Data accuracy</LegalH>
      <p>
        Results are derived from public web signals and heuristic refinement. They are provided
        &ldquo;as is&rdquo; without warranty of completeness or accuracy. Verify critical details —
        especially contact data, pricing and compliance signals — before acting on them.
      </p>
      <LegalH>3. Intellectual property</LegalH>
      <p>
        Dossiers, briefs and posts you generate from your own inputs are yours to use. The
        Enricher interface, branding and console artwork remain the property of their respective
        owners. Do not misrepresent scraped third-party content as your own.
      </p>
      <LegalH>4. AI features</LegalH>
      <p>
        Bring-your-own-key synthesis uses third-party AI providers subject to their own terms and
        pricing. You are responsible for keys you configure and usage you generate with them.
      </p>
      <LegalH>5. Availability & changes</LegalH>
      <p>
        The service may change, rate-limit or suspend features to protect reliability. Continued
        use after changes constitutes acceptance. For questions about these terms, use the contact
        page.
      </p>
      <p className="text-sm text-[#8a97b3]">Last updated: October 2026.</p>
    </LegalShell>
  );
}
