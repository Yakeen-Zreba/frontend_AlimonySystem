document.addEventListener("DOMContentLoaded", function () {
  
  const msg = localStorage.getItem("successMessage");
  if (msg) {
    const box = document.getElementById("successMessageBox");
    if (box) {
      box.textContent = msg;
      box.classList.remove("d-none");

      // إخفاء الرسالة بعد 5 ثواني 
      setTimeout(() => {
        box.classList.add("d-none");
        localStorage.removeItem("successMessage");
      }, 5000);
    }
  }
  
  //  كود جلب بيانات الأزواج السابقين
  fetch("https://localhost:44377/api/Person/GetHusbands")
    .then(response => response.json())
    .then(data => {
      if (data.isSuccess && Array.isArray(data.results)) {
        const tableBody = document.getElementById("divorcedManTableBody");

        data.results.forEach(emp => {
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td>${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}</td>
            <td><span class="badge bg-label-primary me-1">${emp.email || ''}</span></td>
            <td><span class="badge bg-label-secondary me-1">${emp.phoneNumber || ''}</span></td>
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
