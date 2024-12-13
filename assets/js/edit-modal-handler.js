var API_BASE_URL = window.API_BASE_URL;

function initializeEditHandlers() {
  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-modal-target]");
    if (!button) return;

    const modalId = button.getAttribute("data-modal-target");
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Determine which type of resource we're editing
    if (modalId === "editTransactionModal") {
      const transactionId = button.getAttribute("data-transaction-id");
      loadTransactionData(transactionId, modal);
      IMask(
        document.querySelector("#editTransactionModal [name='date']"),
        window.imaskConfig
      );
    } else if (modalId === "editCategoryModal") {
      const categoryId = button.getAttribute("data-category-id");
      loadCategoryData(categoryId, modal);
    }
  });
}

function loadTransactionData(transactionId, modal) {
  // First load the categories
  loadCategoriesForEditSelect(modal);

  // Then fetch and populate transaction data
  fetch(`${API_BASE_URL}/transaction/${transactionId}`)
    .then((response) => response.json())
    .then((transaction) => {
      // Populate form fields
      modal.querySelector('[name="description"]').value =
        transaction.description;
      modal.querySelector('[name="amount"]').value = transaction.amount;

      // Wait a brief moment to ensure categories are loaded before setting the selected value
      setTimeout(() => {
        const categorySelect = modal.querySelector(
          "#editTransactionModal [name='category']"
        );
        if (categorySelect) {
          categorySelect.value = transaction.category.id;
        }
      }, 100);
      modal.querySelector('[name="date"]').value = dayjs(
        transaction.date
      ).format("DD/MM/YYYY");
      modal.querySelector('[name="type"]').value = transaction.type;

      // Store the ID for the update operation
      modal.querySelector("form").setAttribute("data-edit-id", transactionId);
    });
}

function loadCategoriesForEditSelect(modal) {
  const categorySelect = modal.querySelector(
    "#editTransactionModal [name='category']"
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
        // The selected state will be set later when loading transaction data
        categorySelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error loading categories:", error);
    });
}

function loadCategoryData(categoryId, modal) {
  fetch(`${API_BASE_URL}/category/${categoryId}`)
    .then((response) => response.json())
    .then((category) => {
      // Populate form fields
      modal.querySelector('[name="name"]').value = category.name;

      // Store the ID for the update operation
      modal.querySelector("form").setAttribute("data-edit-id", categoryId);
    });
}

async function handleEditFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const resourceId = form.getAttribute("data-edit-id");
  const isTransaction = form.closest("#editTransactionModal") !== null;

  try {
    // Clear previous errors
    clearErrors(form);

    if (isTransaction) {
      // Validate form if it's a transaction
      const errors = validateTransactionForm(form);
      if (Object.keys(errors).length > 0) {
        displayErrors(form, errors);
        return;
      }
    } else {
      // Validate category form
      const errors = validateCategoryForm(form);
      if (Object.keys(errors).length > 0) {
        displayErrors(form, errors);
        return;
      }
    }

    const formData = new FormData(form);
    let data = Object.fromEntries(formData.entries());

    data.id = resourceId;

    if (isTransaction) {
      data.category_id = data.category;
      delete data.category;
      data.amount = parseFloat(data.amount);
      data.date = dayjs(data.date).format("YYYY-MM-DD");
    }

    const endpoint = isTransaction
      ? `${API_BASE_URL}/transaction/${resourceId}`
      : `${API_BASE_URL}/category/${resourceId}`;

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to update ${isTransaction ? "transaction" : "category"}`
      );
    }

    // Success handling
    Swal.fire({
      icon: "success",
      title: "Sucesso!",
      text: `${
        isTransaction ? "Transação" : "Categoria"
      } atualizada com sucesso`,
      timer: 2000,
    });

    // Close modal and refresh data
    closeModal(form.closest(".modal-content"));
    if (isTransaction) {
      await window.balanceService.recalculateBalance();
    }
    window.loadInitialData();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error.message ||
        `Failed to update ${isTransaction ? "transaction" : "category"}`,
    });
  }
}

// Initialize edit handlers when page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeEditHandlers();

  // Add submit handlers to edit forms
  const editForms = document.querySelectorAll(
    "#editTransactionModal form, #editCategoryModal form"
  );
  editForms.forEach((form) => {
    form.addEventListener("submit", handleEditFormSubmit);
  });
});

function closeModal(modal) {
  if (!modal) return;

  const modalContainer = document.getElementById("modalContainer");
  if (modalContainer) {
    modalContainer.classList.add("hidden");
    modalContainer.classList.remove("grid");
  }

  // Hide all modal contents
  const modalContents = document.querySelectorAll(".modal-content");
  modalContents.forEach(function (modalContent) {
    modalContent.classList.add("hidden");
  });
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
    element.classList.add("hidden");
  });
}
