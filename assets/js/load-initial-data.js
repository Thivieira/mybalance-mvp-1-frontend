var API_BASE_URL = "http://localhost:6700";
window.API_BASE_URL = API_BASE_URL;

function loadInitialData() {
  // transactions table
  fetch(`${API_BASE_URL}/transaction`)
    .then((response) => response.json())
    .then((data) => {
      renderTransactions(data);
      renderTransactionsIndicators(data);
    });

  // categories table
  fetch(`${API_BASE_URL}/category`)
    .then((response) => response.json())
    .then((data) => {
      renderCategories(data);
      renderCategoriesCount(data);
    });

  // balance
  fetch(`${API_BASE_URL}/balance`)
    .then((response) => response.json())
    .then((data) => renderBalance(data));
}
window.loadInitialData = loadInitialData;

async function renderBalance(balanceData) {
  try {
    const currentBalance = await window.balanceService.getCurrentBalance();

    // Update UI elements
    document.getElementById("totalIncome").innerHTML = `R$ ${Number(
      currentBalance.income
    ).toFixed(2)}`;
    document.getElementById("totalExpenses").innerHTML = `R$ ${Number(
      currentBalance.expense
    ).toFixed(2)}`;
    document.getElementById("balance").innerHTML = `R$ ${Number(
      currentBalance.balance
    ).toFixed(2)}`;

    // Update balance status indicator
    const balanceElement = document.getElementById("balance");
    if (currentBalance.balance > 0) {
      balanceElement.classList.add("text-emerald-500");
      balanceElement.classList.remove("text-red-500");
    } else {
      balanceElement.classList.add("text-red-500");
      balanceElement.classList.remove("text-emerald-500");
    }
  } catch (error) {
    console.error("Error rendering balance:", error);
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Falha ao carregar informações de saldo",
    });
  }
}

function renderTransactionsIndicators(transactionsData) {
  var totalIncomeElement = document.getElementById("totalIncome");
  var totalExpensesElement = document.getElementById("totalExpenses");
  var transactions = transactionsData.transactions;

  totalIncomeElement.innerHTML = `R$ ${transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((acc, transaction) => acc + transaction.amount, 0)}`;
  totalExpensesElement.innerHTML = `R$ ${transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => acc + transaction.amount, 0)}`;
}

function renderCategoriesCount(categoriesData) {
  var balanceElement = document.getElementById("categoriesCount");
  var categories = categoriesData.categories;
  balanceElement.innerHTML = categories.length;
}

function renderTransactions(transactionsData) {
  var table = document.getElementById("transactionsTable");
  var transactions = transactionsData.transactions;

  if (transactions.length === 0) {
    return renderEmptyRow(table);
  }

  table.innerHTML = "";
  transactions.forEach((transaction) => {
    var row = table.insertRow();

    // Add cells with classes
    var descriptionCell = row.insertCell(0);
    descriptionCell.className =
      "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left";
    descriptionCell.innerHTML = transaction.description;

    var amountCell = row.insertCell(1);
    amountCell.className =
      "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";
    amountCell.innerHTML = `R$ ${transaction.amount}`;

    var categoryCell = row.insertCell(2);
    categoryCell.className =
      "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";
    categoryCell.innerHTML = transaction.category
      ? transaction.category.name
      : "Sem categoria";

    var dateCell = row.insertCell(3);
    dateCell.className =
      "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";
    dateCell.innerHTML = dayjs(transaction.date).format("DD/MM/YYYY");

    var typeCell = row.insertCell(4);
    typeCell.className =
      "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";
    typeCell.innerHTML = transaction.type === "income" ? "Receita" : "Despesa";

    // Actions cell (keeping existing classes)
    var actionsCell = row.insertCell(5);
    actionsCell.className =
      "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";
    actionsCell.innerHTML = `
      <button data-modal-target="editTransactionModal" 
              data-transaction-id="${transaction.id}" 
              class="text-indigo-500 hover:text-indigo-700 mr-2">
        <i class="fas fa-edit"></i>
      </button>
      <button data-delete-handler
              data-resource-type="transaction"
              data-resource-id="${transaction.id}" 
              class="text-red-500 hover:text-red-700">
        <i class="fas fa-trash"></i>
      </button>
    `;
  });
}

function renderCategories(categoriesData) {
  var table = document.getElementById("categoriesTable");
  var categories = categoriesData.categories;

  if (categories.length === 0) {
    return renderEmptyRow(table);
  }

  table.innerHTML = "";
  categories.forEach((category) => {
    var row = table.insertRow();
    // row.classList.add(
    //   "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
    // );

    // Name cell
    var nameCell = row.insertCell(0);
    nameCell.innerHTML = category.name;
    nameCell.className =
      "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left";

    // Actions cell
    var actionsCell = row.insertCell(1);
    actionsCell.className =
      "border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4";
    actionsCell.innerHTML = `
      <button data-modal-target="editCategoryModal" 
              data-category-id="${category.id}" 
              class="text-indigo-500 hover:text-indigo-700 mr-2">
        <i class="fas fa-edit"></i>
      </button>
      <button data-delete-handler
              data-resource-type="category"
              data-resource-id="${category.id}" 
              class="text-red-500 hover:text-red-700">
        <i class="fas fa-trash"></i>
      </button>
    `;
  });
}

function renderEmptyRow(table) {
  table.innerHTML = "";
  var row = table.insertRow();
  var td = row.insertCell(0);
  td.innerHTML = "Não há resultados para mostrar";
  td.style.textAlign = "center";
  td.style.fontWeight = "bold";
  td.style.color = "#808080";
  td.style.padding = "10px";
  td.style.display = "block";
  row.style.borderBottom = "1px solid #e0e0e0";
}

// Load initial data when page loads
document.addEventListener("DOMContentLoaded", loadInitialData);
