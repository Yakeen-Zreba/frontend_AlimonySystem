document.addEventListener("DOMContentLoaded", function () {
  fetch("https://localhost:44377/api/Person/Get_All_employee")
    .then(response => response.json())
    .then(data => {
      if (data.isSuccess && Array.isArray(data.results)) {
        const tableBody = document.getElementById("employeeTableBody");

        data.results.forEach(emp => {
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td>${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}</td>
            <td><span class="badge bg-label-primary me-1">${emp.email || ''}</span></td>
            <td><span class="badge bg-label-secondary me-1">${emp.phoneNumber || ''}</span></td>
            <td><span class="badge bg-label-secondary me-1">${emp.workDepartment || 'غير محدد'}</span></td>
            <td><span class="badge bg-label-secondary me-1">${getRoleName(emp.role)}</span></td>
            <td><span class="badge ${emp.isActive ? 'bg-label-success' : 'bg-label-danger'} me-1">${emp.isActive ? 'نشط' : 'غير نشط'}</span></td>
            <td>
              <div class="dropdown">
                <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                  <i class="icon-base bx bx-dots-vertical-rounded"></i>
                </button>
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="#"><i class="icon-base bx bx-edit-alt me-1"></i> تعديل</a>
                  <a class="dropdown-item" href="#"><i class="icon-base bx bx-trash me-1"></i> حذف</a>
                </div>
              </div>
            </td>
          `;

          tableBody.appendChild(tr);
        });
      } else {
        console.error("فشل في جلب البيانات");
      }
    })
    .catch(error => console.error("حدث خطأ في الاتصال بالـ API:", error));
});

function getRoleName(role) {
  switch (role) {
    case 1: return "موظف حكومي";
    case 2: return "المحضر";
    case 3: return "الزوج السابق";
    case 4: return " المطلقة";
    case 5: return " وكيل المطلقة";
    default: return "غير معروف";
  }
}