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

        data.results.forEach(divo => {
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
                <a class="dropdown-item" href="#"><i class="icon-base bx bx-edit-alt me-1"></i> تعديل</a>
                <a class="dropdown-item text-danger" href="#"><i class="icon-base bx bx-trash me-1"></i> حذف</a>
                <a class="dropdown-item toggle-status-btn" href="#" 
                  data-id="${divo.personId }" 
                  data-status="${divo.isActive}">
                  <i class="icon-base bx bx-refresh me-1"></i> ${divo.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                </a>
              </div>
            </div
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


/*تفعل والغاء التفعيل */
document.getElementById("divorcedManTableBody").addEventListener("click", function (e) {
  if (e.target.closest(".toggle-status-btn")) {
    e.preventDefault();

    const btn = e.target.closest(".toggle-status-btn");
    const personId = btn.dataset.id;
    const currentStatus = btn.dataset.status === "true";
    const modifiedBy = "8FD8EBF5-4D67-455B-81AF-8E07628AEC1C"; // <-- يستبدل بالمعرّف الحقيقي للمستخدم المعدل

    const confirmMsg = currentStatus
      ? "هل أنت متأكد من إلغاء تفعيل هذا المستخدم؟"
      : "هل أنت متأكد من تفعيل هذا المستخدم؟";

    if (confirm(confirmMsg)) {
      fetch(`https://localhost:44377/api/Person/Active_Deactive_User?personId=${personId}&activate=${!currentStatus}&modifiedBy=${modifiedBy}`, {
        method: 'GET',
        headers: { 'Accept': '*/*' }
      })
        .then(res => res.json())
        .then(data => {
          if (data.isSuccess) {
            // تحديث النص والستايل في الخلية
            const statusCell = btn.closest("tr").querySelector(".status-text");
            statusCell.textContent = !currentStatus ? "نشط" : "غير نشط";
            statusCell.classList.toggle("bg-label-success", !currentStatus);
            statusCell.classList.toggle("bg-label-danger", currentStatus);

            // تحديث الزر
            btn.dataset.status = (!currentStatus).toString();
            btn.innerHTML = `<i class="icon-base bx bx-refresh me-1"></i> ${!currentStatus ? 'إلغاء تنشيط' : 'تنشيط'}`;

            showSuccessMessage("تم تحديث حالة المستخدم بنجاح.");
          } else {
            alert("فشل تغيير الحالة: " + data.message);
          }
        })
        .catch(err => {
          console.error(err);
          alert("حدث خطأ أثناء محاولة تغيير الحالة.");
        });
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


/*البحث */

document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase().trim();
  const rows = document.querySelectorAll("#divorcedManTableBody tr");

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? "" : "none";
  });
});