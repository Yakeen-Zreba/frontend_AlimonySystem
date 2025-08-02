export function showError(msg) {
  const box = document.getElementById("error-message");
  box.textContent = msg;
  box.classList.remove("d-none");
}

export function hideError() {
  const box = document.getElementById("error-message");
  box.textContent = "";
  box.classList.add("d-none");
}