import { postData } from "../api/httpClient.js";
import { validateRegisterData } from "../utils/validation.js";
import { showError,hideError, hideSpinnerformLoading, showSpinnerformLoading } from "../utils/helpers.js";


document.getElementById("addEmployeeForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const selectedPermissions = Array.from(document.querySelectorAll('#permissionsList input[type="checkbox"]:checked'))
  .map(cb => parseInt(cb.value));

  const data = {
    FirstName: document.getElementById("firstName").value.trim(),
    MiddleName: document.getElementById("middleName").value.trim(),
    LastName: document.getElementById("lastName").value.trim(),
    PhoneNumber: document.getElementById("phone").value.trim(),
    Email: document.getElementById("email").value.trim(),
    PassportNumber: document.getElementById("passport").value.trim(),
    Address: document.getElementById("address").value.trim(),
    NID: document.getElementById("NID").value.trim(),
    DateOfBirth: document.getElementById("birthdate").value,
    Gender: document.querySelector("input[name='gender']:checked")?.value,
    Nationality: document.querySelector("input[name='nationality']:checked")?.value,
    Role: document.querySelector("input[name='role_type']:checked")?.value,
    Username: document.getElementById("username").value.trim(),
    Password: document.getElementById("password").value.trim(),
    WorkDepartment: document.getElementById("workDepartment").value.trim(),
   Permissions: selectedPermissions
  };
  hideError();

  const error = validateRegisterData(data);
  if (error) {
    showError(error);
    return;
  }

  try {
    showSpinnerformLoading()
    const response = await postData('http://localhost:5016/api/Person/add-employee', data);

    if (response.isSuccess) {
        localStorage.setItem("successMessage", response.message || "تمت العملية بنجاح");
        hideSpinnerformLoading();
        window.location.href = 'view.html';
    } if(!response.isSuccess){
        showError(response.message );
    }
  } catch (error) {
    showError('خطأ في الاتصال بالخادم');
  }finally {
    hideSpinnerformLoading();
  }
});


async function loadPermissions() {
  try {
    const response = await fetch('http://localhost:5016/api/UserPermissions/all-permissions');
    const data = await response.json();

    //  استخراج القائمة من داخل "results"
    const permissions = data.results;

    const permissionsContainer = document.getElementById("permissionsList");
    permissionsContainer.innerHTML = '';

    permissions.forEach(permission => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-check-input me-2";
      checkbox.value = permission.permissionId;
      checkbox.id = `perm_${permission.permissionId}`;

      const label = document.createElement("label");
      label.className = "list-group-item";
      label.appendChild(checkbox);
      label.append(permission.permissionName);

      permissionsContainer.appendChild(label);
    });

  } catch (error) {
    console.error("خطأ في تحميل الصلاحيات:", error);
  }
}
// document.addEventListener("DOMContentLoaded", loadPermissions);

function togglePermissionsVisibility() {
  const selectedRole = document.querySelector("input[name='role_type']:checked")?.value;
  const permissionsCard = document.getElementById("permissionsCard");

  if (selectedRole === "1") {
      loadPermissions()
    // نعرض الصلاحيات
    permissionsCard.style.display = "block"; 
   } 
    else {  
        // إذا كان محضر (FollowUpAgent)، نخفي الصلاحيات

       permissionsCard.style.display = "none";

  }
}

//  شغّلها عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  togglePermissionsVisibility();

  //  شغّلها عند تغيير اختيار الصفة
  document.querySelectorAll("input[name='role_type']").forEach(input => {
    input.addEventListener("change", togglePermissionsVisibility);
  });
});


