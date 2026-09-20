/**
 * AI Multi-Channel Outreach Pitch Synthesizer
 *
 * Generates production-ready, hyper-personalized Cold Emails,
 * LinkedIn InMails, and WhatsApp B2B pitches referencing the company's
 * value proposition, tech stack, and active Meta ad campaigns.
 */

export type PitchTone = 'direct' | 'executive' | 'challenger' | 'warm';

export interface GeneratedPitchResult {
  tone: PitchTone;
  companyName: string;
  domain: string;
  emailPitch: {
    subjectLines: string[];
    body: string;
    wordCount: number;
  };
  linkedinPitch: {
    connectionNote: string; // Under 300 chars
    inmailSubject: string;
    inmailBody: string;
  };
  whatsappPitch: {
    messageText: string;
    whatsappWebUrl: string;
  };
  keyPersonalizationAngles: string[];
  generatedAt: string;
}

export function generateOutreachPitch(params: {
  companyName: string;
  domain?: string;
  valueProposition?: string;
  industry?: string;
  coreOfferings?: string[];
  activeAdsCount?: number;
  topAdHeadline?: string;
  techStack?: string[];
  tone?: PitchTone;
  contactName?: string;
}): GeneratedPitchResult {
  const {
    companyName,
    domain = `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    valueProposition = 'accelerating modern customer workflows',
    industry = 'Technology & Growth',
    coreOfferings = ['Commercial Solutions', 'Workflow Automation'],
    activeAdsCount = 0,
    topAdHeadline,
    techStack = [],
    tone = 'direct',
    contactName = 'there',
  } = params;

  const topOffering = coreOfferings[0] || 'your core services';
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  // Tone-specific variations
  let emailSubject1 = '';
  let emailSubject2 = '';
  let emailHook = '';
  let emailValue = '';
  let emailCta = '';

  let inmailSubject = '';
  let inmailBody = '';
  let connectionNote = '';
  let waText = '';

  if (tone === 'direct') {
    emailSubject1 = `Quick question re: ${companyName}'s growth`;
    emailSubject2 = `${topOffering} + benchmark metrics`;
    emailHook = `Noticed how ${companyName} is driving "${valueProposition.slice(0, 75)}" across ${cleanDomain}.`;
    if (activeAdsCount > 0 && topAdHeadline) {
      emailHook += ` Also saw your active campaign on "${topAdHeadline.slice(0, 60)}".`;
    }
    emailValue = `We recently helped similar teams in ${industry} cut outbound acquisition overhead by ~34% while automating lead qualification.`;
    emailCta = `Open to a 6-minute chat this Thursday at 3 PM, or should I send a 1-page benchmark brief first?`;

    connectionNote = `Hi ${contactName}, impressed by ${companyName}'s work in ${industry}. Would love to connect and follow your roadmap!`;
    inmailSubject = `Ideas for ${companyName}'s pipeline`;
    inmailBody = `Hi ${contactName},\n\nCame across ${companyName} while analyzing top innovators in ${industry}. Love the focus on ${topOffering}.\n\nCurious how your team is currently handling lead enrichment and customer response velocity. Open to exchanging notes?`;

    waText = `Hi ${contactName}! Reaching out from ENRICHER.AI regarding ${companyName}'s digital expansion. Love your work with ${topOffering}. Do you have 2 mins to check our benchmark report?`;
  } else if (tone === 'executive') {
    emailSubject1 = `Strategic synergy with ${companyName}`;
    emailSubject2 = `Enterprise RevOps acceleration for ${companyName}`;
    emailHook = `Following ${companyName}'s footprint in ${industry}, your commitment to "${valueProposition.slice(0, 80)}" strongly aligns with high-growth market patterns.`;
    emailValue = `We specialize in deploying zero-cost automated intelligence and data refinement pipelines for enterprises scaling ${topOffering}, ensuring zero CRM data degradation and verified contact reach.`;
    emailCta = `Would you be open to an executive briefing next week to review comparative industry benchmarks?`;

    connectionNote = `Hi ${contactName}, following ${companyName}'s strategic expansion in ${industry}. Would welcome connecting with your leadership network.`;
    inmailSubject = `Executive Briefing: Data & Revenue Acceleration for ${companyName}`;
    inmailBody = `Dear ${contactName},\n\nI have been following ${companyName}'s momentum in ${industry}, especially your strategic emphasis on "${valueProposition.slice(0, 60)}".\n\nWe partner with executive leaders to streamline customer intelligence and reduce vendor reliance. Would you be open to an introductory discussion?`;

    waText = `Hello ${contactName}, sharing an executive intelligence brief tailored for ${companyName} regarding your omnichannel footprint in ${industry}. Let me know if you would like the full dossier.`;
  } else if (tone === 'challenger') {
    emailSubject1 = `Rethinking ${industry} acquisition at ${companyName}`;
    emailSubject2 = `Fixing data friction for ${companyName}`;
    emailHook = `Most teams in ${industry} struggle with stale contact records and escalating SaaS data fees while trying to deliver on "${valueProposition.slice(0, 70)}".`;
    emailValue = `We built an automated, zero-vendor-cost enrichment engine that guarantees 100% data freshness and eliminates overpaying for ZoomInfo/Apollo licenses.`;
    emailCta = `Worth 5 minutes to see if we can save ${companyName} $15,000+ in annual RevOps tooling?`;

    connectionNote = `Hi ${contactName}, noticed ${companyName}'s growth. We help teams eliminate costly data broker subscriptions. Happy to share how.`;
    inmailSubject = `Tired of legacy B2B data costs at ${companyName}?`;
    inmailBody = `Hi ${contactName},\n\nQuick thought: most companies in ${industry} are overpaying for outdated contact databases. We engineered an alternative that scrapes and enriches in real-time with zero API fees.\n\nWorth exploring how ${companyName} could leverage this?`;

    waText = `Hey ${contactName}! Are you still relying on traditional data vendors for ${companyName}? We found a way to automate lead intelligence at zero vendor cost. Check it out when you have a moment.`;
  } else {
    // Warm / Value-first
    emailSubject1 = `Loved ${companyName}'s recent updates!`;
    emailSubject2 = `Resource for ${companyName}'s team`;
    emailHook = `I came across ${cleanDomain} today and was genuinely inspired by your approach to "${valueProposition.slice(0, 75)}".`;
    emailValue = `I put together a quick, complimentary market intelligence overview highlighting your omni-channel footprint and keyword opportunities in ${industry}.`;
    emailCta = `Happy to send the report over with zero strings attached if you're interested!`;

    connectionNote = `Hi ${contactName}, really inspired by ${companyName}'s mission with ${topOffering}. Would love to connect and stay in touch!`;
    inmailSubject = `Complimentary intelligence report for ${companyName}`;
    inmailBody = `Hi ${contactName},\n\nI really admire what you and the team are building at ${companyName}. I put together a quick market analysis regarding your omnichannel reach and would love to share it with you.\n\nNo pitch or obligation—just thought it might be valuable for your roadmap!`;

    waText = `Hi ${contactName}! Hope you're having a great week. Put together a customized growth intelligence report for ${companyName}. Happy to send the link if you'd like!`;
  }

  const emailBody = `Hi ${contactName},\n\n${emailHook}\n\n${emailValue}\n\n${emailCta}\n\nBest regards,\n[Your Name]\n[Your Title] • ENRICHER.AI`;

  // WhatsApp Web URL
  const whatsappWebUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  return {
    tone,
    companyName,
    domain: cleanDomain,
    emailPitch: {
      subjectLines: [emailSubject1, emailSubject2],
      body: emailBody,
      wordCount: emailBody.split(/\s+/).length,
    },
    linkedinPitch: {
      connectionNote: connectionNote.slice(0, 295),
      inmailSubject,
      inmailBody,
    },
    whatsappPitch: {
      messageText: waText,
      whatsappWebUrl,
    },
    keyPersonalizationAngles: [
      `Value Proposition: "${valueProposition.slice(0, 70)}"`,
      `Core Offering: ${topOffering}`,
      activeAdsCount > 0 ? `Active Meta Ad Campaigns: ~${activeAdsCount} ads` : `Omnichannel Brand Presence`,
      techStack.length > 0 ? `Tech Stack: ${techStack.slice(0, 3).join(', ')}` : `Industry: ${industry}`,
    ],
    generatedAt: new Date().toISOString(),
  };
}
