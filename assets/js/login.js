  document.getElementById("formLogin").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorBox = document.getElementById("error-message");

    function showError(message) {
      errorBox.textContent = message;
      errorBox.classList.remove("d-none");
    }

    function hideError() {
      errorBox.classList.add("d-none");
    }

    hideError();

    // التحقق من الحقول
    if (!username || !password) {
      showError("يرجى تعبئة اسم المستخدم وكلمة المرور.");
      return;
    }


    if (password.length < 8) {
      showError("كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.");
      return;
    }

    const data = { username, password };

    fetch("https://example.com/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) throw new Error("فشل في تسجيل الدخول. تأكد من صحة البيانات.");
        return response.json();
      })
      .then(result => {
        // نجاح الدخول
        hideError();
        window.location.href = "dashboard.html";
      })
      .catch(error => {
        showError(error.message);
      });
  });