document.getElementById("logout-btn").addEventListener("click", function () {
  localStorage.removeItem("username");
  window.location.href = "auth-login-basic.html";
});