import { postAPI } from "../api/httpClient.js";
import {  hideErrorDialog,hideSpinnerformLoading, showSpinnerformLoading ,showErrorDialog,showSuccessMessage} from "../utils/helpers.js";
const modalEl   = document.getElementById("modalAccount");
const formEl    = document.getElementById("FormModalAccount");
const userEl    = document.getElementById("usernameModalAccount");
const passEl    = document.getElementById("passwordChange");
const confEl    = document.getElementById("confPasswordChange");

const errBox    = document.getElementById("ErrorFormAccountModel");
const succBox   = document.getElementById("SuccFormAccountModel");
const saveBtn   = document.getElementById("accountSaveBtn");

modalEl.addEventListener("shown.bs.modal", () => {
  clearAlerts();
  userEl.value = getCurrentUsername();
  passEl.value = "";
  confEl.value = "";
  passEl.focus();
});
function clearAlerts() {
  errBox.classList.add("d-none");
  succBox.classList.add("d-none");
  errBox.textContent = "";
  succBox.textContent = "";
}
function getCurrentUsername() {
  return localStorage.getItem("username") || "";
}
saveBtn.addEventListener("click",  async (e) => {
  e.preventDefault(); // <-

  clearAlerts();
  const data = {
    UserId: localStorage.getItem('userId'),
    NewPassword : document.getElementById("passwordChange").value.trim(),
   
  };
  hideErrorDialog('ErrorFormAccountModel');
 if (!document.getElementById("passwordChange").value || !document.getElementById("confPasswordChange").value ) {
    showErrorDialog('(يرجى تعبئة جميع الحقول المطلوبة.','ErrorFormAccountModel');
  }
  if ( document.getElementById("passwordChange").value !=  document.getElementById("confPasswordChange").value ) {
    showErrorDialog('كلمة المرور غير متطابقة','ErrorFormAccountModel');
    return;
  }

  try {
    showSpinnerformLoading('loadingFormAccountModel')
    const response = await postAPI('http://localhost:5016/api/User/reset-password', data);

    if (response.isSuccess) {
        showSuccessMessage( response.message || "تمت العملية بنجاح",'SuccFormAccountModel');
        hideSpinnerformLoading('loadingFormAccountModel');
    } if(!response.isSuccess){
        showErrorDialog(response.message ,'ErrorFormAccountModel');
    }
  } catch (error) {
    showErrorDialog('خطأ في الاتصال بالخادم','ErrorFormAccountModel');
  }finally {
        hideSpinnerformLoading('loadingFormAccountModel');
  }
});




