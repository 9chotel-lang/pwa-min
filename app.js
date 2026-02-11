const STORAGE_KEY = 'mini-checklist-items-v1';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');
const todayOnlyCheckbox = document.getElementById('todayOnly');

const todayYmd = new Date().toISOString().slice(0, 10);

let items = [];

const loadItems = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item?.text === 'string');
  } catch {
    return [];
  }
};

const saveItems = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const isTodayItem = (item) => item.createdAt?.slice(0, 10) === todayYmd;

const visibleItems = () => {
  if (!todayOnlyCheckbox.checked) {
    return items;
  }

  return items.filter(isTodayItem);
};

const createTaskNode = (item) => {
  const li = document.createElement('li');
  li.className = 'task-item';

  const main = document.createElement('div');
  main.className = 'task-main';

  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = Boolean(item.completed);
  toggle.addEventListener('change', () => {
    items = items.map((current) =>
      current.id === item.id ? { ...current, completed: toggle.checked } : current
    );
    saveItems();
    render();
  });

  const text = document.createElement('span');
  text.className = 'task-text';
  text.textContent = item.text;

  main.append(toggle, text);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-btn';
  deleteButton.textContent = '削除';
  deleteButton.addEventListener('click', () => {
    items = items.filter((current) => current.id !== item.id);
    saveItems();
    render();
  });

  actions.append(deleteButton);
  li.append(main, actions);

  return li;
};

const renderSection = (target, sectionItems) => {
  target.innerHTML = '';

  if (sectionItems.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = '項目はありません';
    target.append(empty);
    return;
  }

  sectionItems.forEach((item) => {
    target.append(createTaskNode(item));
  });
};

const render = () => {
  const filtered = visibleItems();
  const pending = filtered.filter((item) => !item.completed);
  const completed = filtered.filter((item) => item.completed);

  renderSection(pendingList, pending);
  renderSection(completedList, completed);
};

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) {
    return;
  }

  const newItem = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  items = [newItem, ...items];
  saveItems();
  taskInput.value = '';
  render();
});

todayOnlyCheckbox.addEventListener('change', render);

items = loadItems();
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registered');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}
