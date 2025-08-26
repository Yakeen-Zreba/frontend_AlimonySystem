import { showError,  showErrorDialog,showSpinner,hideSpinner, hideSpinnerformLoading, showSpinnerformLoading, hideErrorDialog } from "../utils/helpers.js";
import {  validationUpdateEmployee } from "../utils/validationUpdateEmployee.js";
import { postAPI, GetAPI,deleteAPI } from "../api/httpClient.js";


document.addEventListener("DOMContentLoaded",async function () {
  await loadEmployees();
});

function getRoleName(role) {
  switch (role) {
    case 0: return "أدمن";
    case 1: return "موظف حكومي";
    case 2: return "المحضر";
    case 3: return "الزوج السابق";
    case 4: return "المطلقة";
    case 5: return "وكيل المطلقة";
    default: return "غير معروف";
  }
}

function getPermissionName(id) {
  switch (id) {
    case 1: return "قبول طلب النفقة";
    case 2: return "رفض طلب النفقة ";
    case 3: return "عرض طلبات النفقة";
  }
}
function getPermissionList() {
  return [
    { permissionId: 1, permissionKey: "AcceptNafaqa", permissionName: "قبول طلب نفقة" },
    { permissionId: 2, permissionKey: "RejectNafaqa", permissionName: "رفض طلب نفقة" },
    { permissionId: 3, permissionKey: "ViewReqestNafaqa", permissionName: "عرض طلبات النفقات" }
  ];
}
function SetPermission(emp){

  
    // الصلاحيات - إزالة القديمة
    const container = document.getElementById("editPermissionsList");
    container.innerHTML = "";
  
    const permData = getPermissionList();
          permData.forEach(p => {
            const label = document.createElement("label");
            label.className = "list-group-item";
  
            const checkbox = document.createElement("input");
            checkbox.className = "form-check-input me-2";
            checkbox.type = "checkbox";
            checkbox.value = p.permissionId;
  
            // ✅ إذا كانت موجودة ضمن صلاحيات الموظف يتم اختيارها
            if (emp.permissions && emp.permissions.includes(p.permissionId)) {
              checkbox.checked = true;
            }
  
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(p.permissionName));
            container.appendChild(label);
          });
      
  
}

// عند تغيير اختيار الصفة (role_type)، أظهر أو أخفِ الصلاحيات
document.querySelectorAll("input[name='role_type']").forEach(radio => {
  radio.addEventListener("change", function () {
    const roleValue = this.value;
    const permissionCard = document.getElementById("permissionsCard");

    if (roleValue === "1") {
      // موظف حكومي → أظهر الصلاحيات
      permissionCard.style.display = "block";
    } else {
      // أي صفة غير ذلك → أخفِ الصلاحيات
      permissionCard.style.display = "none";
    }
  });
});

 document.getElementById("saveEditButton").addEventListener("click",  async function (e) {
  const data = {
    personId: document.getElementById("editPersonId").value,
    userId: document.getElementById("editUserId").value,
    firstName: document.getElementById("editFirstName").value,
    middleName: document.getElementById("editMiddleName").value,
    lastName: document.getElementById("editLastName").value,
    phoneNumber: document.getElementById("editPhoneNumber").value,
    email: document.getElementById("editEmail").value,
    passportNumber: document.getElementById("editPassportNumber").value,
    nid: document.getElementById("editNID").value,
    address: document.getElementById("editAddress").value,
    dateOfBirth: document.getElementById("editBirthdate").value,
    workDepartment: document.getElementById("editWorkDepartment").value,
    gender: document.querySelector("input[name='editGender']:checked")?.value,
    nationality: document.querySelector("input[name='nationality']:checked")?.value,
    role: document.querySelector("input[name='role_type']:checked")?.value,
    permissions:document.querySelector("input[name='role_type']:checked")?.value == 1? Array.from(document.querySelectorAll("#editPermissionsList input[type='checkbox']:checked")).map(cb => parseInt(cb.value)):[]
  };
hideErrorDialog();

  const error = validationUpdateEmployee(data);
  if (error) {
    showErrorDialog(error);
    return;
  }
    try {
            showSpinnerformLoading()
       const response =   await postAPI("http://localhost:5016/api/Person/Update-employee", data);
      if (response.isSuccess ) {
        let offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('editEmployeeCanvas'));
          offcanvas.hide();
          const alertContainer = document.getElementById("alertContainer");
          alertContainer.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert" style="color: black">
              تم حفظ التعديلات بنجاح!
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          `;
          setTimeout(() => {
            alertContainer.innerHTML = '';
          }, 4000);
            hideSpinnerformLoading()
            await loadEmployees();
      } else {
        showErrorDialog(response.message || 'حدث خطأ أثناء الحفظ.');
      }
    } catch (error) {
      showErrorDialog('خطأ في الاتصال بالخادم');
    } finally {
    hideSpinnerformLoading(); //  بعد الانتهاء
  }
    
});

function showSuccessMessage(msg) {
  const box = document.getElementById("successMessageBox");
  box.textContent = msg;
  box.classList.remove("d-none");
  setTimeout(() => {
    box.classList.add("d-none");
  }, 3000);
}

async function loadEmployees() {
    try{
      showSpinner()
   
    const response = await GetAPI("http://localhost:5016/api/Person/GetAllemployee");
  
    if (response.isSuccess && Array.isArray(response.results)) {
  const tableBody = document.getElementById("employeeTableBody");
      tableBody.innerHTML = ""; // تنظيف الجدول قبل إعادة تعبئته

        response.results.forEach(emp => {
          const tr = document.createElement("tr");

          // تجهيز الصلاحيات
          let permissionHTML = `
            <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                عرض الصلاحيات
                </button>
                <ul class="dropdown-menu">`;

            if (emp.permissions && emp.permissions.length > 0) {
            emp.permissions.forEach(p => {
                permissionHTML += `<li><a class="dropdown-item" href="#">${getPermissionName(p)}</a></li>`;
            });
            } else {
            permissionHTML += `<li><a class="dropdown-item text-muted" href="#">لا توجد صلاحيات</a></li>`;
            }

            permissionHTML += `</ul></div>`;

          tr.innerHTML = `
            <td>${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}</td>
            <td><span class="badge bg-label-primary me-1">${emp.email || ''}</span></td>
            <td><span class="badge bg-label-secondary me-1">${emp.phoneNumber || ''}</span></td>
            <td><span class="badge bg-label-secondary me-1">${emp.workDepartment || 'غير محدد'}</span></td>
            <td><span class="badge bg-label-secondary me-1">${getRoleName(emp.role)}</span></td>
            <td>${permissionHTML}</td>
            <td><span class="badge ${emp.isActive ? 'bg-label-success' : 'bg-label-danger'} me-1">${emp.isActive ? 'نشط' : 'غير نشط'}</span></td>
           
          `;

        // إنشاء عمود الإجراءات (قائمة منسدلة مثل الصورة)
        const tdActions = document.createElement("td");
        tdActions.innerHTML = `
          <div class="dropdown">
            <button class="btn p-0 dropdown-toggle hide-arrow" type="button" data-bs-toggle="dropdown">
              <i class="bx bx-dots-vertical-rounded"></i>
            </button>
            <div class="dropdown-menu text-end">
              <a class="dropdown-item edit-action" href="#"><i class="bx bx-edit-alt me-1"></i> تعديل</a>
              <a class="dropdown-item text-danger btn-delete" href="#" data-id="${emp.personId}">
                  <i class="icon-base bx bx-trash me-1"></i> حذف
              </a>
              <a class="dropdown-item toggle-status-btn" href="#"
                data-id="${emp.personId}"
                data-status="${emp.isActive}">
                <i class="icon-base bx bx-refresh me-1"></i>
                ${emp.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
              </a>
            </div>
          </div>`;

//  عند الضغط على "تعديل"
tdActions.querySelector(".edit-action").addEventListener("click", () => {
  const offcanvasElement = document.getElementById("editEmployeeCanvas");
  const offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
  offcanvasInstance.show();

  document.getElementById("editPersonId").value = emp.personId || '';
  document.getElementById("editUserId").value = emp.userId || '';
  document.getElementById("editFirstName").value = emp.firstName || '';
  document.getElementById("editMiddleName").value = emp.middleName || '';
  document.getElementById("editLastName").value = emp.lastName || '';
  document.getElementById("editPhoneNumber").value = emp.phoneNumber || '';
  document.getElementById("editPassportNumber").value = emp.passportNumber || '';
  document.getElementById("editNID").value = emp.nid || '';
  document.getElementById("editBirthdate").value = emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '';
  document.getElementById("editAddress").value = emp.address || '';
  document.getElementById("editEmail").value = emp.email || '';
  document.getElementById("editWorkDepartment").value = emp.workDepartment || '';

  if (emp.gender !== null && emp.gender !== undefined)
    document.querySelector(`input[name='editGender'][value='${emp.gender}']`).checked = true;

  if (emp.nationality === 0)
    document.getElementById("editLibyan").checked = true;
  else if (emp.nationality === 1)
    document.getElementById("editForeign").checked = true;

  if (emp.role === 1) {
    document.getElementById("editEmployee").checked = true;
    document.getElementById("permissionsCard").style.display = "block";
    SetPermission(emp);
  } else {
    document.getElementById("permissionsCard").style.display = "none";
  }
});

// (يمكنك لاحقًا ربط delete-action و toggle-action بنفس الطريقة)
tr.appendChild(tdActions);

//  أخيرًا: أضف الصف للجدول
tableBody.appendChild(tr);
          tableBody.appendChild(tr);
     });
    } else {
      showError("فشل في جلب البيانات");
    }
  } catch (error) {
    showError("تعذر الاتصال بالخادم", error);
  } 
  finally {
    hideSpinner(); //  بعد الانتهاء
  }
}

document.querySelectorAll("input[name='role_type']").forEach(radio => {
  radio.addEventListener("change", function () {
    console.log('*******')
    const roleValue = this.value;
    const permissionCard = document.getElementById("permissionsCard");

    if (roleValue === "1") {
      //  إذا تم اختيار موظف حكومي، أظهر الصلاحيات وقم بإعادة تحميلها بدون الاعتماد على بيانات الموظف السابقة
      permissionCard.style.display = "block";
      SetPermission({ permissions: [] }); // تمرير كائن فارغ ليتم تحميل كل الصلاحيات بدون تحديد أي منها
    } else {
      // أي صفة أخرى → أخفِ الصلاحيات
      permissionCard.style.display = "none";
      // اختيار كل checkboxes كـ غير محددة
      document.getElementById("editPermissionsList").innerHTML = "";
    }
  });
});


/*تفعل والغاء التفعيل */
document.getElementById("employeeTableBody").addEventListener("click", async function (e) {
  if (e.target.closest(".toggle-status-btn")) {
    e.preventDefault();

    const btn = e.target.closest(".toggle-status-btn");
    const personId = btn.dataset.id;
    const currentStatus = btn.dataset.status === "true";
    // const modifiedBy = "8FD8EBF5-4D67-455B-81AF-8E07628AEC1C"; // <-- يستبدل بالمعرّف الحقيقي للمستخدم المعدل

    const confirmMsg = currentStatus
      ? "هل أنت متأكد من إلغاء تفعيل هذا المستخدم؟"
      : "هل أنت متأكد من تفعيل هذا المستخدم؟";

    if (confirm(confirmMsg)) {
      try {
        const response = await GetAPI(`http://localhost:5016/api/Person/Active_Deactive_User?personId=${personId}&activate=${!currentStatus}`);
         if (response.isSuccess ) {
            await loadEmployees(); 
            showSuccessMessage("تم تحديث حالة المستخدم بنجاح.");
      }
      else{
           showError("فشل تغيير الحالة: " + response.message);
      }
    }
    catch (error) {
      showError("حدث خطأ أثناء محاولة تغيير الحالة.");
    } 
    }
  }
});

/*الحذف*/
document.getElementById("employeeTableBody").addEventListener("click", async function (e) {
  const deleteBtn = e.target.closest(".btn-delete");
  if (deleteBtn) {
    e.preventDefault();
    const personId = deleteBtn.dataset.id;
    const modifiedBy = localStorage.getItem("userId") || "00000000-0000-0000-0000-000000000000";

    if (confirm(" هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذه العملية.")) {
      try {
        showSpinner();
        const url = `http://localhost:5016/api/Person/DeleteUser?personId=${personId}&modifiedBy=${modifiedBy}`;
        const response = await deleteAPI(url);

        if (response.isSuccess) {
          deleteBtn.closest("tr").remove();
          showSuccessMessage(" تم حذف المستخدم بنجاح.");
        } else {
          showError(" فشل الحذف: " + response.message);
        }
      } catch (error) {
        showError(" حدث خطأ أثناء محاولة الحذف.");
      } finally {
        hideSpinner();
      }
    }
  }
});