let pnlChart; // global chart instance

// === DOM ELEMENTS ===
const monthSelect = document.getElementById('month');
const yearInput = document.getElementById('year');
const calendarBody = document.querySelector('#calendar tbody');
const totalSpan = document.getElementById('total');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');

// === STORAGE KEY HELPERS ===
function getStorageKey(year, month) {
  return `pnl_${year}_${month}`;
}

// === SAVE AND LOAD FUNCTIONS ===
function saveToStorage(day, value, year, month) {
  const key = getStorageKey(year, month);
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  data[day] = value;
  localStorage.setItem(key, JSON.stringify(data));
  updateTotal();
  updateInputColors();
  updateChart();
}

function loadFromStorage(year, month) {
  const key = getStorageKey(year, month);
  return JSON.parse(localStorage.getItem(key) || '{}');
}

// === CLEAR MONTHLY DATA ===
function clearCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearInput.value);
  if (confirm(`Clear all P&L entries for ${month + 1}/${year}?`)) {
    localStorage.removeItem(getStorageKey(year, month));
    generateCalendar();
  }
}

// === MAIN CALENDAR GENERATION ===
function generateCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearInput.value);
  calendarBody.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const storedData = loadFromStorage(year, month);

  let row = document.createElement('tr');

  // Blank cells before 1st of month
  for (let i = 0; i < firstDay; i++) {
    row.appendChild(document.createElement('td'));
  }

  // Create daily cells
  for (let day = 1; day <= daysInMonth; day++) {
    if (row.children.length === 7) {
      calendarBody.appendChild(row);
      row = document.createElement('tr');
    }

    const cell = document.createElement('td');
    const value = storedData[day] || '';

    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.01';
    input.value = value;
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

  // Fill trailing empty cells
  while (row.children.length < 7) {
    row.appendChild(document.createElement('td'));
  }

  calendarBody.appendChild(row);
  updateTotal();
  updateInputColors();
  updateChart();
}

// === TOTAL CALCULATION ===
function updateTotal() {
  const inputs = document.querySelectorAll('#calendar tbody input');
  let total = 0;
  inputs.forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  totalSpan.textContent = total.toFixed(2);
  updateTotalColor();
}

// === COLOR UPDATES ===
function updateInputColors() {
  const inputs = document.querySelectorAll('#calendar tbody input');
  inputs.forEach(input => {
    input.classList.remove('profit', 'loss');
    const value = parseFloat(input.value);
    if (value > 0) input.classList.add('profit');
    else if (value < 0) input.classList.add('loss');
  });
}

// === TOTAL COLOR ===
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

// === CHART CREATION ===
function updateChart() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearInput.value);
  const storedData = loadFromStorage(year, month);

  const days = Object.keys(storedData).map(Number).sort((a,b)=>a-b);
  const values = days.map(d => storedData[d]);

  const ctx = document.getElementById('pnlChart').getContext('2d');

  if (pnlChart) pnlChart.destroy();

  pnlChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: `P&L for ${monthSelect.options[month].text} ${year}`,
        data: values,
        fill: true,
        borderColor: '#00ffff',
        backgroundColor: 'rgba(0,255,255,0.1)',
        tension: 0.3,
        pointBackgroundColor: values.map(v => v >= 0 ? '#00ff66' : '#ff3333'),
      }]
    },
    options: {
      plugins: { legend: { labels: { color: '#00ffff' } } },
      scales: {
        x: { ticks: { color: '#00ffff' }, grid: { color: 'rgba(0,255,255,0.1)' } },
        y: { ticks: { color: '#00ffff' }, grid: { color: 'rgba(0,255,255,0.1)' } }
      }
    }
  });
}

// === EVENT LISTENERS ===
generateBtn.addEventListener('click', generateCalendar);
clearBtn.addEventListener('click', clearCalendar);

// === INITIALIZATION ===
generateCalendar();
