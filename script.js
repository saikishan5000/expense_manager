const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));

let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Add transaction
function addTransaction(e) {
  e.preventDefault();

  if(text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);

    updateValues();

    updateLocalStorage();

    text.value='';
    amount.value = '';
  }
}

// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
  // Get sign
  const sign = transaction.amount < 0 ? '-' : '+';

  const item = document.createElement('li');

  // Add class based on value
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span> <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;

  list.appendChild(item);
}

// Update the balance, income and expense
function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

  const income = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);

  const expense = (amounts
    .filter(item => item < 0)
    .reduce((acc, item) =>(acc += item), 0) * -1)
    .toFixed(2);

  balance.innerText = `₹${total}`;
  money_plus.innerText = `₹${income}`;
  money_minus.innerText = `₹${expense}`;
}

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);

  updateLocalStorage();

  init();
}

// Update local storage transactions
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Init app
function init() {
  list.innerHTML = '';

  transactions.forEach(addTransactionDOM);
  updateValues();
}

init();

form.addEventListener('submit', addTransaction);






// 

const exportBtn = document.getElementById('export-btn');
exportBtn.addEventListener('click', exportToExcel);

function exportToExcel() {
  /* Convert transactions data to a format that can be exported to Excel */
  const data = transactions.map(transaction => ({
    Text: transaction.text,
    Amount: transaction.amount < 0 ? -transaction.amount : transaction.amount,
    Type: transaction.amount < 0 ? 'Expense' : 'Income'
  }));

  /* Define the Excel workbook and worksheet */
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  /* Add headers to the worksheet */
  XLSX.utils.sheet_add_aoa(ws, [['Text', 'Amount', 'Type']], { origin: 'A1' });

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

  /* Export the workbook to an Excel file */
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  /* Save the Excel file to the user's computer */
  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'transactions.xlsx');

  /* Open the Excel file in a new window */
  window.open(URL.createObjectURL(new Blob([s2ab(wbout)], { type: 'application/octet-stream' })), '_blank');
}

/* Helper function to convert a string to an ArrayBuffer */
function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);

  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xFF;
  }

  return buf;
}

function downloadExcel() {
  const filename = 'transactions.xlsx';

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: 'Transactions',
    Author: 'Your Name',
    CreatedDate: new Date()
  };
  wb.SheetNames.push('Sheet 1');

  const ws_data = [
    ['Text', 'Amount', 'Type']
  ];

  transactions.forEach(transaction => {
    const row = [
      transaction.text,
      transaction.amount,
      transaction.amount < 0 ? 'Expense' : 'Income'
    ];

    ws_data.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  wb.Sheets['Sheet 1'] = ws;

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
