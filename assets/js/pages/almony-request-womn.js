import { postData, postDataWithFile } from "../api/httpClient.js";
import { showError, hideSpinnerformLoading, hideError,showSpinnerformLoading } from "../utils/helpers.js";

// مصفوفة لحفظ الأطفال مؤقتًا قبل الإرسال
const children = [];

// عناصر DOM
const addBtn = document.getElementById('addChildBtn');
const nameInput = document.getElementById('childFullName');
const birthInput = document.getElementById('childBirthDate');
const tableBody = document.getElementById('childrenTableBody');
const errorBox = document.getElementById('childError');
const childrenJson = document.getElementById('childrenJson');

// مساعد: قراءة الجنس المختار من الراديو
function getSelectedGender() {
  const checked = document.querySelector('input[name="childGender"]:checked');
  return checked ? checked.value : '';
}

// تنسيق بسيط للتاريخ (YYYY-MM-DD -> DD/MM/YYYY)
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ترجمة الجنس للعرض (القيم 0/1 حسب الـ radio)
function genderLabel(v) {
  return v === '0' ? 'ذكر' : v === '1' ? 'أنثى' : '';
}

// إعادة رسم جدول الأطفال
function renderChildren() {
  tableBody.innerHTML = '';
  children.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.fullName ? c.fullName : '<span class="text-muted">—</span>'}</td>
      <td>${formatDate(c.birthDate)}</td>
      <td>${genderLabel(c.gender)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-outline-danger" data-index="${idx}">حذف</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
document.getElementById('saveBtn')
  .addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      showSpinnerformLoading();
hideError() 
      // جهّزي FormData بأسماء مطابقة للباك إند
      const fd = new FormData();

      // الملف — لو ما حطيتي name في الـHTML، نضيفه هنا باسم الباك إند
      const fileInput = document.getElementById('divorceDecree');
      if (fileInput.files.length > 0) {
        fd.append('DivorceFile', fileInput.files[0]); // 👈 نفس اسم خاصية DTO
      }

      // القيم الأخرى (عدّلي حسب مشروعك)
      // الباك إند ينتظر CaseNumber، عندك الحقل اسمه divorceId → نرسله كـ CaseNumber
      fd.append('CaseNumber', document.getElementById('divorceId').value || '');

      // لو SubmittedById وRequesterType موجودين عندك من السياق/الستوريج ضيفيهم:
      const PersonId = localStorage.getItem('PersonId') || ''; // لازم يكون GUID
      fd.append('SubmittedById', PersonId);
      fd.append('RequesterType', '1'); // مثال: 1 = Wife .. عدّلي حسب اختيارك

      // الأطفال كـ JSON باسم يتطابق مع الـDTO
      // عندك dto يُتوقع [FromForm(Name="Children")] string Children
      // إذن نرسل "Children" مباشرة من childrenJson أو نبنيه هنا:
      fd.append('childrenJson', document.getElementById('childrenJson').value);

      // استدعاء API
      const response = await postDataWithFile('http://localhost:5016/api/Nafaqa/AddAlimony', fd);

      if (response.isSuccess ) {
       
        hideSpinnerformLoading();
        showSuccessMessage(response.message);
          clearFormData();

      } else {
                  hideSpinnerformLoading();
        showError(response.message || 'فشل العملية');
      }
    } catch (err) {
        console.log(err)
          hideSpinnerformLoading();
      showError('خطأ في الاتصال بالخادم');
    } finally {
      hideSpinnerformLoading();
    }
  });

  // 👈 حوّل المفاتيح إلى الشكل الذي يتوقعه الباك إند
  const payloadChildren = children.map(c => ({
    fullName: c.fullName || "",
    dateOfBirth: c.birthDate,        // الاسم الصحيح الذي يريده الباك إند
    gender: Number(c.gender)         // int وليس string
  }));
  childrenJson.value = JSON.stringify(payloadChildren);
}
function clearFormData() {
  // امسح قائمة الأطفال
  children.splice(0, children.length);
  renderChildren();

  // امسح الحقول النصية
  document.getElementById('divorceId').value = '';
  document.getElementById('divorceDecree').value = '';

  // امسح hidden childrenJson
  document.getElementById('childrenJson').value = '';

  // امسح مدخلات الطفل (لو كانت ظاهرة)
  document.getElementById('childFullName').value = '';
  document.getElementById('childBirthDate').value = '';
  document.querySelectorAll('input[name="childGender"]').forEach(r => r.checked = false);
}

// معالجة الضغط على زر الإضافة
addBtn.addEventListener('click', () => {
  // اخفاء أي خطأ سابق
  errorBox.classList.add('d-none');
  errorBox.textContent = '';

  const fullName = (nameInput.value || '').trim();
  const birthDate = birthInput.value;
  const gender = getSelectedGender();

  if (!birthDate || !gender) {
    errorBox.textContent = 'من فضلك أدخل تاريخ الميلاد واختر الجنس.';
    errorBox.classList.remove('d-none');
    return;
  }

  // أضف للّستة
  children.push({ fullName, birthDate, gender });

  // نظّف المدخلات
  nameInput.value = '';
  birthInput.value = '';
  // فك اختيار الراديو
  document.querySelectorAll('input[name="childGender"]').forEach(r => r.checked = false);

  // أعد رسم الجدول
  renderChildren();
});

// حذف صف من الجدول
tableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-index]');
  if (!btn) return;
  const idx = parseInt(btn.getAttribute('data-index'), 10);
  if (idx >= 0) {
    children.splice(idx, 1);
    renderChildren();
  }
});

//تفريغ الجدول
document.getElementById('resetFormBtn').addEventListener('click', () => {
    children.splice(0, children.length);
    renderChildren();
  });


// تحديدي العناصر الظاهرة حسب ال role
document.addEventListener("DOMContentLoaded", () => {
    const userRole = localStorage.getItem("userRole");

    if (!userRole) return; // إذا ما في تسجيل دخول

    // إظهار/إخفاء العناصر حسب الدور
    if (userRole === "admin" || userRole === "gov") {
        document.getElementById("adminGovUserManagement").style.display = "block";
        document.getElementById("adminGovDivorceManagement").style.display = "block";
    }

    if (userRole === "admin" || userRole === "woman" ) {
        document.getElementById("adminWomanAlmonyRequesr").style.display = "block";
    }

    if (userRole === "admin" || userRole === "man" ) {
        document.getElementById("adminManAlmonyPayment").style.display = "block";
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