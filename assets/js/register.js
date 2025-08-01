
  document.getElementById("formRegister").addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const accepted = document.getElementById("terms-conditions").checked;
    const errorBox = document.getElementById("error-message");


    function showError(message) {
      errorBox.textContent = message;
      errorBox.classList.remove("d-none");
    }

    function hideError() {
      errorBox.classList.add("d-none");
      errorBox.textContent = "";
    }

    hideError();

    // تحقق من الحقول الفارغة
    if (!fullName || !email || !password) {
      showError("يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }

    // تحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("يرجى إدخال بريد إلكتروني صالح.");
      return;
    }

    // تحقق من قوة كلمة المرور
    if (password.length < 8) {
      showError("يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.");
      return;
    }

    // تحقق من الموافقة على الشروط
    if (!accepted) {
      showError("يجب الموافقة على سياسة الخصوصية والشروط.");
      return;
    }

    // تجهيز البيانات للإرسال
    const data = { fullName, email, password };

    // إرسال البيانات إلى API
    fetch("https://example.com/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("حدث خطأ أثناء إنشاء الحساب.");
        }
        return response.json();
      })
      .then((result) => {
        hideError();
        // يمكنك عرض رسالة نجاح هنا
        alert("تم إنشاء الحساب بنجاح!");
        // window.location.href = "auth-login-basic.html";
      })
      .catch((error) => {
        showError(error.message);
      });
  });

