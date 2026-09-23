import { EnrichedCompanyProfile } from './enrichDomain';
import { performRealNetworkAudit, RealNetworkAuditResult } from './networkAudit';
import { assembleDossier, RefinedDomainDossier } from './domainRefiner';

/**
 * Server-only asynchronous authoritative refiner — executes real RDAP, DNS, TLS, and ASN audit.
 * Kept in a dedicated server file to prevent Node.js built-ins (node:dns, node:tls) from being bundled into client bundles.
 */
export async function refineDomainDossierLive(
  profile: Partial<EnrichedCompanyProfile>
): Promise<RefinedDomainDossier> {
  const domain = profile.domain || 'example.com';
  let audit: RealNetworkAuditResult | undefined;

  try {
    audit = await performRealNetworkAudit(domain);
  } catch (err: any) {
    console.warn(`[domainRefinerServer] Real network audit warning for ${domain}:`, err.message);
  }

  return assembleDossier(profile, audit);
}
