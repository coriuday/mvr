export type LeadStatus = "NEW" | "CONTACTED" | "IN_PROGRESS" | "CONVERTED" | "REJECTED";
export type LeadSource = "WEBSITE" | "REFERRAL" | "SOCIAL_MEDIA" | "PHONE_CALL" | "WALK_IN" | "OTHER";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: LeadStatus;
  source: LeadSource;
  country_interest?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  country_interest?: string;
  source?: LeadSource;
}
