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
    await postData("https://localhost:44377/api/User/login", data);
      const username = document.getElementById("username").value.trim();
      localStorage.setItem("username", username);
      window.location.href = "../../html/divorced-man/index.html";
  } catch (err) {
    showError(err.message || "فشل تسجيل الدخول.");
  }
});
