function handleDelete({ type, id, onSuccess }) {
  const typeTranslation = type === "transaction" ? "transação" : "categoria";

  Swal.fire({
    title: "Tem certeza?",
    text: `Esta ${typeTranslation} será excluída permanentemente.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sim, excluir!",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${API_BASE_URL}/${type}/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Falha ao excluir ${typeTranslation}`);
          }

          Swal.fire(
            "Excluído!",
            `A ${typeTranslation} foi excluída.`,
            "success"
          );

          if (type === "category") {
            refreshAllCategorySelects();
          }

          if (onSuccess) onSuccess();
        })
        .catch((error) => {
          console.error(`Erro ao excluir ${typeTranslation}:`, error);
          Swal.fire(
            "Erro",
            `Falha ao excluir ${typeTranslation}. Por favor, tente novamente.`,
            "error"
          );
        });
    }
  });
}

function refreshAllCategorySelects() {
  loadCategoriesForSelect();

  const editModal = document.getElementById("editTransactionModal");
  if (editModal) {
    loadCategoriesForEditSelect(editModal);
  }
}

window.refreshAllCategorySelects = refreshAllCategorySelects;

// Add click handlers for delete buttons
document.addEventListener("click", function (e) {
  const deleteButton = e.target.closest("[data-delete-handler]");
  if (!deleteButton) return;

  e.preventDefault();

  const resourceType = deleteButton.dataset.resourceType;
  const resourceId = deleteButton.dataset.resourceId;

  if (!resourceType || !resourceId) {
    console.error("Missing resource type or ID for delete operation");
    return;
  }

  handleDelete({
    type: resourceType,
    id: resourceId,
    onSuccess: loadInitialData,
  });
});
