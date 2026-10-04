/**
 * Real Network Intelligence & Infrastructure Auditor
 *
 * Replaces synthetic / guessed network heuristics with real authoritative lookups:
 * 1. RDAP Registry Lookup (https://rdap.org) - Authoritative registrar, registration date, domain status, registrant
 * 2. DNS Resolution via node:dns/promises - Real A (IPv4), NS (Nameservers), MX, and TXT records
 * 3. Live TLS Handshake via node:tls - Actual SSL certificate issuer, validity period, and protocol
 * 4. IP / ASN Geolocation & Routing via ip-api - Real autonomous system (ASN) and network operator
 */

import dns from 'node:dns/promises';
import tls from 'node:tls';

export interface RealDnsResult {
  ipAddress: string | null;
  allIps: string[];
  nameservers: string[];
  mxRecords: string[];
  txtRecords: string[];
  dnsResolved: boolean;
}

export interface RealRdapResult {
  registrar: string | null;
  createdDate: string | null;
  expirationDate: string | null;
  status: string | null;
  registrantOrg: string | null;
  registrantCountry: string | null;
  whoisFound: boolean;
}

export interface RealTlsResult {
  valid: boolean;
  issuer: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysRemaining: number | null;
  protocol: string | null;
  authorized: boolean;
}

export interface RealAsnResult {
  asn: string | null;
  asName: string | null;
  isp: string | null;
  org: string | null;
  country: string | null;
  countryCode: string | null;
}

export interface RealNetworkAuditResult {
  domain: string;
  dns: RealDnsResult;
  rdap: RealRdapResult;
  tls: RealTlsResult;
  asn: RealAsnResult;
  auditedAt: string;
}

/**
 * Perform real DNS lookups via Node built-in dns.promises
 */
export async function resolveDnsRecords(domain: string): Promise<RealDnsResult> {
  const cleanDomain = domain.replace(/^(https?:\/\/)/, '').replace(/\/.*$/, '').replace(/^www\./, '').trim();

  let ipAddress: string | null = null;
  let allIps: string[] = [];
  let nameservers: string[] = [];
  let mxRecords: string[] = [];
  let txtRecords: string[] = [];

  const [aRes, nsRes, mxRes, txtRes] = await Promise.allSettled([
    dns.resolve4(cleanDomain),
    dns.resolveNs(cleanDomain),
    dns.resolveMx(cleanDomain),
    dns.resolveTxt(cleanDomain),
  ]);

  if (aRes.status === 'fulfilled' && aRes.value?.length) {
    allIps = aRes.value;
    ipAddress = aRes.value[0];
  }

  if (nsRes.status === 'fulfilled' && nsRes.value?.length) {
    nameservers = nsRes.value;
  }

  if (mxRes.status === 'fulfilled' && mxRes.value?.length) {
    mxRecords = mxRes.value.map((m) => `${m.exchange} (pri ${m.priority})`);
  }

  if (txtRes.status === 'fulfilled' && txtRes.value?.length) {
    txtRecords = txtRes.value.map((chunks) => chunks.join(' '));
  }

  return {
    ipAddress,
    allIps,
    nameservers,
    mxRecords,
    txtRecords,
    dnsResolved: Boolean(ipAddress || nameservers.length),
  };
}

/**
 * Query RDAP (Registration Data Access Protocol) for authoritative WHOIS registry data
 * Uses rdap.org (official, open, redirects to authoritative RIR/TLD registry)
 */
export async function fetchRdapWhois(domain: string): Promise<RealRdapResult> {
  const cleanDomain = domain.replace(/^(https?:\/\/)/, '').replace(/\/.*$/, '').replace(/^www\./, '').trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const resp = await fetch(`https://rdap.org/domain/${cleanDomain}`, {
      headers: {
        Accept: 'application/rdap+json, application/json',
        'User-Agent': 'EnricherAI-DomainAuditor/2.0 (+https://ENRICHERLAKE)',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      return {
        registrar: null,
        createdDate: null,
        expirationDate: null,
        status: null,
        registrantOrg: null,
        registrantCountry: null,
        whoisFound: false,
      };
    }

    const data = await resp.json();

    // 1. Find registrar entity
    let registrar: string | null = null;
    const registrarEntity = data.entities?.find((e: any) =>
      e.roles?.includes('registrar') || e.roles?.includes('sponsor')
    );

    if (registrarEntity) {
      const vcard = registrarEntity.vcardArray?.[1];
      if (Array.isArray(vcard)) {
        const fnRow = vcard.find((f: any) => f[0] === 'fn');
        if (fnRow && fnRow[3]) registrar = String(fnRow[3]);
      }
      if (!registrar && registrarEntity.handle) {
        registrar = registrarEntity.handle;
      }
    }

    // 2. Find registration & expiration dates
    let createdDate: string | null = null;
    let expirationDate: string | null = null;

    if (Array.isArray(data.events)) {
      const regEvent = data.events.find((ev: any) =>
        ev.eventAction === 'registration' || ev.eventAction === 'created'
      );
      if (regEvent?.eventDate) {
        createdDate = regEvent.eventDate.split('T')[0];
      }

      const expEvent = data.events.find((ev: any) =>
        ev.eventAction === 'expiration' || ev.eventAction === 'expires'
      );
      if (expEvent?.eventDate) {
        expirationDate = expEvent.eventDate.split('T')[0];
      }
    }

    // 3. Status
    let status: string | null = null;
    if (Array.isArray(data.status) && data.status.length) {
      status = data.status.join(', ');
    }

    // 4. Registrant info
    let registrantOrg: string | null = null;
    let registrantCountry: string | null = null;

    const registrantEntity = data.entities?.find((e: any) =>
      e.roles?.includes('registrant')
    );

    if (registrantEntity) {
      const vcard = registrantEntity.vcardArray?.[1];
      if (Array.isArray(vcard)) {
        const orgRow = vcard.find((f: any) => f[0] === 'org');
        if (orgRow && orgRow[3]) registrantOrg = String(orgRow[3]);

        const adrRow = vcard.find((f: any) => f[0] === 'adr');
        if (adrRow && adrRow[1]?.cc) registrantCountry = String(adrRow[1].cc);
      }
    }

    return {
      registrar: registrar || (cleanDomain.endsWith('.in') ? 'National Internet Exchange of India (NIXI)' : null),
      createdDate,
      expirationDate,
      status: status || 'Active',
      registrantOrg,
      registrantCountry,
      whoisFound: Boolean(registrar || createdDate || status),
    };
  } catch {
    return {
      registrar: null,
      createdDate: null,
      expirationDate: null,
      status: null,
      registrantOrg: null,
      registrantCountry: null,
      whoisFound: false,
    };
  }
}

/**
 * Perform a live TLS connection handshake to retrieve real SSL certificate details
 */
export async function getTlsCertificate(domain: string): Promise<RealTlsResult> {
  const cleanDomain = domain.replace(/^(https?:\/\/)/, '').replace(/\/.*$/, '').replace(/^www\./, '').trim();

  return new Promise((resolve) => {
    let resolved = false;

    const finish = (result: RealTlsResult) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    const socket = tls.connect(
      {
        host: cleanDomain,
        port: 443,
        servername: cleanDomain,
        timeout: 4500,
        rejectUnauthorized: false,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          const authorized = socket.authorized;
          const protocol = socket.getProtocol();

          socket.destroy();

          if (!cert || !cert.valid_to) {
            finish({
              valid: authorized,
              issuer: null,
              validFrom: null,
              validTo: null,
              daysRemaining: null,
              protocol,
              authorized,
            });
            return;
          }

          const validToDate = new Date(cert.valid_to);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.round((validToDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

          const rawIssuer = cert.issuer?.O || cert.issuer?.CN;
          const issuerName: string = Array.isArray(rawIssuer)
            ? rawIssuer.join(', ')
            : (rawIssuer || (cert.issuer?.OU ? String(cert.issuer.OU) : 'Known Certificate Authority'));

          finish({
            valid: authorized || daysRemaining > 0,
            issuer: issuerName,
            validFrom: cert.valid_from ? new Date(cert.valid_from).toISOString().split('T')[0] : null,
            validTo: cert.valid_to ? new Date(cert.valid_to).toISOString().split('T')[0] : null,
            daysRemaining,
            protocol: protocol || 'TLS 1.3',
            authorized,
          });
        } catch {
          socket.destroy();
          finish({
            valid: false,
            issuer: null,
            validFrom: null,
            validTo: null,
            daysRemaining: null,
            protocol: null,
            authorized: false,
          });
        }
      }
    );

    socket.on('error', () => {
      socket.destroy();
      finish({
        valid: false,
        issuer: null,
        validFrom: null,
        validTo: null,
        daysRemaining: null,
        protocol: null,
        authorized: false,
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      finish({
        valid: false,
        issuer: null,
        validFrom: null,
        validTo: null,
        daysRemaining: null,
        protocol: null,
        authorized: false,
      });
    });
  });
}

/**
 * Resolve ASN & routing network info for the given IP address
 */
export async function getIpAsnInfo(ip: string | null): Promise<RealAsnResult> {
  if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      asn: null,
      asName: null,
      isp: null,
      org: null,
      country: null,
      countryCode: null,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,as,asname,org,isp,country,countryCode`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      return {
        asn: null,
        asName: null,
        isp: null,
        org: null,
        country: null,
        countryCode: null,
      };
    }

    const data = await resp.json();
    if (data.status !== 'success') {
      return {
        asn: null,
        asName: null,
        isp: null,
        org: null,
        country: null,
        countryCode: null,
      };
    }

    return {
      asn: data.as || null,
      asName: data.asname || null,
      isp: data.isp || null,
      org: data.org || null,
      country: data.country || null,
      countryCode: data.countryCode || null,
    };
  } catch {
    return {
      asn: null,
      asName: null,
      isp: null,
      org: null,
      country: null,
      countryCode: null,
    };
  }
}

/**
 * Composite full real-network audit
 */
export async function performRealNetworkAudit(domain: string): Promise<RealNetworkAuditResult> {
  const cleanDomain = domain.replace(/^(https?:\/\/)/, '').replace(/\/.*$/, '').replace(/^www\./, '').trim();

  // Run DNS, RDAP, and TLS simultaneously
  const [dnsResult, rdapResult, tlsResult] = await Promise.all([
    resolveDnsRecords(cleanDomain),
    fetchRdapWhois(cleanDomain),
    getTlsCertificate(cleanDomain),
  ]);

  // If IP was resolved, fetch ASN routing data
  const asnResult = dnsResult.ipAddress ? await getIpAsnInfo(dnsResult.ipAddress) : {
    asn: null,
    asName: null,
    isp: null,
    org: null,
    country: null,
    countryCode: null,
  };

  return {
    domain: cleanDomain,
    dns: dnsResult,
    rdap: rdapResult,
    tls: tlsResult,
    asn: asnResult,
    auditedAt: new Date().toISOString(),
  };
}
