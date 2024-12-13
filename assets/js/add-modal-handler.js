var API_BASE_URL = window.API_BASE_URL;

function initializeAddHandlers() {
  // Initialize form handlers
  const addTransactionForm = document.getElementById("addTransactionForm");
  const addCategoryForm = document.getElementById("addCategoryForm");

  if (addTransactionForm) {
    IMask(
      document.querySelector("#addTransactionForm [name='date']"),
      window.imaskConfig
    );
    addTransactionForm.addEventListener("submit", handleAddTransaction);
  }

  if (addCategoryForm) {
    addCategoryForm.addEventListener("submit", handleAddCategory);
  }

  // Load categories for transaction form dropdown
  loadCategoriesForSelect();
}

function loadCategoriesForSelect() {
  const categorySelect = document.querySelector(
    '#addTransactionForm [name="category"]'
  );
  if (!categorySelect) return;

  fetch(`${API_BASE_URL}/category`)
    .then((response) => response.json())
    .then((categoriesData) => {
      categorySelect.innerHTML =
        '<option value="">Selecione uma categoria</option>';
      categoriesData.categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error loading categories:", error);
    });
}

async function handleAddTransaction(event) {
  event.preventDefault();
  const form = event.target;

  try {
    // Clear previous errors
    clearErrors(form);

    // Validate form
    const errors = validateTransactionForm(form);
    if (Object.keys(errors).length > 0) {
      displayErrors(form, errors);
      return;
    }

    const formData = new FormData(form);
    let data = Object.fromEntries(formData.entries());

    // Ensure amount is a number
    data.category_id = data.category !== "" ? data.category : null;
    delete data.category;
    data.amount = parseFloat(data.amount);
    data.date = dayjs(data.date).format("YYYY-MM-DD");

    const response = await fetch(`${API_BASE_URL}/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Falha ao adicionar transação");
    }

    // After successful transaction addition
    await window.balanceService.recalculateBalance();
    window.loadInitialData();

    Swal.fire({
      icon: "success",
      title: "Sucesso!",
      text: "Transação adicionada com sucesso",
      timer: 2000,
    });

    // Reset form and close modal
    form.reset();
    closeModal(form.closest(".modal-content"));
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to process transaction",
    });
  }
}

async function handleAddCategory(event) {
  event.preventDefault();
  const form = event.target;

  try {
    // Clear previous errors
    clearErrors(form);

    // Validate form
    const errors = validateCategoryForm(form);
    if (Object.keys(errors).length > 0) {
      displayErrors(form, errors);
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch(`${API_BASE_URL}/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Falha ao adicionar categoria");
    }

    // Success handling
    Swal.fire({
      icon: "success",
      title: "Sucesso!",
      text: "Categoria adicionada com sucesso",
      timer: 2000,
    });

    // Reset form and close modal
    form.reset();
    closeModal(form.closest(".modal-content"));

    // Refresh category selects after adding new category
    window.refreshAllCategorySelects();

    // Refresh data
    window.loadInitialData();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to add category",
    });
  }
}

function validateTransactionForm(form) {
  const errors = {};
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (!data.description?.trim()) {
    errors.description = "Descrição é obrigatória";
  }

  if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
    errors.amount = "O valor deve ser um número positivo";
  }

  if (!data.date?.trim()) {
    errors.date = "Data é obrigatória";
  }

  if (!data.type || !["income", "expense"].includes(data.type)) {
    errors.type = "Tipo válido é obrigatório";
  }

  return errors;
}

function validateCategoryForm(form) {
  const errors = {};
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (!data.name?.trim()) {
    errors.name = "Nome da categoria é obrigatório";
  }

  return errors;
}

function displayErrors(form, errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorSpan = form.querySelector(`[data-error="${field}"]`);
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.classList.remove("hidden");
    }
  });

  // Display general error if it exists
  if (errors.general) {
    const generalError = form.querySelector('[data-error="general"]');
    if (generalError) {
      generalError.textContent = errors.general;
      generalError.classList.remove("hidden");
    }
  }
}

function clearErrors(form) {
  const errorElements = form.querySelectorAll("[data-error]");
  errorElements.forEach((element) => {
    element.textContent = "";
    element.classList.add("hidden");
  });
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
  const modalContainer = document.getElementById("modalContainer");
  if (modalContainer) {
    modalContainer.classList.add("hidden");
    modalContainer.classList.remove("grid");
  }
}

// Initialize handlers when page loads
document.addEventListener("DOMContentLoaded", initializeAddHandlers);
