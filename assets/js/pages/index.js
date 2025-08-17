document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");

  if (username) {

    const usernameElement = document.getElementById("usernameDisplay");
    if (usernameElement) {
      usernameElement.textContent = username;
    }
  }
});