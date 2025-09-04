export function showError(msg) {
  const box = document.getElementById("error-message");
  box.textContent = msg;
  box.classList.remove("d-none");
}export function hideError() {
  const box = document.getElementById("error-message");
  box.textContent = "";
  box.classList.add("d-none");
}
export function hideErrorDialog(name="error-messageDialog") {
  const box = document.getElementById(name);
  box.textContent = "";
  box.classList.add("d-none");
}
export function showErrorDialog(msg,name="error-messageDialog") {
  const box = document.getElementById(name);
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

export function showSpinnerformLoading(nameForm="formLoading") {
  document.getElementById(nameForm).classList.remove("d-none");
}

export function hideSpinnerformLoading(nameForm="formLoading") {
  console.log(nameForm)
  document.getElementById(nameForm).classList.add("d-none");
}

export function showSuccessMessage(msg,name='successMessageBox') {
  const box = document.getElementById(name);
  box.textContent = msg;
  box.classList.remove("d-none");
  setTimeout(() => box.classList.add("d-none"), 3000);
}

export function showSuccessMessageDialog(msg) {
  const box = document.getElementById("successMessageDialog");
  box.textContent = msg;
  box.classList.remove("d-none");
  setTimeout(() => box.classList.add("d-none"), 3000);
}