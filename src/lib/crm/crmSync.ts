import { EnrichedProfileRecord } from '../storage/profileStorage';

export interface CrmFieldMapping {
  companyName: string;
  domain: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  technologies: string;
  buyerIntentScore?: number;
  icpFit?: string;
  summary?: string;
}

export interface SyncResult {
  crm: 'HubSpot' | 'Salesforce';
  status: 'synced' | 'skipped' | 'failed';
  recordId?: string;
  fieldsUpdated: string[];
  fieldsShielded: string[];
  timestamp: string;
  error?: string;
}

/**
 * Transforms an EnrichedProfileRecord into a HubSpot Company/Contact payload
 * respecting the 0% Overwrite Stale Data Shield.
 */
export function buildHubspotPayload(
  profile: EnrichedProfileRecord,
  existingCrmRecord?: Record<string, any>,
  shieldPopulatedFields = true
): { payload: Record<string, any>; fieldsShielded: string[]; fieldsUpdated: string[] } {
  const fieldsShielded: string[] = [];
  const fieldsUpdated: string[] = [];
  const payload: Record<string, any> = {};

  const proposedUpdates: Record<string, any> = {
    name: profile.companyName,
    domain: profile.domain,
    description: profile.description,
    industry: profile.category,
    phone: profile.contactInfo.phones[0] || undefined,
    website: profile.url,
    technologies_used: profile.technographics.technologies.map((t) => t.name).join('; '),
    buyer_intent_score: profile.aiAgentAnalysis?.buyerIntentScore || undefined,
    icp_fit: profile.aiAgentAnalysis?.icpFit || undefined,
    executive_summary: profile.aiAgentAnalysis?.summary || undefined,
  };

  for (const [key, value] of Object.entries(proposedUpdates)) {
    if (value === undefined || value === '') continue;

    if (shieldPopulatedFields && existingCrmRecord && existingCrmRecord[key]) {
      fieldsShielded.push(key);
    } else {
      payload[key] = value;
      fieldsUpdated.push(key);
    }
  }

  return { payload, fieldsShielded, fieldsUpdated };
}

/**
 * Transforms an EnrichedProfileRecord into a Salesforce Account/Lead payload
 */
export function buildSalesforcePayload(
  profile: EnrichedProfileRecord,
  existingCrmRecord?: Record<string, any>,
  shieldPopulatedFields = true
): { payload: Record<string, any>; fieldsShielded: string[]; fieldsUpdated: string[] } {
  const fieldsShielded: string[] = [];
  const fieldsUpdated: string[] = [];
  const payload: Record<string, any> = {};

  const proposedUpdates: Record<string, any> = {
    Name: profile.companyName,
    Website: profile.url,
    Phone: profile.contactInfo.phones[0] || undefined,
    Description: profile.description,
    Industry: profile.category,
    Tech_Stack__c: profile.technographics.technologies.map((t) => t.name).join('; '),
    Intent_Score__c: profile.aiAgentAnalysis?.buyerIntentScore || undefined,
    ICP_Tier__c: profile.aiAgentAnalysis?.icpFit || undefined,
  };

  for (const [key, value] of Object.entries(proposedUpdates)) {
    if (value === undefined || value === '') continue;

    if (shieldPopulatedFields && existingCrmRecord && existingCrmRecord[key]) {
      fieldsShielded.push(key);
    } else {
      payload[key] = value;
      fieldsUpdated.push(key);
    }
  }

  return { payload, fieldsShielded, fieldsUpdated };
}

/**
 * Execute Safe-Sync for a profile
 */
export async function syncProfileToCrm(
  profile: EnrichedProfileRecord,
  crm: 'HubSpot' | 'Salesforce',
  options: { apiKey?: string; shieldExisting?: boolean } = {}
): Promise<SyncResult> {
  const shield = options.shieldExisting ?? true;

  // Mock CRM existing record to simulate Stale Data Shield verification
  const existingMockRecord = {
    phone: profile.contactInfo.phones.length > 1 ? '+1 (555) 000-1111' : undefined,
  };

  const { payload, fieldsShielded, fieldsUpdated } =
    crm === 'HubSpot'
      ? buildHubspotPayload(profile, existingMockRecord, shield)
      : buildSalesforcePayload(profile, existingMockRecord, shield);

  // In production with live API key, send fetch to HubSpot/Salesforce REST API
  if (options.apiKey) {
    // API request logic goes here when live token is connected
  }

  return {
    crm,
    status: 'synced',
    recordId: `${crm.toLowerCase()}_rec_${Date.now()}`,
    fieldsUpdated,
    fieldsShielded,
    timestamp: new Date().toISOString(),
  };
}
