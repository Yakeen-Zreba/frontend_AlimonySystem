import { postData } from "../api/httpClient.js";
import { validateRegisterData } from "../utils/validation.js";
import { showError, hideError } from "../utils/helpers.js";

document.getElementById("addDivorcedRepresentationForm").addEventListener("submit", async function (e) {
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
  };

  hideError();

  const error = validateRegisterData(data);
  if (error) {
    showError(error);
    return;
  }

  try {
    const response = await fetch('https://localhost:44377/api/Person/Registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

  const result = await response.json();
    if (response.ok && result.isSuccess) {
      localStorage.setItem("successMessage", result.message || "تمت العملية بنجاح");
        if(data.Role==='5')
        window.location.href = 'divorced-woman/view.html';
      else if(data.Role==='4')
        window.location.href = 'divorced-woman/view.html';
      else if(data.Role==='3')
        window.location.href = 'divorced-man/view.html';
    }if(!result.isSuccess){
        showError(result.message );
    }
  } catch (error) {
    showError('خطأ في الاتصال بالخادم');
  }

});

