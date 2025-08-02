import { postData } from "../api/httpClient.js";
import { validateRegisterData } from "../utils/validation.js";
import { showError, hideError } from "../utils/helpers.js";

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

    if (response.ok) {
      if(data.Role==='5')
        window.location.href = '../../html/divorced-woman/index.html';
      else if(data.Role==='4')
        window.location.href = '../../html/divorced-woman/index.html';
      else if(data.Role==='3')
        window.location.href = '../../html/divorced-man/index.html';
    } else {
      const result = await response.json();
      showError(result.message || 'حدث خطأ أثناء التسجيل.');
    }
  } catch (error) {
    showError('خطأ في الاتصال بالخادم');
  }
});



//  document.getElementById('formRegister').addEventListener('submit', async function (e) {
//         e.preventDefault();

//         const errorBox = document.getElementById('error-message');

//         function showError(message) {
//           errorBox.textContent = message;
//           errorBox.classList.remove("d-none");
//         }

//         function hideError() {
//           errorBox.classList.add("d-none");
//           errorBox.textContent = "";
//         }

//         const data = {
//           FirstName: document.getElementById("firstName").value.trim(),
//           MiddleName: document.getElementById("middleName").value.trim(),
//           LastName: document.getElementById("lastName").value.trim(),
//           PhoneNumber: document.getElementById("phone").value.trim(),
//           Email: document.getElementById("email").value.trim(),
//           PassportNumber: document.getElementById("passport").value.trim(),
//           Address: document.getElementById("address").value.trim(),
//           NID: document.getElementById("NID").value.trim(),
//           DateOfBirth: document.getElementById("birthdate").value,
//           Gender: document.querySelector("input[name='gender']:checked")?.value,
//           Nationality: document.querySelector("input[name='nationality']:checked")?.value,
//           Role: document.querySelector("input[name='role_type']:checked")?.value,
//           Username: document.getElementById("username").value.trim(),
//           Password: document.getElementById("password").value.trim(),
//         };

//         hideError();
//         try {
//           const response = await fetch('https://localhost:44377/api/Person/Registration', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//           });

//           if (response.ok) {
//             if(data.Role==='5')
//               window.location.href = '../../html/divorced-woman/index.html';
//             else if(data.Role==='2')
//               window.location.href = '../../html/divorced-woman/index.html';
//             else if(data.Role==='3')
//               window.location.href = '../../html/divorced-man/index.html';
//           } else {
//             const result = await response.json();
//             showError(result.message || 'حدث خطأ أثناء التسجيل.');
//           }
//         } catch (error) {
//           showError('خطأ في الاتصال بالخادم');
//         }
//       });