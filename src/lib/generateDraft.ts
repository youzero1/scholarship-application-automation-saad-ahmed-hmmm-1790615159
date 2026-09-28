import type { Profile, Scholarship } from '@/types/database';

const GOAL_SENTENCES: Record<string, string> = {
  fund_first_year:
    'My immediate aim is to get my first year fully funded, so that the hardest part of starting is the coursework and not the invoice.',
  cover_tuition_gap:
    'My aim is to close the gap between the aid I have been offered and what my education actually costs, so that the shortfall never becomes the reason I stop.',
  graduate_debt_free:
    'My aim is to graduate without debt, stacking awards year over year so that the decisions I make after graduation are driven by ambition rather than repayment.',
  support_my_students:
    'My aim is to make this process navigable for the students I support, so that funding reaches the people who have already done the hard work of qualifying for it.',
};

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function openingLine(profile: Profile | null, s: Scholarship) {
  const name = profile?.full_name?.trim();
  const major = profile?.major?.trim();
  const school = profile?.school?.trim();

  if (name && major && school) {
    return `My name is ${name}. I study ${major} at ${school}, and I am applying for the ${s.name} because the work ${s.sponsor} funds is the work I want to spend my career on.`;
  }
  if (name && school) {
    return `My name is ${name}, and I am a student at ${school} applying for the ${s.name}.`;
  }
  if (name) {
    return `My name is ${name}, and I am applying for the ${s.name} offered by ${s.sponsor}.`;
  }
  return `I am applying for the ${s.name} because what ${s.sponsor} supports lines up precisely with what I am building toward.`;
}

function backgroundParagraph(profile: Profile | null) {
  const bits: string[] = [];
  if (profile?.gpa != null) {
    bits.push(`I currently hold a ${profile.gpa.toFixed(2)} GPA`);
  }
  if (profile?.grad_year) {
    bits.push(`and I graduate in ${profile.grad_year}`);
  }
  if (profile?.state) {
    bits.push(`I have done that work in ${profile.state}`);
  }

  const academic = bits.length
    ? sentenceCase(bits.join(' ').replace(/\s+I have/, '. I have')) + '.'
    : 'I have built my record through consistent coursework and the projects I chose outside of it.';

  const activities = profile?.activities?.trim()
    ? ` Outside the classroom, ${profile.activities.trim().replace(/\.$/, '')}.`
    : ' Outside the classroom, I have taken on the responsibilities that were available to me and treated them as practice for larger ones.';

  return academic + activities;
}

function highlightsParagraph(profile: Profile | null, s: Scholarship) {
  if (profile?.essay_highlights?.trim()) {
    return `${profile.essay_highlights.trim().replace(/\.$/, '')}. That experience is the clearest evidence I can offer of why the ${s.name} would not be wasted on me.`;
  }
  const major = profile?.major?.trim();
  return major
    ? `What draws me to ${major} is not the credential but the problems it lets me touch. I want to work on the ones that are unglamorous and consequential, and I have chosen my classes, projects and jobs on that basis.`
    : 'I have chosen my classes, projects and jobs on the basis of what they let me build rather than how they look on paper, and I intend to keep making decisions that way.';
}

export interface GeneratedDraft {
  content: string;
  wordCount: number;
}

/**
 * Deterministic personalised draft generator. The module boundary is the contract:
 * swap this implementation for a model-backed one and no UI changes are required.
 */
export function generateDraft(profile: Profile | null, s: Scholarship): GeneratedDraft {
  const goalSentence =
    (profile?.goal && GOAL_SENTENCES[profile.goal]) ||
    'My aim is to finish my education with the freedom to choose work on its merit rather than its salary.';

  const paragraphs = [
    `Prompt: ${s.prompt}`,
    openingLine(profile, s),
    backgroundParagraph(profile),
    highlightsParagraph(profile, s),
    `${goalSentence} The ${s.name} would move that from a plan into a schedule.`,
    `Thank you for reading, and for the fact that ${s.sponsor} funds this award at all. If it is awarded to me, I will spend it the way I have spent everything else that got me here — carefully, and in public.`,
  ];

  const content = paragraphs.join('\n\n');
  return { content, wordCount: content.split(/\s+/).filter(Boolean).length };
}
