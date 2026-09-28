import type { Profile, Scholarship } from '@/types/database';
import { daysUntil } from '@/lib/utils';

export interface MatchResult {
  scholarship: Scholarship;
  score: number;
  reasons: string[];
  blockers: string[];
}

function normalise(value: string) {
  return value.trim().toLowerCase();
}

function levelLabel(level: Scholarship['level']) {
  switch (level) {
    case 'high_school':
      return 'high school students';
    case 'undergrad':
      return 'undergraduates';
    case 'graduate':
      return 'graduate students';
    default:
      return 'any level';
  }
}

/**
 * Deterministic client-side match scoring. Kept free of React and Supabase so a
 * model-backed ranker can replace it without touching the UI.
 */
export function scoreScholarship(profile: Profile | null, s: Scholarship): MatchResult {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 40; // baseline: it is in the catalogue and open

  // GPA
  if (s.min_gpa != null) {
    if (profile?.gpa != null) {
      if (profile.gpa >= s.min_gpa) {
        score += 18;
        reasons.push(`Your ${profile.gpa.toFixed(2)} GPA clears the ${s.min_gpa} minimum`);
      } else {
        score -= 30;
        blockers.push(`Needs a ${s.min_gpa} GPA — yours is ${profile.gpa.toFixed(2)}`);
      }
    } else {
      blockers.push(`Requires a ${s.min_gpa} GPA — add yours to confirm eligibility`);
    }
  } else {
    score += 6;
    reasons.push('No GPA requirement');
  }

  // Major tags
  const tags = s.major_tags ?? [];
  if (tags.length > 0) {
    const major = profile?.major ? normalise(profile.major) : null;
    const hit = major
      ? tags.find((t) => normalise(t) === major || major.includes(normalise(t)) || normalise(t).includes(major))
      : undefined;
    if (hit) {
      score += 20;
      reasons.push(`Matches your ${profile?.major} focus`);
    } else if (major) {
      score -= 8;
    }
  } else {
    score += 8;
    reasons.push('Open to every field of study');
  }

  // State
  if (s.state) {
    if (profile?.state && normalise(profile.state) === normalise(s.state)) {
      score += 14;
      reasons.push(`Reserved for students in ${s.state}`);
    } else {
      score -= 25;
      blockers.push(`Limited to ${s.state} residents`);
    }
  } else {
    score += 5;
    reasons.push('Open nationwide');
  }

  // Level
  if (s.level !== 'any') {
    const gradYear = profile?.grad_year ?? null;
    const currentYear = new Date().getFullYear();
    const looksHighSchool = gradYear != null && gradYear >= currentYear;
    const inferred: Scholarship['level'] = looksHighSchool ? 'high_school' : 'undergrad';
    if (inferred === s.level) {
      score += 10;
      reasons.push(`Written for ${levelLabel(s.level)}`);
    } else {
      score -= 6;
    }
  }

  // Deadline proximity — soon is urgent but still valuable, closed is dead.
  const days = daysUntil(s.deadline);
  if (days < 0) {
    score = 0;
    blockers.push('Deadline has passed');
  } else if (days <= 14) {
    score += 6;
    reasons.push(`Closing in ${days} day${days === 1 ? '' : 's'}`);
  } else if (days <= 45) {
    score += 4;
    reasons.push(`Deadline in ${days} days`);
  }

  return {
    scholarship: s,
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons: reasons.slice(0, 3),
    blockers,
  };
}

export function rankScholarships(profile: Profile | null, list: Scholarship[]): MatchResult[] {
  return list
    .map((s) => scoreScholarship(profile, s))
    .sort((a, b) => b.score - a.score || daysUntil(a.scholarship.deadline) - daysUntil(b.scholarship.deadline));
}
