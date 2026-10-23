const KEY = 'fitness-workouts';
const form = document.getElementById('workoutForm');
const list = document.getElementById('list');

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function save(workouts) {
  localStorage.setItem(KEY, JSON.stringify(workouts));
}

function startOfWeek() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

function render() {
  const workouts = load().sort((a, b) => b.date - a.date);
  const today = new Date().toDateString();
  const weekStart = startOfWeek();

  document.getElementById('todayCount').textContent =
    workouts.filter(w => new Date(w.date).toDateString() === today).length;
  document.getElementById('weekCount').textContent =
    workouts.filter(w => w.date >= weekStart).length;
  document.getElementById('totalMin').textContent =
    workouts.reduce((sum, w) => sum + w.duration, 0);

  list.innerHTML = '';
  workouts.forEach(w => {
    const li = document.createElement('li');
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `${w.type} · ${w.duration} min`;
    const meta = document.createElement('small');
    meta.textContent = new Date(w.date).toLocaleString() + (w.notes ? ` · ${w.notes}` : '');
    info.append(title, meta);

    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = 'Delete';
    del.onclick = () => {
      save(load().filter(x => x.id !== w.id));
      render();
    };
    li.append(info, del);
    list.append(li);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const workouts = load();
  workouts.push({
    id: Date.now(),
    type: document.getElementById('type').value,
    duration: Number(document.getElementById('duration').value),
    notes: document.getElementById('notes').value.trim(),
    date: Date.now()
  });
  save(workouts);
  form.reset();
  render();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

render();
