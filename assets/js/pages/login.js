import { postData } from "../api/httpClient.js";
import { validateLoginData } from "../utils/validation.js";
import { showError, hideError, hideSpinnerformLoading, showSpinnerformLoading } from "../utils/helpers.js";

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
    showSpinnerformLoading()
  const response = await postData("https://localhost:44377/api/User/login", data);

  // تأكد من نجاح العملية
      if ( response.isSuccess ) {
    // خزن التوكن في localStorage
    
    localStorage.setItem("jwtToken", response.results.token);
    // خزن اسم المستخدم
    const username = document.getElementById("username").value.trim();
    console.log(response.results.role);
        console.log(response.results);

    localStorage.setItem("username", username);
    hideSpinnerformLoading()
    // انتقل للصفحة التالية
     if(response.results.role=='5')
        window.location.href = 'divorced-woman/index.html';
      else if(response.results.role=='4')
        window.location.href = 'divorced-woman/index.html';
      else if(response.results.role=='3')
        window.location.href = 'divorced-man/index.html';
      else{
            window.location.href = "admin/dashboard.html";
      }
  } else {
    showError(response.message);
  }
} catch (err) {
  showError(err.message || "فشل تسجيل الدخول.");
}finally {
    hideSpinnerformLoading();
  }
});
