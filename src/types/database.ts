export type Plan = 'free' | 'pro' | 'scale';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'awarded'
  | 'rejected';

export type ScholarshipLevel = 'high_school' | 'undergrad' | 'graduate' | 'any';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  school: string | null;
  grad_year: number | null;
  gpa: number | null;
  major: string | null;
  state: string | null;
  activities: string | null;
  essay_highlights: string | null;
  goal: string | null;
  primary_use_case: string | null;
  plan: Plan;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  id: string;
  name: string;
  sponsor: string;
  description: string;
  amount_cents: number;
  deadline: string;
  min_gpa: number | null;
  major_tags: string[] | null;
  state: string | null;
  level: ScholarshipLevel;
  prompt: string;
  url: string | null;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: ApplicationStatus;
  draft_content: string | null;
  notes: string | null;
  submitted_at: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLead {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}
