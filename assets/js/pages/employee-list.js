import { showError, hideError, showErrorDialog,showSpinner,hideSpinner, hideSpinnerformLoading, showSpinnerformLoading } from "../utils/helpers.js";

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

    try {
            showSpinnerformLoading()

      const response = await fetch('https://localhost:44377/api/Person/Update-employee?UserId=60A2D0D6-A02A-4F54-9FCC-3D3B9A66F48B', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok && result.isSuccess ) {
        let offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('editEmployeeCanvas'));
          offcanvas.hide();
            hideSpinnerformLoading()
            await loadEmployees();
      } else {
        showErrorDialog(result.message || 'حدث خطأ أثناء الحفظ.');


      }
    } catch (error) {
      showErrorDialog('خطأ في الاتصال بالخادم');
    } finally {
    hideSpinnerformLoading(); // 👈 بعد الانتهاء
  }
    
});

async function loadEmployees() {
    try{
      showSpinner()
      console.log('call show')
    const response = await fetch("https://localhost:44377/api/Person/GetAllemployee");
    const data = await response.json();
    if (data.isSuccess && Array.isArray(data.results)) {
  const tableBody = document.getElementById("employeeTableBody");
      tableBody.innerHTML = ""; // تنظيف الجدول قبل إعادة تعبئته

        data.results.forEach(emp => {
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

// ✅ إنشاء زر "تعديل"
const tdEdit = document.createElement("td");
const editButton = document.createElement("a");
editButton.href = "#";
editButton.className = "dropdown-item";
editButton.setAttribute("data-bs-toggle", "offcanvas");
editButton.setAttribute("data-bs-target", "#editEmployeeCanvas");
editButton.innerHTML = `<i class="icon-base bx bx-edit-alt me-1"></i>`;
// ✅ تعبئة البيانات عند النقر
editButton.addEventListener("click", () => {
  document.getElementById("editPersonId").value = emp.personId || '';
  document.getElementById("editUserId").value = emp.userId || '';
  document.getElementById("editFirstName").value = emp.firstName || '';
  document.getElementById("editMiddleName").value = emp.middleName || '';
  document.getElementById("editLastName").value = emp.lastName || '';
  document.getElementById("editPhoneNumber").value = emp.phoneNumber || '';
  document.getElementById("editPassportNumber").value = emp.passportNumber || '';
  document.getElementById("editNID").value = emp.nid || '';
  document.getElementById("editBirthdate").value =  emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '';
  document.getElementById("editAddress").value = emp.address || '';
  document.getElementById("editEmail").value = emp.email || '';
  document.getElementById("editWorkDepartment").value = emp.workDepartment || '';

  if (emp.gender !== null && emp.gender !== undefined) {

    document.querySelector(`input[name='editGender'][value='${emp.gender}']`).checked = true;
  }
  if (emp.nationality === 0) {

    document.getElementById("editLibyan").checked = true;
  } else if (emp.nationality === 1) {
    document.getElementById("editForeign").checked = true;
  }

  // الصفة
  if (emp.role === 1) {
    document.getElementById("editEmployee").checked = true;
    document.getElementById("permissionsCard").style.display = "block";
    SetPermission(emp)

  } else if (emp.role === 2) {
    document.getElementById("editFollowUpAgent").checked = true;
    document.getElementById("permissionsCard").style.display = "none";
  }

});

// ✅ إضافة زر التعديل للصف
tdEdit.appendChild(editButton);
tr.appendChild(tdEdit);

// ✅ أخيرًا: أضف الصف للجدول
tableBody.appendChild(tr);
          tableBody.appendChild(tr);
     });
    } else {
      showError("فشل في جلب البيانات");
    }
  } catch (error) {
    showError("حدث خطأ في الاتصال بالـ API", error);
  } 
  finally {
    hideSpinner(); // 👈 بعد الانتهاء
  }
}