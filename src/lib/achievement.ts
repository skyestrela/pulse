// ─── Achievement Engine ──────────────────────────────────────────────
// Transforms raw parsed actions into rich achievement plans.
// Every thought gets: WHY (motivation), HOW (methodology), WHEN (schedule),
// RESOURCES (curated links/tools), and MICRO-STEPS (atomic actions).

export interface MicroStep {
  title: string;
  duration: string;        // e.g. "5 min", "1 hour"
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard';
  detail: string;           // one-line HOW
}

export interface MilestonePlan {
  title: string;
  targetDate: string;       // relative like "Week 1", "Month 2"
  microSteps: MicroStep[];
  outcome: string;          // what you can DO after completing this milestone
}

export interface Resource {
  title: string;
  url: string;
  type: 'course' | 'tool' | 'article' | 'video' | 'app' | 'book' | 'community';
  cost: 'free' | 'freemium' | 'paid';
  pitch: string;             // one-liner why this resource
}

export interface ScheduleBlock {
  when: string;             // e.g. "Every morning 7:00-7:30"
  what: string;
  duration: string;
}

export interface AchievementPlan {
  motivation: string;
  successVision: string;
  methodology: string;
  methodSteps: string[];
  estimatedWeeks: number;
  schedule: ScheduleBlock[];
  bestTimeOfDay: string;
  resources: Resource[];
  milestones: MilestonePlan[];
  pitfalls: string[];
}

// ─── Template Data ────────────────────────────────────────────────────

const SKILL_KEYWORDS: Record<string, {
  motivation: string;
  methodology: string;
  methodSteps: string[];
  bestTime: string;
  schedule: ScheduleBlock[];
  resources: Resource[];
  pitfalls: string[];
  milestones: MilestonePlan[];
}> = {
  piano: {
    motivation: "Playing piano rewires your brain — improved memory, focus, and emotional expression. Studies show 15min/day builds neural pathways faster than any other instrument.",
    methodology: "Sight-reading-first method combined with chord-based learning. You'll play real music from day one, not scales.",
    methodSteps: [
      "Learn 4 chords that unlock 100+ songs immediately",
      "Read treble clef notation before bass (simpler path)",
      "Practice 20min sessions: 5min warm-up, 10min new material, 5min play-along",
      "Record yourself weekly to hear progress you can't feel day-to-day",
    ],
    bestTime: "Morning (7-8 AM) — motor skill consolidation peaks after sleep",
    schedule: [
      { when: "Every morning 7:00", what: "Piano practice", duration: "20 min" },
      { when: "Saturday morning", what: "Record progress + learn one new piece", duration: "45 min" },
    ],
    resources: [
      { title: "Simply Piano", url: "https://www.joytunes.com/simply-piano", type: "app", cost: "freemium", pitch: "Instant feedback on whether you hit the right key — like Guitar Hero for piano" },
      { title: "Pianoforall", url: "https://www.pianoforall.com/", type: "course", cost: "paid", pitch: "Chord-based method that has you playing real songs in days, not months" },
      { title: "Flowkey", url: "https://www.flowkey.com/", type: "app", cost: "freemium", pitch: "Split-screen shows sheet music + hands simultaneously" },
    ],
    pitfalls: [
      "Don't start with classical pieces — learn chords first, they unlock everything",
      "Don't practice for over 30min as a beginner — fatigue creates bad habits",
      "Don't skip recording yourself — your ear improves faster hearing playback",
    ],
    milestones: [
      { title: "Play your first song", targetDate: "Week 1", microSteps: [
        { title: "Learn C, G, Am, F chords", duration: "15 min", difficulty: "easy", detail: "These 4 chords play 90% of popular songs" },
        { title: "Play along with Let It Be", duration: "10 min", difficulty: "easy", detail: "Right hand melody, left hand bass note" },
        { title: "Record yourself playing", duration: "5 min", difficulty: "trivial", detail: "Save baseline for comparison" },
      ], outcome: "You can sit at any piano and play a recognisable song" },
      { title: "Read sheet music", targetDate: "Week 3", microSteps: [
        { title: "Learn treble clef note positions", duration: "15 min", difficulty: "medium", detail: "Every Good Boy Does Fine — FACE" },
        { title: "Sight-read simple melodies", duration: "15 min", difficulty: "medium", detail: "Use flowkey's sight-reading exercises" },
        { title: "Add left hand bass notes", duration: "20 min", difficulty: "medium", detail: "One note at a time, don't rush both hands" },
      ], outcome: "You can learn any song from sheet music without tutorial videos" },
      { title: "Play hands together fluently", targetDate: "Month 2", microSteps: [
        { title: "Hand independence exercise", duration: "10 min/day", difficulty: "hard", detail: "Left hand sustain, right hand melody" },
        { title: "Learn a 2-page piece end-to-end", duration: "30 min", difficulty: "medium", detail: "Build repertoire you can always play" },
        { title: "Perform for one person", duration: "5 min", difficulty: "easy", detail: "Accountability accelerates progress" },
      ], outcome: "You can sight-read and play hands together — the biggest hurdle is crossed" },
    ],
  },
  guitar: {
    motivation: "Guitar is the most social instrument — campfires, open mics, songwriting. 80% of beginners who reach 3 months play for life.",
    methodology: "Chord-first rapid song method. Play real music within 48 hours, theory comes later.",
    methodSteps: [
      "Master 4 chords (G, C, D, Em) that unlock 500+ songs",
      "Practice chord transitions with a 1-minute timer — speed builds muscle memory",
      "Learn strumming patterns by ear, not by counting",
      "Change strings yourself from day one — it's a 5-minute skill",
    ],
    bestTime: "Evening (8-9 PM) — fine motor skills peak and stress relief compounds learning",
    schedule: [
      { when: "Every evening 8:00 PM", what: "Guitar practice", duration: "20 min" },
      { when: "Weekend afternoon", what: "Learn one new song", duration: "45 min" },
    ],
    resources: [
      { title: "JustinGuitar", url: "https://www.justinguitar.com/", type: "course", cost: "free", pitch: "Gold standard free guitar course — structured, honest, no gimmicks" },
      { title: "Fender Tune", url: "https://www.fender.com/apps", type: "app", cost: "free", pitch: "Best free tuner app with chord library" },
    ],
    pitfalls: [
      "Don't start with acoustic if you love rock — get what excites you",
      "Don't practice through pain — calluses take 2 weeks",
      "Don't learn 20 chords — 4 chords play most songs",
    ],
    milestones: [
      { title: "Play your first song", targetDate: "Week 1", microSteps: [
        { title: "Tune guitar + hold correctly", duration: "10 min", difficulty: "trivial", detail: "Use Fender Tune app" },
        { title: "Learn G, C, D, Em chords", duration: "20 min", difficulty: "easy", detail: "These 4 chords = 500+ songs" },
        { title: "Play along with Knockin' on Heaven's Door", duration: "15 min", difficulty: "easy", detail: "G-D-C pattern, just downstrokes" },
      ], outcome: "You can play a recognizable song on guitar" },
      { title: "Smooth chord changes", targetDate: "Month 1", microSteps: [
        { title: "1-minute chord change drill", duration: "5 min/day", difficulty: "medium", detail: "Count clean switches in 60 seconds, beat your score" },
        { title: "Learn basic strumming pattern", duration: "10 min", difficulty: "medium", detail: "Down-down-up-up-down-up is the universal pattern" },
      ], outcome: "You can play along with any 4-chord song on Spotify" },
    ],
  },
  spanish: {
    motivation: "Spanish unlocks conversation with 500M+ people. Bilingual brains show 5-7 year delay in cognitive decline. 3 months of daily practice gets you conversational.",
    methodology: "Comprehensible input + spaced repetition. Understand before you speak, just like children.",
    methodSteps: [
      "Start with the 1,000 most common words (covers 85% of daily conversation)",
      "Watch Spanish TV with Spanish subtitles (not English) — brain learns from context",
      "Speak from day 1 even if wrong — errors are data, not failure",
      "Use spaced repetition flashcards at forgetting-curve intervals",
    ],
    bestTime: "Morning (7-8 AM) — language acquisition peaks in first 2 hours of wakefulness",
    schedule: [
      { when: "Every morning 7:15", what: "Flashcards + new vocab", duration: "15 min" },
      { when: "Lunch break", what: "Spanish podcast or YouTube", duration: "15 min" },
      { when: "Evening", what: "Watch 1 Spanish TV episode", duration: "30 min" },
    ],
    resources: [
      { title: "Anki", url: "https://apps.ankiweb.net/", type: "app", cost: "free", pitch: "Spaced repetition — the scientifically-proven method" },
      { title: "Language Transfer", url: "https://www.languagetransfer.org/", type: "course", cost: "free", pitch: "80 audio lessons that teach you to THINK in Spanish" },
      { title: "Dreaming Spanish", url: "https://www.dreamingspanish.com/", type: "video", cost: "free", pitch: "Comprehensible input — learn like a baby, by understanding" },
    ],
    pitfalls: [
      "Don't study grammar first — learn words, grammar comes naturally",
      "Don't use Duolingo as your main tool — it's a supplement, not a method",
      "Don't wait to feel 'ready' to speak — start on day 3",
    ],
    milestones: [
      { title: "Understand basic Spanish", targetDate: "Week 2", microSteps: [
        { title: "Download Anki + add Top 100 words deck", duration: "10 min", difficulty: "trivial", detail: "100 words = 50% of all Spanish conversation" },
        { title: "Complete 10 Language Transfer lessons", duration: "15 min/day", difficulty: "easy", detail: "Audio course you can do while walking" },
        { title: "Watch 1 Dreaming Spanish video", duration: "15 min", difficulty: "trivial", detail: "You'll understand more than you think" },
      ], outcome: "You can understand simple Spanish sentences" },
      { title: "Conversational basics", targetDate: "Month 1", microSteps: [
        { title: "Learn 300 most common words via Anki", duration: "15 min/day", difficulty: "medium", detail: "20 new cards/day, cumulative practice" },
        { title: "Have first 5-minute conversation", duration: "5 min", difficulty: "hard", detail: "iTalki community tutor ($5-8/hr) or language exchange" },
        { title: "Watch Spanish TV with Spanish subtitles", duration: "30 min", difficulty: "easy", detail: "La Casa de Papel or Elite on Netflix" },
      ], outcome: "You can introduce yourself, order food, and have small talk" },
      { title: "Intermediate fluency", targetDate: "Month 3", microSteps: [
        { title: "Know 1,000 words in Anki", duration: "15 min/day", difficulty: "medium", detail: "85% of daily conversation is now comprehensible" },
        { title: "Think in Spanish for 5 min/day", duration: "5 min", difficulty: "hard", detail: "Narrate your actions internally en español" },
      ], outcome: "You can hold a 30-minute conversation and consume Spanish media" },
    ],
  },
};

const FITNESS_KEYWORDS: Record<string, {
  motivation: string;
  methodology: string;
  methodSteps: string[];
  bestTime: string;
  schedule: ScheduleBlock[];
  resources: Resource[];
  pitfalls: string[];
  milestones: MilestonePlan[];
}> = {
  gym: {
    motivation: "Resistance training is the #1 longevity intervention. Stronger people live longer, think clearer, feel better. 3× per week for 45 minutes is all it takes.",
    methodology: "Progressive overload + compound movements. Start light, add weight weekly, never skip a scheduled session.",
    methodSteps: [
      "Follow a simple 3-day split: Push / Pull / Legs",
      "Track every workout — what gets measured gets improved",
      "Eat protein within 2 hours of each session",
      "Sleep 7+ hours — muscles grow in bed, not in the gym",
    ],
    bestTime: "Late afternoon (5-7 PM) — testosterone and strength peak",
    schedule: [
      { when: "Mon 6:00 PM", what: "Push day (chest, shoulders, triceps)", duration: "45 min" },
      { when: "Wed 6:00 PM", what: "Pull day (back, biceps)", duration: "45 min" },
      { when: "Fri 6:00 PM", what: "Leg day", duration: "45 min" },
    ],
    resources: [
      { title: "StrongLifts 5×5", url: "https://stronglifts.com/", type: "app", cost: "freemium", pitch: "Simplest proven program: 5 exercises, 3 days/week" },
      { title: "JeFit", url: "https://www.jefit.com/", type: "app", cost: "free", pitch: "Best free workout tracker with exercise library" },
    ],
    pitfalls: [
      "Don't start with isolation exercises — compound movements first",
      "Don't skip leg day — squats build full-body strength",
      "Don't compare to day 1 — compare to last week",
    ],
    milestones: [
      { title: "Complete your first week", targetDate: "Week 1", microSteps: [
        { title: "Find a gym or set up home space", duration: "1 hour", difficulty: "easy", detail: "Minimum: dumbbells + bench, or gym membership" },
        { title: "Push workout", duration: "45 min", difficulty: "medium", detail: "Bench press, overhead press, triceps. Light weight, focus form" },
        { title: "Pull workout", duration: "45 min", difficulty: "medium", detail: "Rows, pull-ups (or assisted), bicep curls" },
      ], outcome: "You've completed 3 workouts and can feel which muscles were worked" },
      { title: "Build the habit", targetDate: "Month 1", microSteps: [
        { title: "Never miss a scheduled day for 4 weeks", duration: "45 min × 12", difficulty: "hard", detail: "Consistency > intensity. Show up even if you go light" },
        { title: "Add 2.5kg to each lift weekly", duration: "45 min", difficulty: "easy", detail: "Progressive overload is the only rule that matters" },
        { title: "Take progress photos", duration: "5 min", difficulty: "trivial", detail: "Front + side + back. Monthly changes are dramatic" },
      ], outcome: "Gym feels like a habit, not an effort. You're noticeably stronger." },
    ],
  },
  meditation: {
    motivation: "8 weeks of daily meditation grows gray matter in the prefrontal cortex. You'll think clearer, react calmer, sleep better. 10 minutes is enough.",
    methodology: "Anchor technique: focus on breath. When mind wanders, gently return. That returning IS the exercise.",
    methodSteps: [
      "Same time every day — morning after waking is ideal",
      "Start with 5 minutes, add 1 minute per week",
      "Use a timer, not an app — the simplicity IS the point",
      "Don't judge thoughts — observe them like clouds passing",
    ],
    bestTime: "First thing in morning (6:30-7:00 AM) — before the day's noise fills your mind",
    schedule: [
      { when: "Every morning 6:30 AM", what: "Sit and breathe", duration: "10 min" },
    ],
    resources: [
      { title: "Waking Up", url: "https://www.wakingup.com/", type: "app", cost: "freemium", pitch: "Sam Harris's course — philosophical depth, not just relaxation" },
      { title: "Insight Timer", url: "https://insighttimer.com/", type: "app", cost: "free", pitch: "Largest free meditation library + simple timer" },
    ],
    pitfalls: [
      "Don't chase 'clearing your mind' — noticing thoughts IS meditation",
      "Don't use meditation to fall asleep — stay alert and present",
      "Don't skip because you had a 'bad' session — there's no such thing",
    ],
    milestones: [
      { title: "First 7 consecutive days", targetDate: "Week 1", microSteps: [
        { title: "Set up meditation spot", duration: "5 min", difficulty: "trivial", detail: "Same cushion/chair every day" },
        { title: "5-minute breath focus", duration: "5 min", difficulty: "easy", detail: "Count breaths 1-10, restart at 1" },
        { title: "7 days in a row", duration: "5 min/day", difficulty: "medium", detail: "Set a daily phone reminder" },
      ], outcome: "You can sit still and notice your mind wandering — the foundation skill" },
      { title: "10-minute sessions", targetDate: "Month 1", microSteps: [
        { title: "Increase to 10 minutes", duration: "10 min", difficulty: "easy", detail: "The extra 5 minutes is where real calm emerges" },
        { title: "Try body scan meditation", duration: "10 min", difficulty: "medium", detail: "Scan toes to head, noticing tension without fixing it" },
      ], outcome: "You notice your reactions before acting on them. People see the difference." },
    ],
  },
};

const PROJECT_KEYWORDS: Record<string, {
  motivation: string;
  methodology: string;
  methodSteps: string[];
  bestTime: string;
  schedule: ScheduleBlock[];
  resources: Resource[];
  pitfalls: string[];
  milestones: MilestonePlan[];
}> = {
  'mobile app': {
    motivation: "A mobile app puts your idea in 6 billion pockets. The #1 mistake is building too much — MVP first, iterate from user feedback.",
    methodology: "Lean Startup + Design Sprint: validate before you code, ship a 3-feature MVP in 4 weeks, iterate weekly.",
    methodSteps: [
      "Validate your idea with 5 real people BEFORE writing code",
      "Design on paper first — 5 screens max for MVP",
      "Use React Native or Flutter to ship iOS + Android simultaneously",
      "Launch dirty — if you're not embarrassed by v1, you launched too late",
    ],
    bestTime: "Block 2-hour deep work sessions — coding requires uninterrupted focus",
    schedule: [
      { when: "Weekday mornings 9-11 AM", what: "Deep work: coding", duration: "2 hours" },
      { when: "Weekend", what: "Design + user testing", duration: "2 hours" },
    ],
    resources: [
      { title: "Expo", url: "https://expo.dev/", type: "tool", cost: "free", pitch: "Build native apps with React — deploy to both app stores from one codebase" },
      { title: "Figma", url: "https://www.figma.com/", type: "tool", cost: "free", pitch: "Design your app before coding — professional designs in hours, not days" },
      { title: "Vercel", url: "https://vercel.com/", type: "tool", cost: "free", pitch: "Deploy your API/backend instantly — zero config" },
    ],
    pitfalls: [
      "Don't build features nobody asked for — validate with real users first",
      "Don't spend months designing — paper prototypes work for validation",
      "Don't write your own auth, payments, or infra — use libraries and services",
    ],
    milestones: [
      { title: "Validate your idea", targetDate: "Week 1", microSteps: [
        { title: "Write one sentence: who is this for and what problem does it solve?", duration: "10 min", difficulty: "trivial", detail: "If you can't say it in one sentence, it's not clear enough" },
        { title: "Talk to 5 potential users", duration: "30 min each", difficulty: "medium", detail: "Ask 'how do you solve this today?' — if they don't have a workaround, there's no demand" },
        { title: "Sketch 5 core screens on paper", duration: "1 hour", difficulty: "easy", detail: "Don't use Figma yet — paper forces simplicity" },
      ], outcome: "You know your idea has real demand and you have paper mockups" },
      { title: "Build MVP", targetDate: "Month 1", microSteps: [
        { title: "Set up Expo project + navigation", duration: "2 hours", difficulty: "medium", detail: "npx create-expo-app + React Navigation" },
        { title: "Build the ONE core feature", duration: "1 week", difficulty: "hard", detail: "Resist the urge to add more — one feature done beats five half-done" },
        { title: "Add auth + landing page", duration: "2 days", difficulty: "medium", detail: "Clerk or Supabase auth, simple Vercel landing page" },
      ], outcome: "You have a working app that does one thing well" },
      { title: "Launch v1", targetDate: "Month 2", microSteps: [
        { title: "Get 10 beta testers", duration: "1 week", difficulty: "medium", detail: "Friends, Twitter, Reddit — give them the app for free in exchange for feedback" },
        { title: "Submit to App Store + Play Store", duration: "3 days", difficulty: "medium", detail: "Expo makes this one command: eas submit" },
        { title: "Create launch page + share", duration: "1 day", difficulty: "easy", detail: "Product Hunt, Twitter, relevant subreddits" },
      ], outcome: "Your app is live, real people are using it, and you have feedback to iterate" },
    ],
  },
  podcast: {
    motivation: "Podcasting builds authority in your niche faster than any other medium. 500M+ podcast listeners exist. Your voice is your differentiator.",
    methodology: "Minimum viable podcast: 10 episodes, consistent schedule, one clear niche. Start with your phone, upgrade equipment after episode 5.",
    methodSteps: [
      "Pick ONE niche you can talk about for 50 episodes",
      "Record first 3 episodes before publishing — momentum buffer",
      "Batch record in 2-hour blocks (3 episodes per session)",
      "Quality > quantity. One great episode beats three mediocre ones",
    ],
    bestTime: "Weekend mornings — fresh voice, no background noise",
    schedule: [
      { when: "Saturday morning 10 AM", what: "Record 2-3 episodes", duration: "2 hours" },
      { when: "Sunday evening", what: "Edit + schedule release", duration: "1 hour" },
    ],
    resources: [
      { title: "Riverside.fm", url: "https://riverside.fm/", type: "tool", cost: "freemium", pitch: "Studio-quality remote recording — interview anyone, anywhere" },
      { title: "Descript", url: "https://www.descript.com/", type: "tool", cost: "freemium", pitch: "Edit audio by editing text — removes filler words automatically" },
      { title: "Buzzsprout", url: "https://www.buzzsprout.com/", type: "tool", cost: "freemium", pitch: "Easiest way to distribute to Apple, Spotify, Google Podcasts" },
    ],
    pitfalls: [
      "Don't buy expensive equipment before episode 5 — your phone is enough to start",
      "Don't make episode 1 an 'about me' — lead with value",
      "Don't publish weekly if you can't sustain it — biweekly is fine",
    ],
    milestones: [
      { title: "Launch your podcast", targetDate: "Week 2", microSteps: [
        { title: "Pick your niche + show name", duration: "30 min", difficulty: "easy", detail: "Name should instantly tell people what they'll learn" },
        { title: "Record first 3 episodes", duration: "2 hours each", difficulty: "medium", detail: "Use your phone + a quiet room. Content > audio quality" },
        { title: "Set up hosting + submit to directories", duration: "1 hour", difficulty: "easy", detail: "Buzzsprout makes this one click" },
      ], outcome: "Your podcast is live on Apple Podcasts and Spotify" },
      { title: "Build your audience", targetDate: "Month 2", microSteps: [
        { title: "Publish consistently for 8 weeks", duration: "2 hrs/week", difficulty: "hard", detail: "Consistency is the #1 growth factor" },
        { title: "Get 5 listener reviews", duration: "ongoing", difficulty: "medium", detail: "Ask in every episode — reviews drive discovery" },
        { title: "Interview your first guest", duration: "1 hour", difficulty: "medium", detail: "Guests bring their audience to your show" },
      ], outcome: "You have a growing listener base and a publishing rhythm" },
    ],
  },
};

// ─── Keyword Matching ─────────────────────────────────────────────────

function matchTemplate<T>(text: string, keywords: Record<string, T>): T | null {
  const lower = text.toLowerCase();
  // Try exact keyword match first (longest match wins)
  const sortedKeys = Object.keys(keywords).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) return keywords[key];
  }
  return null;
}

// ─── Fallback Generators ──────────────────────────────────────────────

function generateHabitPlan(text: string): AchievementPlan {
  const lower = text.toLowerCase();
  const action = text.replace(/^(i\s+)?(should|need\s+to|want\s+to|have\s+to|gotta|must|keep\s+forgetting\s+to)\s+/i, '').trim();
  const verb = action.split(' ')[0].toLowerCase();

  return {
    motivation: `Small daily actions compound into massive life changes. 1% better every day = 37× better in a year. The key is showing up, not being perfect.`,
    successVision: `You ${verb} effortlessly, without thinking about it. It's part of who you are now.`,
    methodology: "Habit stacking + implementation intentions. Attach new behavior to an existing routine.",
    methodSteps: [
      `After your current morning routine, immediately ${action}`,
      "Start with the 2-minute version — scale up only after 7 consecutive days",
      "Track streaks — never miss twice in a row",
      "If you forget, do a micro version (30 seconds) to keep the chain alive",
    ],
    estimatedWeeks: 4,
    schedule: [
      { when: "Every morning (after current routine)", what: action, duration: "5 min" },
    ],
    bestTimeOfDay: "Anchor to your first morning habit — willpower is highest",
    resources: [
      { title: "Streaks", url: "https://streaksapp.com/", type: "app", cost: "paid", pitch: "Beautiful habit tracker that motivates through streak counting" },
      { title: "Atomic Habits", url: "https://jamesclear.com/atomic-habits", type: "book", cost: "paid", pitch: "The science of habit formation — tiny changes, remarkable results" },
    ],
    pitfalls: [
      "Don't start with 30 minutes — start with 2 minutes and grow",
      "Don't rely on motivation — rely on your trigger",
      "Don't track more than 3 habits at once",
    ],
    milestones: [
      { title: "7-day streak", targetDate: "Week 1", microSteps: [
        { title: `Define your trigger for "${action}"`, duration: "5 min", difficulty: "trivial", detail: `"After I [existing habit], I will ${action} for 2 minutes"` },
        { title: "Do the 2-minute version 7 days in a row", duration: "2 min/day", difficulty: "medium", detail: "Consistency beats intensity every time" },
      ], outcome: `The trigger-behavior link is forming — it feels weird NOT to ${action}` },
      { title: "30-day habit", targetDate: "Month 1", microSteps: [
        { title: "Increase duration gradually to target", duration: "5-15 min", difficulty: "easy", detail: "Add 1 minute per day until you hit your target" },
        { title: "Never miss twice", duration: "ongoing", difficulty: "hard", detail: "One miss is a slip, two is a trend — stop trends immediately" },
      ], outcome: `${action} is now automatic — you do it without deciding to` },
    ],
  };
}

function generateProjectPlan(text: string): AchievementPlan {
  const lower = text.toLowerCase();
  const goal = text.replace(/^(i\s+)?(want\s+to|need\s+to|going\s+to|plan\s+to|should)\s+/i, '').trim();

  return {
    motivation: `Every ambitious project starts with a single step. The people who succeed aren't the ones with the best ideas — they're the ones who start. Your first version won't be perfect, but it will exist.`,
    successVision: `You've built ${goal} — it's real, people use it, and you're proud of what you created.`,
    methodology: "Progressive project delivery: define the smallest valuable outcome, build it in 2-week sprints, ship fast and iterate.",
    methodSteps: [
      "Define the ONE outcome that would make this project worthwhile",
      "Break it into 3 milestones — first milestone ships in 2 weeks",
      "Work in 2-hour deep focus blocks — no phone, no tabs",
      "Get feedback after every milestone — adjust course early",
    ],
    estimatedWeeks: 8,
    schedule: [
      { when: "Weekday mornings 9-11 AM", what: "Deep work: project focus", duration: "2 hours" },
      { when: "Friday afternoon", what: "Review progress + plan next week", duration: "30 min" },
    ],
    bestTimeOfDay: "Morning — your brain's creative peak is before lunch",
    resources: [
      { title: "Notion", url: "https://notion.so", type: "tool", cost: "free", pitch: "All-in-one workspace for planning, tracking, and documenting" },
      { title: "The Lean Startup", url: "https://theleanstartup.com/", type: "book", cost: "paid", pitch: "Build-measure-learn: the methodology that changed how projects ship" },
    ],
    pitfalls: [
      "Don't try to plan everything upfront — start with milestone 1",
      "Don't work in 30-minute bursts — meaningful progress needs 2+ hour blocks",
      "Don't build in isolation — get feedback after each milestone",
    ],
    milestones: [
      { title: "Define + first step", targetDate: "Week 1", microSteps: [
        { title: "Write one sentence: what does success look like?", duration: "10 min", difficulty: "trivial", detail: "If you can't define it, you can't achieve it" },
        { title: "Break goal into 3 milestones", duration: "30 min", difficulty: "easy", detail: "Each milestone = one tangible outcome" },
        { title: "Complete first micro-step", duration: "2 hours", difficulty: "medium", detail: "Ship something tiny today — momentum > perfection" },
      ], outcome: "You have a clear path and have already started" },
      { title: "Milestone 1 complete", targetDate: "Month 1", microSteps: [
        { title: "Ship milestone 1 deliverable", duration: "2 weeks", difficulty: "hard", detail: "It won't be perfect — it needs to exist" },
        { title: "Get feedback from 3 people", duration: "1 hour", difficulty: "medium", detail: "Real users > your assumptions" },
        { title: "Adjust plan based on feedback", duration: "30 min", difficulty: "easy", detail: "Pivot early, pivot cheap" },
      ], outcome: "You've shipped something real and learned from actual feedback" },
    ],
  };
}

// ─── Main Export ────────────────────────────────────────────────────────

export function generatePlan(text: string, type: 'habit' | 'task' | 'project' | 'reference'): AchievementPlan {
  const lower = text.toLowerCase();

  // Try specific templates first
  if (type === 'habit' || type === 'task') {
    const fitnessMatch = matchTemplate(text, FITNESS_KEYWORDS);
    if (fitnessMatch) {
      return {
        ...fitnessMatch,
        successVision: `You ${text.toLowerCase().replace(/^(i\s+)?(should|need|want|have|keep)\s+/i, '')} effortlessly, without thinking about it. It's part of who you are now.`,
        estimatedWeeks: 4,
        bestTimeOfDay: fitnessMatch.bestTime,
      };
    }
    const skillMatch = matchTemplate(text, SKILL_KEYWORDS);
    if (skillMatch) {
      return {
        ...skillMatch,
        successVision: `You can confidently ${text.toLowerCase().replace(/^(i\s+)?(should|need|want|have|keep)\s+/i, '')} — it's become second nature, and you enjoy it.`,
        estimatedWeeks: 12,
        bestTimeOfDay: skillMatch.bestTime,
      };
    }
    return generateHabitPlan(text);
  }

  if (type === 'project') {
    // Skills like learning instruments/languages are classified as projects
    const skillMatch = matchTemplate(text, SKILL_KEYWORDS);
    if (skillMatch) {
      return {
        ...skillMatch,
        successVision: `You can confidently ${text.toLowerCase().replace(/^(i\s+)?(should|need|want|have|keep)\s+/i, '')} — it's become second nature, and you enjoy it.`,
        estimatedWeeks: 12,
        bestTimeOfDay: skillMatch.bestTime,
      };
    }
    const fitnessMatch = matchTemplate(text, FITNESS_KEYWORDS);
    if (fitnessMatch) {
      return {
        ...fitnessMatch,
        successVision: `You ${text.toLowerCase().replace(/^(i\s+)?(should|need|want|have|keep)\s+/i, '')} effortlessly, without thinking about it. It's part of who you are now.`,
        estimatedWeeks: 4,
        bestTimeOfDay: fitnessMatch.bestTime,
      };
    }
    const projectMatch = matchTemplate(text, PROJECT_KEYWORDS);
    if (projectMatch) {
      return {
        ...projectMatch,
        successVision: `You've launched ${text.toLowerCase().replace(/^(i\s+)?(want|need|plan)\s+to\s+/i, '')} — it's real, people are using it, and you're proud of what you built.`,
        estimatedWeeks: 8,
        bestTimeOfDay: projectMatch.bestTime,
      };
    }
    return generateProjectPlan(text);
  }

  // Default fallback for reference/unknown
  return generateHabitPlan(text);
}