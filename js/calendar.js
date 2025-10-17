// === DOM ELEMENTS ===
const monthSelect = document.getElementById('month');
const yearInput = document.getElementById('year');
const calendarBody = document.querySelector('#calendar tbody');
const totalSpan = document.getElementById('total');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');

// === STORAGE HELPERS ===
function getStorageKey(year, month) {
  return `pnl_${year}_${month}`;
}

function saveToStorage(day, value, year, month) {
  const key = getStorageKey(year, month);
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  data[day] = value;
  localStorage.setItem(key, JSON.stringify(data));
  updateTotal();
  updateInputColors();
}

function loadFromStorage(year, month) {
  const key = getStorageKey(year, month);
  return JSON.parse(localStorage.getItem(key) || '{}');
}

// === CLEAR CALENDAR ===
function clearCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearInput.value);
  if (confirm(`Clear all P&L entries for ${months[month]} ${year}?`)) {
    localStorage.removeItem(getStorageKey(year, month));
    generateCalendar();
  }
}

// === GENERATE CALENDAR ===
function generateCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearInput.value);
  calendarBody.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const storedData = loadFromStorage(year, month);

  let row = document.createElement('tr');

  // Empty cells before start
  for (let i = 0; i < firstDay; i++) {
    row.appendChild(document.createElement('td'));
  }

  // Daily boxes
  for (let day = 1; day <= daysInMonth; day++) {
    if (row.children.length === 7) {
      calendarBody.appendChild(row);
      row = document.createElement('tr');
    }

    const cell = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.01';
    input.value = storedData[day] || '';

    input.addEventListener('input', () => {
      const val = parseFloat(input.value) || 0;
      saveToStorage(day, val, year, month);
    });

    const label = document.createElement('div');
    label.textContent = day;

    cell.appendChild(label);
    cell.appendChild(input);
    row.appendChild(cell);
  }

  // Fill trailing cells
  while (row.children.length < 7) {
    row.appendChild(document.createElement('td'));
  }

  calendarBody.appendChild(row);
  updateTotal();
  updateInputColors();
}

// === TOTALS ===
function updateTotal() {
  const inputs = document.querySelectorAll('#calendar tbody input');
  let total = 0;
  inputs.forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  totalSpan.textContent = total.toFixed(2);
  updateTotalColor();
}

// === COLOR LOGIC ===
function updateInputColors() {
  const inputs = document.querySelectorAll('#calendar tbody input');
  inputs.forEach(input => {
    input.classList.remove('profit', 'loss');
    const value = parseFloat(input.value);
    if (value > 0) input.classList.add('profit');
    else if (value < 0) input.classList.add('loss');
  });
}

function updateTotalColor() {
  const total = parseFloat(totalSpan.textContent);
  const totalCell = document.querySelector('#calendar tfoot td');
  if (total > 0) {
    totalCell.style.color = '#00ff66';
    totalCell.style.textShadow = '0 0 10px #00ff6680';
  } else if (total < 0) {
    totalCell.style.color = '#ff3333';
    totalCell.style.textShadow = '0 0 10px #ff333380';
  } else {
    totalCell.style.color = '#00ffff';
    totalCell.style.textShadow = 'none';
  }
}

// === EVENT LISTENERS ===
generateBtn.addEventListener('click', generateCalendar);
clearBtn.addEventListener('click', clearCalendar);

// Load current month on start
generateCalendar();
