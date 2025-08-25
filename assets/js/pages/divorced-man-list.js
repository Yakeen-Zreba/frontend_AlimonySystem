import { showError,  showErrorDialog,showSpinner,hideSpinner, hideSpinnerformLoading, showSpinnerformLoading, hideErrorDialog } from "../utils/helpers.js";
import { putAPI, GetAPI, deleteAPI } from "../api/httpClient.js";
import {  validationUpdateDivorcedMan } from "../utils/validationUpdateDivorcedMan.js";

async function loadEmployees() {
  try {
    showSpinner();
    const response = await GetAPI("https://localhost:44377/api/Person/GetHusbands",'../../login.html');
    if (response.isSuccess && Array.isArray(response.results)) {
      const tableBody = document.getElementById("divorcedManTableBody");
          tableBody.innerHTML = ""; // تنظيف الجدول قبل إعادة تعبئته

            response.results.forEach(divo => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
            <td>${divo.firstName || ''} ${divo.middleName || ''} ${divo.lastName || ''}</td>
            <td><span class="badge bg-label-primary me-1">${divo.email || ''}</span></td>
            <td><span class="badge bg-label-secondary me-1">${divo.phoneNumber || ''}</span></td>
            <td><span class="badge ${divo.isActive ? 'bg-label-success' : 'bg-label-danger'} me-1 status-text">${divo.isActive ? 'نشط' : 'غير نشط'}</span></td>
            <td>
            <div class="dropdown">
              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                <i class="icon-base bx bx-dots-vertical-rounded"></i>
              </button>
              <div class="dropdown-menu">
                <a class="dropdown-item btn-edit" href="#" data-id="${divo.personId}">
                  <i class="icon-base bx bx-edit-alt me-1"></i> تعديل
                </a>
                <a class="dropdown-item text-danger btn-delete" href="#" data-id="${divo.personId}">
                  <i class="icon-base bx bx-trash me-1"></i> حذف
                </a>
                <a class="dropdown-item toggle-status-btn" href="#"
                  data-id="${divo.personId}"
                  data-status="${divo.isActive}">
                  <i class="icon-base bx bx-refresh me-1"></i>
                  ${divo.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                </a>
              </div>
            </div
            </td>`;

          tableBody.appendChild(tr);
          // زر تعديل (يفتح offcanvas ويملأ البيانات)
          tr.querySelector(".btn-edit").addEventListener("click", () => {
            document.getElementById("editPersonId").value = divo.personId || '';
            document.getElementById("editUserId").value = divo.userId || '';
            document.getElementById("editFirstName").value = divo.firstName || '';
            document.getElementById("editMiddleName").value = divo.middleName || '';
            document.getElementById("editLastName").value = divo.lastName || '';
            document.getElementById("editPhoneNumber").value = divo.phoneNumber || '';
            document.getElementById("editPassportNumber").value = divo.passportNumber || '';
            document.getElementById("editNID").value = divo.nid || '';
            document.getElementById("editBirthdate").value = divo.dateOfBirth ? divo.dateOfBirth.split('T')[0] : '';
            document.getElementById("editAddress").value = divo.address || '';
            document.getElementById("editEmail").value = divo.email || '';
            document.getElementById("editWorkDepartment").value = divo.workDepartment || '';


            if (divo.nationality === 0) {
              document.getElementById("editLibyan").checked = true;
            } else if (divo.nationality === 1) {
              document.getElementById("editForeign").checked = true;
            }
            
            // فتح الـ offcanvas يدويًا
            const canvas = new bootstrap.Offcanvas('#editDivorcedCanvas');
            canvas.show();
          });
     });
    } else {
      showError("فشل في جلب البيانات");
    }
  } catch (error) {
    showError("تعذر الاتصال بالخادم", error);
  } 
  finally {
    hideSpinner(); 
  }
}

document.addEventListener("DOMContentLoaded",async function () {
  await loadEmployees();
});

function getRoleName(role) {
  switch (role) {
    case 1: return "موظف حكومي";
    case 2: return "المحضر";
    case 3: return "الزوج السابق";
    case 4: return "مطلقة";
    case 5: return "وكيل المطلقة";
    default: return "غير معروف";
  }
}

/*تفعل والغاء التفعيل */
document.getElementById("divorcedManTableBody").addEventListener("click", async function (e) {
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
        const response = await GetAPI(`https://localhost:44377/api/Person/Active_Deactive_User?personId=${personId}&activate=${!currentStatus}`,'../../login.html');
         if (response.isSuccess ) {
            const statusCell = btn.closest("tr").querySelector(".status-text");
            statusCell.textContent = !currentStatus ? "نشط" : "غير نشط";
            statusCell.classList.toggle("bg-label-success", !currentStatus);
            statusCell.classList.toggle("bg-label-danger", currentStatus);

            // تحديث الزر
            btn.dataset.status = (!currentStatus).toString();
            btn.innerHTML = `<i class="icon-base bx bx-refresh me-1"></i> ${!currentStatus ? 'إلغاء تنشيط' : 'تنشيط'}`;

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


function showSuccessMessage(msg) {
  const box = document.getElementById("successMessageBox");
  box.textContent = msg;
  box.classList.remove("d-none");
  setTimeout(() => {
    box.classList.add("d-none");
  }, 3000);
}

/*الحذف */

/*الحذف*/
document.getElementById("divorcedManTableBody").addEventListener("click", async function (e) {
  const deleteBtn = e.target.closest(".btn-delete");
  if (deleteBtn) {
    e.preventDefault();
    const personId = deleteBtn.dataset.id;
    const modifiedBy = localStorage.getItem("userId") || "00000000-0000-0000-0000-000000000000";

    if (confirm(" هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذه العملية.")) {
      try {
        showSpinner();
        const url = `https://localhost:44377/api/Person/DeleteUser?personId=${personId}&modifiedBy=${modifiedBy}`;
        const response = await deleteAPI(url,'../../login.html');

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



/*البحث */

document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase().trim();
  const rows = document.querySelectorAll("#divorcedManTableBody tr");

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? "" : "none";
  });
});


/* التعديل */

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
    role: '3'
  };
hideErrorDialog();

  const error = validationUpdateDivorcedMan(data);
  if (error) {
    showErrorDialog(error);
    return;
  }
    try {
      showSpinnerformLoading()
      const response =   await putAPI("https://localhost:44377/api/Person/update", data);
      if (response.isSuccess ) {
        let offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('editDivorcedCanvas'));
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
        console.log(response.message)
        showErrorDialog(response.message || 'حدث خطأ أثناء الحفظ.');


      }
    } catch (error) {
      showErrorDialog('خطأ في الاتصال بالخادم');
    } finally {
    hideSpinnerformLoading(); 
  }
    
});