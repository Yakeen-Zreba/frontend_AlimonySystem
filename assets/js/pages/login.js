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
    // خزن اسم المستخدم/الدور  
    const username = document.getElementById("username").value.trim();
    const role = response.results.role;
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);

    hideSpinnerformLoading()
    // انتقل للصفحة التالية


    console.log(response)
    console.log(response.results.role)
    console.log(response.results.role)
     if(response.results.role=='5' || response.results.role=='4' ){
      localStorage.setItem('userRole', 'woman'); // أو 'user'

        window.location.href = 'divorced-woman/index.html';
     }
      else if(response.results.role=='3'){
              localStorage.setItem('userRole', 'man'); // أو 'user'
                window.location.href = 'divorced-man/view.html';
      }
       else if(response.results.role=='2'){
              localStorage.setItem('userRole', 'mohder'); // أو 'محضر'
                window.location.href = 'divorced-man/view.html';
      }
       else if  (response.results.role=='1' || response.results.role=='0'){
         localStorage.setItem('userRole', 'gov'); // أو 'user'
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
