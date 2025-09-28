import { postData } from "../api/httpClient.js";
import { validateRegisterData } from "../utils/validation.js";
import { showError,hideError, hideSpinnerformLoading, showSpinnerformLoading } from "../utils/helpers.js";

document.getElementById("formRegister").addEventListener("submit", async function (e) {
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
    Gender: document.querySelector("input[name='gender']:checked")?.value,
    Nationality: document.querySelector("input[name='nationality']:checked")?.value,
    Role: document.querySelector("input[name='role_type']:checked")?.value,
    Username: document.getElementById("username").value.trim(),
    Password: document.getElementById("password").value.trim(),
        AgentName:  document.querySelector("input[name='role_type']:checked")?.value == 5 ?document.getElementById("agentName").value??"": "",
  };

  hideError();

  const error = validateRegisterData(data);
  if (error) {
    showError(error);
    return;
  }

  try {
    showSpinnerformLoading()
    const response = await postData('http://localhost:5016/api/Person/Registration', data);
    // const result = await response.json();

    if (response.isSuccess) {
      const username = document.getElementById("username").value.trim();
      localStorage.setItem("username", username);
      hideSpinnerformLoading()
             window.location.href = '../html/login.html';

    } if(!response.isSuccess){
        showError(response.message );
    }
  } catch (error) {
    showError('خطأ في الاتصال بالخادم');
  }finally {
    hideSpinnerformLoading();
  }
});


