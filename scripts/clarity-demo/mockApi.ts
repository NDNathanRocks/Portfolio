/* eslint-disable @typescript-eslint/no-explicit-any */
// Demo-mode network layer for the portfolio build of Clarity.
//
// The real app talks to a Django REST API (and the Claude API through it). For the portfolio the same
// React Native app is exported for the web and its axios instance is given this adapter instead, so every
// request is answered inside the browser: no server, no API key, nothing leaves the page.
// AI endpoints (estimate, breakdown, chat, summaries) are rule-based stand-ins, not Claude.
import AsyncStorage from '@react-native-async-storage/async-storage';

type Status = 'pending' | 'in_progress' | 'done' | 'overdue';
type Priority = 'low' | 'medium' | 'high';

interface TaskRec {
  id: number;
  parent_task: number | null;
  title: string;
  description: string;
  estimated_duration_minutes: number;
  ai_friendly_message: string;
  status: Status;
  priority: Priority;
  location: string | null;
  order: number;
  scheduled_date: string | null;
  scheduled_time: string | null; // HH:MM:SS
  calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface EventRec {
  id: number;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  color: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localIso = (d: Date) => `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
const nowIso = () => new Date().toISOString();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const at = (dayOffset: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
};
const hhmmss = (t: string) => (t.length === 5 ? `${t}:00` : t);

// ---------------------------------------------------------------------------------------------
// In-memory state (resets when the demo is reloaded)
// ---------------------------------------------------------------------------------------------
const DEMO_USER = { id: 1, username: 'demo', email: 'demo@clarity.app', first_name: 'Demo', last_name: 'User' };

let nextTaskId = 1;
let nextEventId = 1;
const tasks: TaskRec[] = [];
const events: EventRec[] = [];
let memory: any = {
  id: 1,
  work_patterns: { work_style: 'Short focused bursts' },
  communication_style: 'Warm and encouraging',
  task_categories: {},
  performance_metrics: {},
  context_summary: '',
  onboarding_completed: true,
  onboarding_data: {},
  ai_summary: '',
  ai_summary_updated: nowIso(),
  created_at: nowIso(),
  updated_at: nowIso(),
};
let user = { ...DEMO_USER };

function addEvent(title: string, start: Date, minutes: number, color = '#6366f1', description = '', location = ''): EventRec {
  const e: EventRec = { id: nextEventId++, title, description, location, start, end: new Date(start.getTime() + minutes * 60000), color };
  events.push(e);
  return e;
}

function addTask(p: Partial<TaskRec> & { title: string }): TaskRec {
  const t: TaskRec = {
    id: nextTaskId++,
    parent_task: null,
    description: '',
    estimated_duration_minutes: 30,
    ai_friendly_message: '',
    status: 'pending',
    priority: 'medium',
    location: null,
    order: 0,
    scheduled_date: null,
    scheduled_time: null,
    calendar_event_id: null,
    created_at: nowIso(),
    updated_at: nowIso(),
    completed_at: null,
    ...p,
  };
  tasks.push(t);
  return t;
}

function schedule(t: TaskRec, day: Date): EventRec {
  const start = new Date(day);
  const end = new Date(start.getTime() + t.estimated_duration_minutes * 60000);
  const existing = t.calendar_event_id ? events.find((e) => `app-${e.id}` === t.calendar_event_id) : undefined;
  let ev = existing;
  if (ev) {
    ev.start = start;
    ev.end = end;
  } else {
    ev = addEvent(`🎯 ${t.title}`, start, t.estimated_duration_minutes, '#6366f1', `Task: ${t.title}\nEstimated duration: ${t.estimated_duration_minutes} min`);
    t.calendar_event_id = `app-${ev.id}`;
  }
  t.scheduled_date = ymd(start);
  t.scheduled_time = `${pad(start.getHours())}:${pad(start.getMinutes())}:00`;
  t.updated_at = nowIso();
  return ev;
}

function seed() {
  const report = addTask({
    title: 'Write the weekly project update',
    estimated_duration_minutes: 90,
    priority: 'high',
    ai_friendly_message: "Updates feel big until they're broken up. Ninety minutes, in three small steps.",
  });
  [
    ['Pull this week’s numbers', 25],
    ['Draft the summary', 40],
    ['Review and send', 25],
  ].forEach(([title, mins], i) =>
    addTask({ title: title as string, parent_task: report.id, order: i, estimated_duration_minutes: mins as number, ai_friendly_message: 'Small step, big relief.' }),
  );
  schedule(report, at(0, 14, 0));

  const groceries = addTask({
    title: 'Grocery run',
    estimated_duration_minutes: 50,
    priority: 'medium',
    location: 'Save-On-Foods',
    ai_friendly_message: 'Fifty minutes including the walk. Bring a bag!',
  });
  schedule(groceries, at(1, 17, 30));

  addTask({
    title: 'Book dentist appointment',
    estimated_duration_minutes: 10,
    priority: 'low',
    ai_friendly_message: 'Ten minutes, tops. Future you says thanks.',
  });

  const laundry = addTask({ title: 'Laundry', estimated_duration_minutes: 30, status: 'done', completed_at: nowIso(), ai_friendly_message: 'Done and dusted!' });
  schedule(laundry, at(0, 8, 0));


  addEvent('Team stand-up', at(0, 9, 30), 30, '#10b981');
  addEvent('Lunch with Sam', at(0, 12, 15), 60, '#f59e0b', '', 'Gastown');
  addEvent('Gym', at(1, 7, 0), 60, '#10b981');
  addEvent('Design review', at(2, 11, 0), 45, '#10b981');

  memory.ai_summary = pickSummary();
}

const SUMMARIES = [
  "You're juggling a lot and still moving forward. One small step at a time is plenty today.",
  "Your estimates are getting sharper. Padding time for transitions is working for you.",
  'Two tasks planned, one already done. Take the win and keep the momentum.',
  "Clarity noticed you focus best in short bursts. Let's protect a couple of those today.",
];
let summaryIdx = 0;
function pickSummary() {
  summaryIdx = (summaryIdx + 1) % SUMMARIES.length;
  return SUMMARIES[summaryIdx];
}

// ---------------------------------------------------------------------------------------------
// Serialisers (match the Django serializers)
// ---------------------------------------------------------------------------------------------
function serTask(t: TaskRec): any {
  const subs = tasks.filter((s) => s.parent_task === t.id).sort((a, b) => a.order - b.order || a.id - b.id);
  return { ...t, due_date: null, subtasks: subs.map((s) => serTask(s)) };
}

function serEvent(e: EventRec): any {
  const linked = tasks.find((t) => t.calendar_event_id === `app-${e.id}`);
  return {
    id: `app-${e.id}`,
    title: e.title,
    start: localIso(e.start),
    end: localIso(e.end),
    description: e.description,
    location: e.location,
    source: 'app',
    color: e.color,
    all_day: false,
    priority: linked?.priority ?? null,
    status: linked?.status ?? null,
    task_id: linked?.id ?? null,
  };
}

function serCalendarEvent(e: EventRec): any {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    start_time: localIso(e.start).slice(0, 16),
    end_time: localIso(e.end).slice(0, 16),
    all_day: false,
    color: e.color,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}

// ---------------------------------------------------------------------------------------------
// Rule-based stand-ins for the AI endpoints
// ---------------------------------------------------------------------------------------------
type Cat = { name: string; re: RegExp; mins: number; steps: [string, number][] };
const CATS: Cat[] = [
  { name: 'email', re: /\b(email|e-mail|reply|respond|message|text)\b/i, mins: 15, steps: [] },
  { name: 'call', re: /\b(call|phone|ring)\b/i, mins: 15, steps: [] },
  { name: 'admin', re: /\b(book|appointment|renew|pay|bill|form|apply|register|passport|taxes?)\b/i, mins: 20, steps: [] },
  {
    name: 'cleaning',
    re: /\b(clean|tidy|vacuum|dishes|declutter|organi[sz]e|laundry)\b/i,
    mins: 60,
    steps: [['Clear surfaces and put things away', 0.3], ['Dust and wipe down', 0.3], ['Floors', 0.25], ['Final reset', 0.15]],
  },
  { name: 'shopping', re: /\b(grocer\w*|shop\w*|buy|errands?|pick up)\b/i, mins: 50, steps: [] },
  { name: 'exercise', re: /\b(gym|run|workout|walk|yoga|exercise)\b/i, mins: 45, steps: [] },
  { name: 'cooking', re: /\b(cook|meal|dinner|lunch|bake)\b/i, mins: 50, steps: [] },
  {
    name: 'writing',
    re: /\b(write|essay|report|draft|article|blog|paper|update)\b/i,
    mins: 120,
    steps: [['Gather notes and sources', 0.2], ['Outline the main points', 0.15], ['Write the first draft', 0.4], ['Edit and polish', 0.15], ['Final check and send', 0.1]],
  },
  {
    name: 'study',
    re: /\b(study|revise|homework|assignment|exam|read|learn|course)\b/i,
    mins: 90,
    steps: [['Set up your space', 0.1], ['Skim the material', 0.2], ['Practice and active recall', 0.4], ['Review mistakes', 0.2], ['Quick recap', 0.1]],
  },
  {
    name: 'coding',
    re: /\b(code|debug|implement|deploy|bug|program|refactor)\b/i,
    mins: 90,
    steps: [['Reproduce and scope the problem', 0.2], ['Make the change', 0.45], ['Test it', 0.2], ['Clean up and commit', 0.15]],
  },
  {
    name: 'planning',
    re: /\b(plan|prepare|presentation|slides|trip|budget|party|event)\b/i,
    mins: 75,
    steps: [['List what needs to happen', 0.2], ['Decide the key details', 0.3], ['Book or prepare the essentials', 0.35], ['Double-check everything', 0.15]],
  },
];

function categorise(title: string): Cat {
  const hit = CATS.find((c) => c.re.test(title));
  if (hit) return hit;
  const words = title.trim().split(/\s+/).length;
  return {
    name: 'general',
    re: /$^/,
    mins: Math.min(120, 30 + words * 5),
    steps: [['Get started and gather what you need', 0.25], ['Do the main work', 0.5], ['Wrap up and check', 0.25]],
  };
}

function estimate(title: string) {
  const cat = categorise(title);
  // Time blindness: people underestimate, so pad by about 20% and round to 5 minutes.
  const mins = Math.max(5, Math.round((cat.mins * 1.2) / 5) * 5);
  const friendly = [
    `I'd budget about ${mins} minutes for "${title}". I padded it a little, since things usually take longer than we expect.`,
    `Looks like roughly ${mins} minutes. That includes a small buffer so you're not racing the clock.`,
    `${mins} minutes feels right here, with a cushion for getting started and switching gears.`,
  ];
  return { friendly_message: friendly[title.length % friendly.length], estimate_minutes: mins, task_category: cat.name };
}

function breakdown(title: string) {
  const cat = categorise(title);
  const est = estimate(title).estimate_minutes;
  if (est < 60 || cat.steps.length === 0) {
    return {
      should_break_down: false,
      reasoning: 'This is small enough to tackle in one go.',
      suggested_subtasks: [],
      total_estimated_minutes: est,
      witty_message: "Short and sweet. Let's just do it!",
    };
  }
  const subs = cat.steps.map(([step, frac], i) => {
    const minutes = Math.max(5, Math.round((est * frac) / 5) * 5);
    return {
      title: step,
      description: '',
      estimated_minutes: minutes,
      estimated_duration_minutes: minutes,
      ai_message: ['A gentle start.', 'You can do this part.', 'Nearly there.', 'Almost done.', 'Last stretch.'][i % 5],
    };
  });
  return {
    should_break_down: true,
    reasoning: `"${title}" is a bigger job. Smaller steps make it easier to start and easier to track.`,
    suggested_subtasks: subs,
    total_estimated_minutes: subs.reduce((s, x) => s + x.estimated_minutes, 0),
    witty_message: '✨ The Clarity Breakdown is ready! Big tasks feel smaller in bite-sized pieces.',
  };
}

// Pulls "today / tomorrow / monday" and "at 3pm / 15:30 / noon" out of a sentence.
function parseWhen(text: string): { rest: string; day: Date | null; minutes: number | null } {
  let rest = text;
  let day: Date | null = null;
  let minutes: number | null = null;
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dm = rest.match(/\b(today|tonight|tomorrow|(?:next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday))\b/i);
  if (dm) {
    const w = dm[1].toLowerCase();
    if (w === 'today' || w === 'tonight') day = at(0, 0);
    else if (w === 'tomorrow') day = at(1, 0);
    else {
      const target = days.indexOf(dm[2].toLowerCase());
      const diff = (target - new Date().getDay() + 7) % 7 || 7;
      day = at(diff, 0);
    }
    rest = rest.replace(dm[0], ' ');
  }
  const tm = rest.match(/\b(?:at|@)?\s*(noon|midnight|(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)\b/i);
  if (tm && (tm[1].toLowerCase() === 'noon' || tm[1].toLowerCase() === 'midnight' || tm[4] || tm[3] || /\b(at|@)\s*\d/i.test(tm[0]))) {
    if (/noon/i.test(tm[1])) minutes = 12 * 60;
    else if (/midnight/i.test(tm[1])) minutes = 0;
    else {
      let h = Number(tm[2]);
      const mm = Number(tm[3] ?? 0);
      const ap = tm[4]?.toLowerCase();
      if (ap === 'pm' && h < 12) h += 12;
      if (ap === 'am' && h === 12) h = 0;
      if (!ap && h >= 1 && h <= 7) h += 12; // "at 3" in a to-do list means the afternoon
      if (h < 24 && mm < 60) minutes = h * 60 + mm;
    }
    if (minutes !== null) rest = rest.replace(tm[0], ' ');
  }
  return { rest: rest.replace(/\b(on|for|by)\s*$/i, '').replace(/\s+/g, ' ').trim(), day, minutes };
}

// Start minutes (every 30 min, 09:00 to 21:00) at which a task of `dur` minutes fits between existing events.
function freeStarts(date: string, dur: number, excludeEventKey: string | null): number[] {
  const toMin = (d: Date) => d.getHours() * 60 + d.getMinutes();
  const busy = events.filter((e) => ymd(e.start) === date && `app-${e.id}` !== excludeEventKey).map((e) => [toMin(e.start), toMin(e.end)]);
  const out: number[] = [];
  for (let s = 9 * 60; s + dur <= 21 * 60; s += 30) if (!busy.some(([a, b]) => s < b && s + dur > a)) out.push(s);
  return out;
}

function chat(message: string): any {
  // The app prefixes messages that reference a task with bracketed context; match on the user's own words.
  const m = (message.split('User message:').pop() ?? message).trim();
  const lower = m.toLowerCase();

  const add = m.match(/^(?:please\s+)?(add|create|remind me to|schedule|put|book)\s+(?:a\s+)?(?:task\s+)?(?:to\s+)?(.+)$/i);
  if (add) {
    const verb = add[1].toLowerCase();
    const when = parseWhen(add[2]);
    const title = when.rest.replace(/[.!]+$/, '').trim() || 'New task';
    const est = estimate(title);
    const t = addTask({ title: title.charAt(0).toUpperCase() + title.slice(1), estimated_duration_minutes: est.estimate_minutes, ai_friendly_message: est.friendly_message });
    // Schedule when the visitor gave a day or time, or used a scheduling verb.
    if (when.day || when.minutes !== null || verb === 'schedule' || verb === 'book') {
      const day = when.day ?? new Date();
      let start = when.minutes;
      if (start === null) {
        const free = freeStarts(ymd(day), t.estimated_duration_minutes, null);
        const nowMin = day.toDateString() === new Date().toDateString() ? new Date().getHours() * 60 + new Date().getMinutes() + 15 : 0;
        start = free.find((s) => s >= nowMin) ?? free[0] ?? 9 * 60;
      }
      const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(start / 60), start % 60, 0, 0);
      schedule(t, d);
      const label = `${d.toDateString() === new Date().toDateString() ? 'today' : ymd(d) === ymd(at(1, 0)) ? 'tomorrow' : d.toLocaleDateString(undefined, { weekday: 'long' })} at ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      return {
        response: `Done. I scheduled "${t.title}" for ${label} (about ${est.estimate_minutes} minutes). It's on your calendar now.`,
        tasks_created: [{ id: t.id, title: t.title, scheduled_date: t.scheduled_date, scheduled_time: t.scheduled_time }],
      };
    }
    return {
      response: `Done. I added "${t.title}" and estimated ${est.estimate_minutes} minutes. Say "schedule ${t.title.toLowerCase()} tomorrow at 3pm" and I'll put it on your calendar.`,
      tasks_created: [{ id: t.id, title: t.title, scheduled_date: null, scheduled_time: null }],
    };
  }
  if (/\b(today|on my plate|schedule|agenda|what('s| is) next)\b/.test(lower)) {
    const today = ymd(new Date());
    const todays = events.filter((e) => ymd(e.start) === today).sort((a, b) => a.start.getTime() - b.start.getTime());
    if (todays.length === 0) return { response: 'Nothing on the calendar today. A good day to pick one small thing and finish it.' };
    const list = todays.map((e) => `• ${pad(e.start.getHours())}:${pad(e.start.getMinutes())} ${e.title}`).join('\n');
    return { response: `Here's your day:\n${list}\n\nWant a heads-up before each one?` };
  }
  if (/\b(how long|estimate|how much time)\b/.test(lower)) {
    const subject = m.replace(/.*(?:how long (?:will|would|does|do|should)?|estimate)\s*/i, '').replace(/[?!.]+$/, '') || 'that';
    const est = estimate(subject);
    return { response: est.friendly_message };
  }
  if (/\b(overwhelm|stress|anxious|stuck|tired|procrastinat|can't start|cant start|focus)\b/.test(lower)) {
    return {
      response:
        "That sounds heavy, and it's okay. Pick the smallest next action, set a 10-minute timer, and stop when it rings if you want. Starting is the hardest part. Want me to break something down for you?",
    };
  }
  if (/\b(hi|hello|hey)\b/.test(lower)) return { response: "Hi! I'm Clarity. I can estimate how long things take, break big tasks into steps, and add tasks for you. Try \"add call the bank\"." };
  if (/\b(thanks|thank you)\b/.test(lower)) return { response: "Anytime. You're doing better than you think." };
  return {
    response:
      "I'm running in demo mode, so my replies are simple. Try \"add buy gifts\", \"how long to write an essay?\", or \"what's on today?\". The real app uses Claude for open-ended chat.",
  };
}

// ---------------------------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------------------------
type Res = [number, any, number?]; // status, body, latency ms

function route(method: string, path: string, body: any): Res {
  let m: RegExpMatchArray | null;

  if (method === 'post' && path === '/login/') {
    user = { ...DEMO_USER, username: body?.username || 'demo' };
    return [200, { token: 'demo-token', user, message: 'Login successful' }, 250];
  }
  if (method === 'post' && path === '/register/') {
    user = { ...DEMO_USER, username: body?.username || 'demo', email: body?.email || '', first_name: body?.first_name || '', last_name: body?.last_name || '' };
    return [201, { token: 'demo-token', user, message: 'User registered successfully' }, 300];
  }
  if (method === 'post' && path === '/logout/') return [200, { message: 'Logout successful' }];

  if (method === 'get' && path === '/profile/') {
    return [
      200,
      { id: 1, user: { ...user, profile_image: null }, has_google_calendar: false, created_at: nowIso(), updated_at: nowIso(), ai_summary: memory.ai_summary || pickSummary(), ai_memory: memory },
      200,
    ];
  }
  if (method === 'patch' && path === '/profile/update/') {
    user = { ...user, ...(body || {}) };
    return [200, { user, message: 'Profile updated' }];
  }
  if (method === 'get' && path === '/calendar/connect/') return [400, { error: 'Google Calendar is turned off in the portfolio demo.' }];

  if (method === 'get' && path === '/calendar/events/') {
    return [200, { events: events.map(serEvent).sort((a, b) => a.start.localeCompare(b.start)), has_google_calendar: false, connected: true }];
  }
  if (method === 'get' && path === '/events/') return [200, events.map(serCalendarEvent)];
  if (method === 'post' && path === '/events/create/') {
    const e = addEvent(body.title || 'Untitled', new Date(body.start_time), 60, body.color || '#6366f1', body.description || '', body.location || '');
    if (body.end_time) e.end = new Date(body.end_time);
    return [201, serCalendarEvent(e)];
  }
  if ((m = path.match(/^\/events\/(\d+)\/delete\/$/)) && method === 'delete') {
    const i = events.findIndex((e) => e.id === Number(m![1]));
    if (i >= 0) events.splice(i, 1);
    tasks.forEach((t) => {
      if (t.calendar_event_id === `app-${m![1]}`) {
        t.calendar_event_id = null;
        t.scheduled_date = null;
        t.scheduled_time = null;
      }
    });
    return [204, { message: 'Event deleted' }];
  }

  if (method === 'get' && path === '/tasks/') return [200, tasks.filter((t) => t.parent_task === null).map(serTask).reverse()];
  if (method === 'post' && path === '/tasks/estimate/') {
    if (!body?.title) return [400, { error: 'Task title is required' }];
    return [200, estimate(body.title), 700];
  }
  if (method === 'post' && path === '/tasks/breakdown/') {
    if (!body?.title) return [400, { error: 'Task title is required' }];
    return [200, breakdown(body.title), 900];
  }
  if (method === 'post' && path === '/tasks/create/') {
    if (!body?.title) return [400, { error: 'Task title is required' }];
    const minutes = body.estimated_duration_minutes ?? body.estimated_minutes ?? 60;
    if (body.parent_task) {
      const parent = tasks.find((t) => t.id === Number(body.parent_task));
      if (!parent) return [404, { error: 'Parent task not found' }];
      const s = addTask({ title: body.title, description: body.description || '', parent_task: parent.id, order: body.order ?? 0, estimated_duration_minutes: minutes, ai_friendly_message: body.ai_message || '' });
      return [201, { task: serTask(s), message: 'Subtask created successfully!' }];
    }
    const parent = addTask({
      title: body.title,
      description: body.description || '',
      estimated_duration_minutes: minutes,
      ai_friendly_message: body.ai_message || '',
      priority: body.priority || 'medium',
      location: body.location || null,
    });
    (body.subtasks || []).forEach((st: any, i: number) =>
      addTask({
        title: st.title || '',
        description: st.description || '',
        parent_task: parent.id,
        order: i,
        estimated_duration_minutes: st.estimated_duration_minutes ?? st.estimated_minutes ?? 30,
        ai_friendly_message: st.ai_message || '',
      }),
    );
    const n = (body.subtasks || []).length;
    return [201, { task: serTask(parent), message: n ? `Created task with ${n} subtasks!` : 'Task created successfully!' }, 250];
  }
  if (method === 'post' && path === '/tasks/feedback/') {
    const t = tasks.find((x) => x.id === Number(body?.task_id));
    if (!t) return [404, { error: 'Task not found' }];
    t.status = 'done';
    t.completed_at = nowIso();
    return [200, { success: true, message: 'Feedback received and task marked complete' }];
  }
  if (method === 'post' && path === '/tasks/find-slots/') {
    const t = tasks.find((x) => x.id === Number(body?.task_id));
    if (!t || !body?.date) return [t ? 400 : 404, { error: t ? 'task_id and date are required' : 'Task not found' }];
    const [y, mo, d] = String(body.date).split('-').map(Number);
    const dayStart = new Date(y, mo - 1, d, 0, 0, 0, 0);
    const busy = events
      .filter((e) => ymd(e.start) === body.date && `app-${e.id}` !== t.calendar_event_id)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((e) => ({ start: `${pad(e.start.getHours())}:${pad(e.start.getMinutes())}`, end: `${pad(e.end.getHours())}:${pad(e.end.getMinutes())}`, title: e.title, type: e.title.startsWith('🎯') ? 'task' : 'event' }));
    const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
    const fmt = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
    const dur = t.estimated_duration_minutes;
    const slots: any[] = [];
    for (let start = 9 * 60; start + dur <= 21 * 60 && slots.length < 5; start += 30) {
      if (!busy.some((b) => start < toMin(b.end) && start + dur > toMin(b.start))) slots.push({ start_time: fmt(start), end_time: fmt(start + dur), duration_minutes: dur });
    }
    void dayStart;
    if (slots.length === 0) slots.push({ start_time: '07:00', end_time: fmt(7 * 60 + dur), duration_minutes: dur });
    return [200, { task_id: t.id, date: body.date, task_duration: dur, available_slots: slots, busy_periods: busy }, 350];
  }
  if (method === 'post' && (path === '/tasks/schedule/' || path === '/tasks/reschedule/')) {
    const t = tasks.find((x) => x.id === Number(body?.task_id));
    if (!t) return [404, { error: 'Task not found' }];
    if (!body.date || !body.time) return [400, { error: 'task_id, date, and time are required' }];
    const [y, mo, d] = String(body.date).split('-').map(Number);
    const [hh, mm] = hhmmss(String(body.time)).split(':').map(Number);
    const ev = schedule(t, new Date(y, mo - 1, d, hh, mm, 0, 0));
    return [200, { message: path.includes('re') ? 'Task rescheduled successfully!' : 'Task scheduled successfully!', task: serTask(t), calendar_event: serCalendarEvent(ev) }, 250];
  }
  if (method === 'post' && path === '/tasks/unschedule/') {
    const t = tasks.find((x) => x.id === Number(body?.task_id));
    if (!t) return [404, { error: 'Task not found' }];
    if (t.calendar_event_id) {
      const i = events.findIndex((e) => `app-${e.id}` === t.calendar_event_id);
      if (i >= 0) events.splice(i, 1);
    }
    t.calendar_event_id = null;
    t.scheduled_date = null;
    t.scheduled_time = null;
    return [200, { message: 'Task unscheduled', task: serTask(t) }];
  }
  if ((m = path.match(/^\/tasks\/(\d+)\/delete\/$/)) && method === 'delete') {
    const id = Number(m[1]);
    const t = tasks.find((x) => x.id === id);
    if (!t) return [404, { error: 'Task not found' }];
    [t, ...tasks.filter((s) => s.parent_task === id)].forEach((x) => {
      const ei = events.findIndex((e) => `app-${e.id}` === x.calendar_event_id);
      if (ei >= 0) events.splice(ei, 1);
      tasks.splice(tasks.indexOf(x), 1);
    });
    return [204, { message: 'Task deleted' }];
  }
  if ((m = path.match(/^\/tasks\/(\d+)\/$/)) && ['get', 'post', 'put', 'patch'].includes(method)) {
    const t = tasks.find((x) => x.id === Number(m![1]));
    if (!t) return [404, { error: 'Task not found' }];
    if (method === 'get') return [200, serTask(t)];
    const b = body || {};
    if ('estimated_minutes' in b) {
      t.estimated_duration_minutes = Number(b.estimated_minutes);
      const ev = events.find((e) => `app-${e.id}` === t.calendar_event_id);
      if (ev) ev.end = new Date(ev.start.getTime() + t.estimated_duration_minutes * 60000);
    }
    ['title', 'description', 'priority', 'location', 'order', 'estimated_duration_minutes'].forEach((k) => {
      if (k in b) (t as any)[k] = b[k];
    });
    if ('status' in b) {
      if (b.status === 'done' && t.status !== 'done') t.completed_at = nowIso();
      if (b.status !== 'done') t.completed_at = null;
      t.status = b.status;
    }
    if ('scheduled_date' in b) t.scheduled_date = b.scheduled_date;
    if ('scheduled_time' in b) t.scheduled_time = b.scheduled_time ? hhmmss(String(b.scheduled_time)) : null;
    t.updated_at = nowIso();
    return [200, serTask(t)];
  }

  if (path === '/ai/memory/' && method === 'get') return [200, memory];
  if (path === '/ai/memory/' && method === 'patch') {
    memory = { ...memory, ...(body || {}), updated_at: nowIso() };
    return [200, memory];
  }
  if (method === 'post' && path === '/ai/onboarding/') {
    memory = { ...memory, onboarding_data: body?.responses ?? memory.onboarding_data, onboarding_completed: body?.onboarding_completed ?? true };
    return [200, { message: 'Thanks for helping me get to know you better!', memory }];
  }
  if (method === 'post' && path === '/chat/') {
    if (!body?.message) return [400, { error: 'Message is required' }];
    return [200, chat(String(body.message)), 800];
  }

  return [404, { error: `Not available in the demo: ${method.toUpperCase()} ${path}` }];
}

// ---------------------------------------------------------------------------------------------
// Optional live AI: the portfolio's /api/clarity/decompose proxy (Gemini, then Groq). Any problem at all
// (no keys, rate limit, offline, bad JSON, slow) resolves to null and the rule-based engine answers instead.
// ---------------------------------------------------------------------------------------------
const nativeFetch: typeof fetch | null = typeof fetch === 'function' ? fetch.bind(globalThis) : null;

async function liveBreakdown(title: string): Promise<any | null> {
  if (!nativeFetch || typeof window === 'undefined') return null;
  try {
    const res = await nativeFetch('/api/clarity/decompose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (d?.fallback || !Array.isArray(d?.subtasks)) return null;
    const subs = d.subtasks.map((s: any, i: number) => ({
      title: String(s.title),
      description: '',
      estimated_minutes: Number(s.minutes),
      estimated_duration_minutes: Number(s.minutes),
      ai_message: s.message || ['A gentle start.', 'You can do this part.', 'Nearly there.', 'Almost done.', 'Last stretch.'][i % 5],
    }));
    return {
      should_break_down: d.should_break_down && subs.length > 0,
      reasoning: d.reasoning,
      suggested_subtasks: subs,
      total_estimated_minutes: d.total_minutes,
      witty_message: d.witty_message || '✨ The Clarity Breakdown is ready!',
      source: d.source,
    };
  } catch {
    return null;
  }
}

async function dispatch(method: string, path: string, body: any): Promise<Res> {
  if (method === 'post' && path === '/tasks/breakdown/' && body?.title) {
    const live = await liveBreakdown(String(body.title));
    if (live) return [200, live, 0];
  }
  return route(method, path, body);
}

// ---------------------------------------------------------------------------------------------
// axios adapter + session seeding
// ---------------------------------------------------------------------------------------------
export const mockAdapter = async (config: any) => {
  const base: string = config.baseURL || '';
  let url: string = config.url || '';
  if (base && url.startsWith(base)) url = url.slice(base.length);
  const path = url.split('?')[0];
  const method = String(config.method || 'get').toLowerCase();
  let body: any = config.data;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      /* leave as-is */
    }
  }
  const [status, data, latency = 120] = await dispatch(method, path, body);
  await sleep(latency);
  const response = { data, status, statusText: String(status), headers: {}, config, request: {} };
  if (status >= 200 && status < 300) return response;
  const err: any = new Error(`Request failed with status code ${status}`);
  err.isAxiosError = true;
  err.config = config;
  err.response = response;
  throw err;
};

// A few screens call fetch() directly instead of the axios instance, so answer those the same way.
function installDemoFetch(apiBase: string) {
  const g: any = globalThis;
  if (g.__clarityDemoFetch) return;
  g.__clarityDemoFetch = true;
  const orig = g.fetch.bind(g);
  g.fetch = async (input: any, init?: any) => {
    const url: string = typeof input === 'string' ? input : input?.url ?? '';
    if (!url.startsWith(apiBase)) return orig(input, init);
    const path = url.slice(apiBase.length).split('?')[0];
    let body: any;
    try {
      body = init?.body ? JSON.parse(init.body) : undefined;
    } catch {
      body = undefined;
    }
    const [status, data, latency = 120] = await dispatch(String(init?.method || 'get').toLowerCase(), path, body);
    await sleep(latency);
    return new Response(status === 204 ? null : JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  };
}

export function seedDemoSession(apiBase: string) {
  installDemoFetch(apiBase);
  if (tasks.length === 0) seed();
  // Skip the login screen: visitors land straight in the app. Logging out still shows it, and any credentials work.
  AsyncStorage.setItem('authToken', 'demo-token').catch(() => {});
  AsyncStorage.setItem('user', JSON.stringify(user)).catch(() => {});
}
