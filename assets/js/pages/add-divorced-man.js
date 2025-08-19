import { postData } from "../api/httpClient.js";
import { validateAddDivorcedManData } from "../utils/validation.js";
import { showError,hideError, hideSpinnerformLoading, showSpinnerformLoading } from "../utils/helpers.js";


document.getElementById("addDivorcedManForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    FirstName: document.getElementById("firstName").value.trim(),
    MiddleName: document.getElementById("middleName").value.trim(),
    LastName: document.getElementById("lastName").value.trim(),
    PhoneNumber: document.getElementById("phone").value.trim(),
    Email: document.getElementById("email").value.trim(),
    PassportNumber: document.getElementById("passport").value.trim(),
    Address: document.getElementById("address").value.trim(),
    NID: document.getElementById("NID").value.trim(),
    DateOfBirth: document.getElementById("birthdate").value,
    Gender: '0',
    Nationality: document.querySelector("input[name='nationality']:checked")?.value,
    Role: '3',
    Username: document.getElementById("username").value.trim(),
    Password: document.getElementById("password").value.trim(),
  };

  hideError();

  const error = validateAddDivorcedManData(data);
  if (error) {
    showError(error);
    return;
  }

  try {
    showSpinnerformLoading()
    const response = await postData('https://localhost:44377/api/Person/Registration', data);

    //const result = await response.json();
    if (response.isSuccess) {
        localStorage.setItem("successMessage", response.message || "تمت العملية بنجاح");
        hideSpinnerformLoading();
        window.location.href = 'view.html';
    }if(!response.isSuccess){
        showError(response.message );
    }
  } catch (error) {
    showError('خطأ في الاتصال بالخادم');
  }finally {
    hideSpinnerformLoading();
  }

});

