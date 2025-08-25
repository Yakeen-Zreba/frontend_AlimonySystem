

document.getElementById("logout-btn").addEventListener("click", function () {
  localStorage.clear();
  window.location.href = LOGIN_PAGE;
});