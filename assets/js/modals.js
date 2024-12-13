const modalContainer = document.getElementById("modalContainer");
const modalContents = document.querySelectorAll(".modal-content");

// Close all modals helper function
function closeAllModals() {
  modalContainer.classList.add("hidden");
  modalContainer.classList.remove("grid");
  modalContents.forEach(function (modal) {
    modal.classList.add("hidden");
  });
}

// Open modal
document.addEventListener("click", function (e) {
  const trigger = e.target.closest("[data-modal-target]");
  if (!trigger) return;

  const modalId = trigger.dataset.modalTarget;
  const modalContent = document.getElementById(modalId);

  if (modalContent) {
    // Close any open modals first
    closeAllModals();

    // Then open the new modal
    modalContainer.classList.remove("hidden");
    modalContainer.classList.add("grid");
    modalContent.classList.remove("hidden");
  }
});

// Close modal
document.addEventListener("click", function (e) {
  const isCloseButton = e.target.closest("[data-modal-close]");
  const isOutsideClick = e.target === modalContainer;

  if (isCloseButton || isOutsideClick) {
    closeAllModals();
  }
});

// Export modal functions for use in other files
window.closeModal = closeAllModals;
