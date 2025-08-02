document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");

  if (username) {
    document.getElementById("welcome-user").textContent = `مرحبًا، ${username}`;
  }
});