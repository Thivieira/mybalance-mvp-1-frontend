// Validation functions
function validateTransactionForm(data) {
  const errors = {};

  if (!data.description.trim()) {
    errors.description = "Descrição é obrigatória";
  } else if (data.description.length > 100) {
    errors.description = "Descrição deve ter menos de 100 caracteres";
  }

  // Amount validation
  if (!data.amount) {
    errors.amount = "Valor é obrigatório";
  } else if (isNaN(data.amount)) {
    errors.amount = "Valor deve ser um número válido";
  } else if (data.amount <= 0) {
    errors.amount = "Valor deve ser maior que 0";
  }

  // Category validation
  if (!data.category_id) {
    errors.category = "Categoria é obrigatória";
  }

  // Date validation
  if (!data.date) {
    errors.date = "Data é obrigatória";
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.date = "Formato de data inválido";
    }
  }

  // Type validation
  if (!["income", "expense"].includes(data.type)) {
    errors.type = "Tipo de transação inválido";
  }

  return errors;
}
window.validateTransactionForm = validateTransactionForm;
function showError(inputName, message) {
  const errorElement = document.querySelector(`[data-error="${inputName}"]`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
}
window.showError = showError;

function clearErrors() {
  const errorElements = document.querySelectorAll("[data-error]");
  errorElements.forEach((element) => {
    element.textContent = "";
    element.classList.add("hidden");
  });
}
window.clearErrors = clearErrors;
