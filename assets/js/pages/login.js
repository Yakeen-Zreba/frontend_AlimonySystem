import { postData } from "../api/httpClient.js";
import { validateLoginData } from "../utils/validation.js";
import { showError, hideError } from "../utils/helpers.js";

document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    Username: document.getElementById("username").value.trim(),
    Password: document.getElementById("password").value.trim()
  };

  hideError();

  const error = validateLoginData(data);
  if (error) {
    showError(error);
    return;
  }

 try {
    localStorage.removeItem("jwtToken");
  const response = await postData("https://localhost:44377/api/User/login", data);

  // تأكد من نجاح العملية

      if ( response.isSuccess ) {
    // خزن التوكن في localStorage

 
    localStorage.setItem("jwtToken", response.results.token);
    // خزن اسم المستخدم
    const username = document.getElementById("username").value.trim();
    localStorage.setItem("username", username);

    // انتقل للصفحة التالية
     if(response.results.Role==='5')
        window.location.href = 'divorced-woman/view.html';
      else if(response.results.Role==='4')
        window.location.href = 'divorced-woman/view.html';
      else if(response.results.Role==='3')
        window.location.href = 'divorced-man/view.html';
      else{
            window.location.href = "admin/dashboard.html";
      }
  } else {
    showError(response.message);
  }
} catch (err) {
  showError(err.message || "فشل تسجيل الدخول.");
}
});
