const monthSelect = document.getElementById('month');
const yearInput = document.getElementById('year');
const calendarBody = document.querySelector('#calendar tbody');
const totalSpan = document.getElementById('total');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');

function getStorageKey(year, month) {
  return `pnl_${year}_${month}`;
}

function saveToStorage(day, value, year, month) {
  const key = getStorageKey(year, month);
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  data[day] = value;
  localStorage.setItem(key, JSON.stringify(data));
  updateTotal();
}

function loadFromStorage(year, month) {
  const key = getStorageKey(year, month);
  return JSON.parse(localStorage.getItem(key) || '{}');
}

function clearCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearInput.value);
  if(confirm("Clear all P&L entries for this month?")) {
    localStorage.removeItem(getStorageKey(year, month));
    generateCalendar();
  }
}

function generateCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearInput.value);
  calendarBody.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const storedData = loadFromStorage(year, month);

  let row = document.createElement('tr');

  for(let i=0; i<firstDay; i++) {
    row.appendChild(document.createElement('td'));
  }

  for(let day=1; day<=daysInMonth; day++) {
    if(row.children.length === 7){
      calendarBody.appendChild(row);
      row = document.createElement('tr');
    }
    const cell = document.createElement('td');
    const value = storedData[day] || 0;
    cell.innerHTML = `<div>${day}</div><input type="number" step="0.01" value="${value}" onchange="saveToStorage(${day}, parseFloat(this.value)||0, ${year}, ${month})">`;
    row.appendChild(cell);
  }

  while(row.children.length < 7) {
    row.appendChild(document.createElement('td'));
  }

  calendarBody.appendChild(row);
  updateTotal();
}

function updateTotal() {
  const inputs = document.querySelectorAll('#calendar tbody input');
  let total = 0;
  inputs.forEach(input => total += parseFloat(input.value) || 0);
  totalSpan.textContent = total.toFixed(2);
}

// Event listeners
generateBtn.addEventListener('click', generateCalendar);
clearBtn.addEventListener('click', clearCalendar);

// Load current month by default
generateCalendar();
