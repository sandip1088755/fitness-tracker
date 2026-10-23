const KEY = 'fitness-daily-v1';
const GOAL = 1000;
const TASKS = [
  { id: 'wake', name: 'Wake up on time', pts: 100 },
  { id: 'workout', name: 'Workout', pts: 250 },
  { id: 'water', name: 'Water (2 L)', pts: 100 },
  { id: 'meals', name: 'Healthy meals', pts: 150 },
  { id: 'study', name: 'Study or work block', pts: 200 },
  { id: 'reading', name: 'Reading', pts: 100 },
  { id: 'sleep', name: 'Sleep by target time', pts: 100 }
];

const $ = id => document.getElementById(id);
const dayKey = d => d.toLocaleDateString('en-CA'); // YYYY-MM-DD

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
function pointsFor(data, key) {
  const day = data[key] || {};
  return TASKS.filter(t => day[t.id]).reduce((sum, t) => sum + t.pts, 0);
}
function streak(data) {
  const d = new Date();
  if (pointsFor(data, dayKey(d)) < GOAL) d.setDate(d.getDate() - 1); // today not finished yet, count from yesterday
  let n = 0;
  while (pointsFor(data, dayKey(d)) >= GOAL) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function render() {
  const data = load();
  const now = new Date();
  const today = dayKey(now);
  const pts = pointsFor(data, today);

  $('date').textContent = now.toDateString();
  $('score').textContent = pts;
  $('bar').style.width = Math.min(100, (pts / GOAL) * 100) + '%';
  $('goalMsg').textContent = pts >= GOAL
    ? 'Goal reached. Great work!'
    : (GOAL - pts) + ' points to go';
  $('streak').textContent = streak(data);

  const list = $('tasks');
  list.innerHTML = '';
  TASKS.forEach(t => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!(data[today] && data[today][t.id]);
    cb.onchange = () => {
      const d = load();
      d[today] = d[today] || {};
      d[today][t.id] = cb.checked;
      save(d);
      render();
    };
    const name = document.createElement('span');
    name.textContent = t.name;
    label.append(cb, name);
    const pt = document.createElement('b');
    pt.textContent = '+' + t.pts;
    li.append(label, pt);
    list.append(li);
  });

  const hist = $('history');
  hist.innerHTML = '';
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const p = pointsFor(data, dayKey(d));
    const li = document.createElement('li');
    const s = document.createElement('span');
    s.textContent = d.toDateString();
    const b = document.createElement('b');
    b.textContent = p + ' / ' + GOAL + (p >= GOAL ? ' ✓' : '');
    li.append(s, b);
    hist.append(li);
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
render();
