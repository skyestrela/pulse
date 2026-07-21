// ─── Thought Parser ─────────────────────────────────────────────────
// Rule-based classifier that turns free-text thoughts into structured actions.
// No AI needed — deterministic, instant, works offline.

import type { ActionType, HabitFrequency } from './store';

export interface ParsedAction {
  type: ActionType;
  title: string;
  description?: string;
  icon: string;
  schedule?: string;
  frequency?: HabitFrequency;
  trigger?: string;
  deadline?: string;
  milestones?: { title: string; done: boolean }[];
}

// ─── Pattern Matchers ────────────────────────────────────────────────

const HABIT_PATTERNS: { re: RegExp; frequency: HabitFrequency; trigger?: string }[] = [
  { re: /every\s+day|daily|each\s+day/i, frequency: 'daily' },
  { re: /every\s+morning|mornings?|each\s+morning/i, frequency: 'daily', trigger: 'morning' },
  { re: /every\s+night|evenings?|each\s+evening|before\s+bed/i, frequency: 'daily', trigger: 'before bed' },
  { re: /every\s+weekday|weekdays|mon\s+to\s+fri/i, frequency: 'weekdays' },
  { re: /(\d+)\s*times?\s*a?\s*week|\d+x\s*a?\s*week|[2-6]x\/week/i, frequency: '3x-week' },
  { re: /every\s+week|weekly|once\s+a\s+week/i, frequency: 'weekly' },
  { re: /keep\s+forgetting\s+to|always\s+forget|should\s+remember\s+to|need\s+to\s+remember/i, frequency: 'daily' },
  { re: /make\s+(?:it\s+)?a\s+habit|build\s+(?:a\s+)?habit|start\s+(?:a\s+)?(?:daily\s+)?routine/i, frequency: 'daily' },
  { re: /after\s+(.+?)[,.]?\s+(?:i\s+)?(?:will|want|should|need|gonna)/i, frequency: 'daily' },
];

const PROJECT_PATTERNS: { re: RegExp; template: string }[] = [
  { re: /learn\s+(?:to\s+)?(?:play\s+)?(?:the\s+)?(\w*\s*(?:guitar|piano|drums|ukulele|violin|bass|flute))/i, template: 'instrument' },
  { re: /learn\s+(?:to\s+)?(?:speak|read|write)?\s*(spanish|french|german|japanese|mandarin|italian|portuguese|korean|chinese|russian|arabic|dutch|hindi)/i, template: 'language' },
  { re: /learn\s+(?:to\s+)?(?:code|program|develop)\s*(?:in\s+)?(.+)|learn\s+(.+?\s*(?:programming|coding|development))/i, template: 'coding' },
  { re: /(?:run|train\s+for|prepare\s+for)\s+(?:a\s+)?(?:marathon|half.?marathon|5k|10k|triathlon|ultra)/i, template: 'fitness' },
  { re: /(?:start|build|launch|ship|create|make)\s+(?:a\s+)?(?:side\s+)?(?:project|startup|app|product|business|company|saaS)/i, template: 'project' },
  { re: /(?:write|author|finish|publish)\s+(?:a\s+)?(?:book|novel|memoir|guide|blog|ebook)/i, template: 'writing' },
  { re: /lose\s+(\d+)\s*(?:lbs?|pounds?|kg|kilos)|get\s+(?:fit|ripped|in\s+shape|shredded)/i, template: 'fitness' },
  { re: /(?:save|build)\s+(?:up\s+)?(?:an?\s+)?(?:emergency|rainy\s+day)\s+fund|save\s+\$?\d/i, template: 'savings' },
];

const TASK_PATTERNS: { re: RegExp; extract: (m: RegExpMatchArray) => { title: string; deadline?: string } }[] = [
  { re: /(?:need|have|must|should|gotta|got)\s+to\s+(.+?)(?:\s+by\s+(.+?))?$/i, extract: (m) => ({ title: m[1].replace(/[.!]+$/, ''), deadline: m[2] }) },
  { re: /(?:remind|don'?t forget)\s+(?:me\s+)?to\s+(.+?)(?:\s+by\s+(.+?))?$/i, extract: (m) => ({ title: m[1].replace(/[.!]+$/, ''), deadline: m[2] }) },
  { re: /(?:file|submit|send|pay|book|schedule|call|email|message|text|meet|visit|check|review|fix|finish|complete|do)\s+(.+?)(?:\s+by\s+(.+?))?$/i, extract: (m) => ({ title: m[0].replace(/[.!]+$/, ''), deadline: m[2] }) },
];

const DATE_KEYWORDS: Record<string, string> = {
  'today': new Date().toISOString().split('T')[0],
  'tomorrow': new Date(Date.now() + 86400000).toISOString().split('T')[0],
  'next week': new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  'next month': new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  'january': `${new Date().getFullYear()}-01-31`,
  'february': `${new Date().getFullYear()}-02-28`,
  'march': `${new Date().getFullYear()}-03-31`,
  'april': `${new Date().getFullYear()}-04-30`,
  'june': `${new Date().getFullYear()}-06-30`,
  'july': `${new Date().getFullYear()}-07-31`,
  'august': `${new Date().getFullYear()}-08-31`,
  'september': `${new Date().getFullYear()}-09-30`,
  'october': `${new Date().getFullYear()}-10-31`,
  'november': `${new Date().getFullYear()}-11-30`,
  'december': `${new Date().getFullYear()}-12-31`,
};

// ─── Milestone Templates ─────────────────────────────────────────────

const MILESTONE_TEMPLATES: Record<string, string[]> = {
  instrument: [
    'Get the instrument and basic accessories',
    'Learn the parts and how to hold it',
    'Master first 5 notes/finger positions',
    'Play simple scales in time',
    'Learn 3 basic chords/positions',
    'Play along with a metronome at 80 BPM',
    'Learn your first full song',
    'Practice chord transitions smoothly',
    'Play along with a backing track',
    'Record yourself and review progress',
  ],
  language: [
    'Set up a learning routine (15 min/day)',
    'Learn the alphabet and pronunciation',
    'Master 100 most common words',
    'Build basic sentence structures',
    'Have a 2-minute conversation',
    'Understand a children\'s TV episode',
    'Read a simple article without dictionary',
    'Write a 100-word journal entry',
    'Hold a 5-minute conversation',
    'Pass A2-level assessment',
  ],
  coding: [
    'Set up development environment',
    'Complete "Hello World" and basics',
    'Learn core syntax and data types',
    'Build a simple calculator/to-do app',
    'Understand functions and modules',
    'Work with APIs and external data',
    'Build a multi-feature project',
    'Write tests for your code',
    'Deploy a project publicly',
    'Contribute to an open-source project',
  ],
  fitness: [
    'Get a physical and set baseline metrics',
    'Complete Week 1 training schedule',
    'Run/walk 3 miles continuously',
    'Complete Month 1 training block',
    'Run 5 miles at training pace',
    'Complete Month 2 training block',
    'Run 10 miles at comfortable pace',
    'Taper and rest week',
    'Race day!',
  ],
  project: [
    'Validate idea with 5 potential users',
    'Design MVP wireframes',
    'Build core feature (v0.1)',
    'Create landing page',
    'Get 10 beta testers',
    'Iterate based on feedback',
    'Launch v1.0 publicly',
  ],
  writing: [
    'Decide on topic and outline',
    'Write first chapter/draft',
    'Establish daily writing habit (500 words)',
    'Complete first half',
    'Complete full first draft',
    'Self-edit and revise',
    'Get feedback from 3 readers',
    'Final polish and formatting',
    'Publish/submit',
  ],
  savings: [
    'Calculate total savings goal (3 months expenses)',
    'Open a high-yield savings account',
    'Set up automatic transfers',
    'Save first month\'s expenses',
    'Save second month\'s expenses',
    'Save third month\'s expenses',
    'Review and adjust plan quarterly',
  ],
};

// ─── Icon Selection ──────────────────────────────────────────────────

const HABIT_ICONS: [RegExp, string][] = [
  [/meditat|mindful|breath|zen/i, '🧘'],
  [/water|hydrat|drink/i, '💧'],
  [/read|book|study|learn/i, '📖'],
  [/exercise|workout|gym|run|walk|stretch/i, '💪'],
  [/journal|write|diary/i, '📝'],
  [/sleep|bed|rest/i, '😴'],
  [/eat|cook|meal|food|lunch|dinner|breakfast/i, '🍳'],
  [/plant|garden/i, '🌿'],
  [/music|guitar|piano|instrument|sing/i, '🎵'],
  [/code|program|develop/i, '💻'],
  [/pray|spiritual|gratitude/i, '🙏'],
  [/clean|tidy|organize/i, '🧹'],
  [/call|phone|text|message|email/i, '📱'],
  [/save|budget|money|finance/i, '💰'],
];

const TASK_ICONS: [RegExp, string][] = [
  [/tax|account|finance|bank/i, '📋'],
  [/meet|call|standup|sync/i, '👥'],
  [/review|check|audit|inspect/i, '🔍'],
  [/submit|send|file|apply/i, '📤'],
  [/fix|repair|debug|patch/i, '🔧'],
  [/buy|order|shop|purchase/i, '🛒'],
  [/book|schedule|appoint/i, '📅'],
  [/pay|bill|invoice/i, '💳'],
];

function pickIcon(text: string, iconList: [RegExp, string][], fallback: string): string {
  for (const [re, icon] of iconList) {
    if (re.test(text)) return icon;
  }
  return fallback;
}

// ─── Main Parser ─────────────────────────────────────────────────────

export function parseThought(raw: string): ParsedAction[] {
  const text = raw.trim();
  if (!text) return [];

  const results: ParsedAction[] = [];

  // Split on sentences to handle compound thoughts
  const sentences = text
    .replace(/,\s*(?:and|also)\s+/gi, '. ') // "X, and Y" → "X. Y"
    .replace(/\s+and\s+/gi, '. ')           // "X and Y" → "X. Y"
    .split(/[.!]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const sentence of sentences) {
    const parsed = parseSingleSentence(sentence);
    if (parsed) results.push(parsed);
  }

  // If nothing matched, create a generic task
  if (results.length === 0) {
    results.push({
      type: 'task',
      title: text.length > 60 ? text.slice(0, 57) + '...' : text,
      icon: pickIcon(text, TASK_ICONS, '📌'),
      schedule: 'Today',
    });
  }

  return results;
}

function parseSingleSentence(sentence: string): ParsedAction | null {
  // ── URL check ──
  if (/https?:\/\/\S+/i.test(sentence)) {
    return {
      type: 'reference',
      title: sentence.replace(/^(?:check|look at|save|read|bookmark|visit)\s+/i, '').trim(),
      icon: '🔗',
      description: sentence,
    };
  }

  // ── Project patterns ──
  for (const { re, template } of PROJECT_PATTERNS) {
    const match = sentence.match(re);
    if (match) {
      const subject = match[1] || match[2] || match[0];
      const milestones = MILESTONE_TEMPLATES[template] || MILESTONE_TEMPLATES['project'];

      // Extract deadline if present
      let deadline: string | undefined;
      for (const [kw, date] of Object.entries(DATE_KEYWORDS)) {
        if (sentence.toLowerCase().includes(kw)) { deadline = date; break; }
      }

      return {
        type: 'project',
        title: sentence.replace(/[.!]+$/, '').trim(),
        icon: pickIcon(sentence, HABIT_ICONS, '🎯'),
        milestones: milestones.map((m) => ({ title: m, done: false })),
        deadline,
      };
    }
  }

  // ── Habit patterns ──
  for (const { re, frequency, trigger } of HABIT_PATTERNS) {
    if (re.test(sentence)) {
      // Extract the habit action
      let title = sentence
        .replace(/^(?:i\s+)?(?:keep\s+forgetting\s+to|always\s+forget\s+to|should\s+remember\s+to|need\s+to\s+remember\s+to|need\s+to|should|want\s+to|i\s+should|i\s+need\s+to|let'?s|gotta|got\s+to|have\s+to|must)\s+/i, '')
        .replace(/\s+every\s+(?:day|morning|night|evening|weekday|week)/i, '')
        .replace(/\s+daily/i, '')
        .replace(/[.!]+$/, '')
        .trim();

      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);

      if (title.length < 3) title = sentence.replace(/[.!]+$/, '').trim();

      // Extract trigger from "after X" patterns
      let habitTrigger = trigger;
      const afterMatch = sentence.match(/after\s+(.+?)(?:[,.]|\s+(?:i\s+)?(?:will|want|should|need|gonna))/i);
      if (afterMatch) habitTrigger = afterMatch[1].trim();

      return {
        type: 'habit',
        title,
        icon: pickIcon(title, HABIT_ICONS, '✅'),
        frequency,
        trigger: habitTrigger,
        schedule: habitTrigger ? `After ${habitTrigger}` : frequency === 'daily' ? 'Every day' : frequency === 'weekdays' ? 'Mon–Fri' : frequency === '3x-week' ? '3× per week' : 'Once a week',
      };
    }
  }

  // ── Task patterns ──
  for (const { re, extract } of TASK_PATTERNS) {
    const match = sentence.match(re);
    if (match) {
      const { title, deadline } = extract(match);

      // Resolve deadline keywords
      let resolvedDeadline = deadline;
      if (deadline) {
        for (const [kw, date] of Object.entries(DATE_KEYWORDS)) {
          if (deadline.toLowerCase().includes(kw)) { resolvedDeadline = date; break; }
        }
      }

      return {
        type: 'task',
        title: title.charAt(0).toUpperCase() + title.slice(1),
        icon: pickIcon(title, TASK_ICONS, '📌'),
        schedule: deadline ? `Due ${deadline}` : 'Today',
        deadline: resolvedDeadline,
      };
    }
  }

  // ── Fallback: simple action detection ──
  const actionWords = /^(?:i\s+)?(?:want|need|should|must|will|plan|hope|gonna|going\s+to|gotta|have\s+to|let'?s)\s+/i;
  if (actionWords.test(sentence)) {
    const title = sentence.replace(actionWords, '').replace(/[.!]+$/, '').trim();
    if (title.length > 2) {
      return {
        type: 'task',
        title: title.charAt(0).toUpperCase() + title.slice(1),
        icon: pickIcon(title, TASK_ICONS, '📌'),
        schedule: 'Today',
      };
    }
  }

  return null;
}