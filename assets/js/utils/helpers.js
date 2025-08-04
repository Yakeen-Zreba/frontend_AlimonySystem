export function showError(msg) {
  const box = document.getElementById("error-message");
  box.textContent = msg;
  box.classList.remove("d-none");
}export function hideError() {
  const box = document.getElementById("error-message");
  box.textContent = "";
  box.classList.add("d-none");
}
export function hideErrorDialog() {
  const box = document.getElementById("error-messageDialog");
  box.textContent = "";
  box.classList.add("d-none");
}
export function showErrorDialog(msg) {
  const box = document.getElementById("error-messageDialog");
  box.textContent = msg;
  box.classList.remove("d-none");
}

console.log('***')
export function showSpinner() {

  console.log('showSpinner')
  document.getElementById("loadingSpinner").classList.remove("d-none");
}

export function hideSpinner() {
  document.getElementById("loadingSpinner").classList.add("d-none");
}

export function showSpinnerformLoading() {
  console.log('formLoading')
  document.getElementById("formLoading").classList.remove("d-none");
}

export function hideSpinnerformLoading() {
  document.getElementById("formLoading").classList.add("d-none");
}