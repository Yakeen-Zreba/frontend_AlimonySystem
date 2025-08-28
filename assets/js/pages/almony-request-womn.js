import { postDataWithFile } from "../api/httpClient.js";
import { showError, hideSpinnerformLoading, hideError, showSpinnerformLoading } from "../utils/helpers.js";

const children = [];

// عناصر
const addBtn = document.getElementById('addChildBtn');
const nameInput = document.getElementById('childFullName');
const birthInput = document.getElementById('childBirthDate');
const tableBody = document.getElementById('childrenTableBody');
const errorBox = document.getElementById('childError');
const childrenJson = document.getElementById('childrenJson');
const saveBtn = document.getElementById('saveBtn');

function getSelectedGender() {
  const checked = document.querySelector('input[name="childGender"]:checked');
  return checked ? checked.value : '';
}
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function genderLabel(v) { return v === '0' ? 'ذكر' : v === '1' ? 'أنثى' : ''; }

// === يحدث الجدول وحقل JSON فقط، بلا أي listeners هنا
function renderChildren() {
  tableBody.innerHTML = '';
  children.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.fullName || '<span class="text-muted">—</span>'}</td>
      <td>${formatDate(c.birthDate)}</td>
      <td>${genderLabel(c.gender)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-outline-danger" data-index="${idx}">حذف</button>
      </td>`;
    tableBody.appendChild(tr);
  });

  // حدّث الpayload الذي سيُرسل
  const payloadChildren = children.map(c => ({
    fullName: c.fullName || "",
    dateOfBirth: c.birthDate,
    gender: Number(c.gender)
  }));
  childrenJson.value = JSON.stringify(payloadChildren);
}

// listeners ثابتة:
addBtn.addEventListener('click', () => {
  errorBox.classList.add('d-none'); errorBox.textContent = '';

  const fullName = (nameInput.value || '').trim();
  const birthDate = birthInput.value;
  const gender = getSelectedGender();

  if (!birthDate || !gender) {
    errorBox.textContent = 'من فضلك أدخل تاريخ الميلاد واختر الجنس.';
    errorBox.classList.remove('d-none');
    return;
  }
  children.push({ fullName, birthDate, gender });

  nameInput.value = '';
  birthInput.value = '';
  document.querySelectorAll('input[name="childGender"]').forEach(r => r.checked = false);
  renderChildren();
});

tableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-index]');
  if (!btn) return;
  const idx = parseInt(btn.getAttribute('data-index'), 10);
  if (idx >= 0) {
    children.splice(idx, 1);
    renderChildren();
  }
});

document.getElementById('resetFormBtn').addEventListener('click', () => {
  children.splice(0, children.length);
  renderChildren();
});

// مانع التكرار أثناء الحفظ
let isSaving = false;
saveBtn.addEventListener('click', onSaveClick);

async function onSaveClick(e) {
  e.preventDefault();
  if (isSaving) return;       // يمنع الضغطات المتتابعة
  isSaving = true;
  saveBtn.disabled = true;

  try {
    showSpinnerformLoading();
    hideError();

    const fd = new FormData();
    const fileInput = document.getElementById('divorceDecree');
    if (fileInput.files.length > 0) {
      fd.append('DivorceFile', fileInput.files[0]);
    }

    fd.append('CaseNumber', document.getElementById('divorceId').value || '');
    fd.append('SubmittedById', localStorage.getItem('PersonId') || '');
    fd.append('RequesterType', '1');

    // اسم الحقل لازم يطابق الDTO لديك:
    // لو DTO عندك [FromForm(Name="Children")] string Children → استخدم 'Children'
    // لو غيرتيه إلى childrenJson → استخدمي نفس الاسم.
    fd.append('Children', childrenJson.value);

    const response = await postDataWithFile('http://localhost:5016/api/Nafaqa/AddAlimony', fd);

    if (response.isSuccess) {
      showSuccessMessage(response.message || 'تم الحفظ');
      clearFormData();
    } else {
      showError(response.message || 'فشل العملية');
    }
  } catch (err) {
    console.error(err);
    showError(err.message || 'خطأ في الاتصال بالخادم');
  } finally {
    hideSpinnerformLoading();
    isSaving = false;
    saveBtn.disabled = false;
  }
}

function clearFormData() {
  children.splice(0, children.length);
  renderChildren();
  document.getElementById('divorceId').value = '';
  document.getElementById('divorceDecree').value = '';
  document.getElementById('childFullName').value = '';
  document.getElementById('childBirthDate').value = '';
  document.querySelectorAll('input[name="childGender"]').forEach(r => r.checked = false);
}

function showSuccessMessage(msg) {
  const box = document.getElementById("successMessageBox");
  box.textContent = msg;
  box.classList.remove("d-none");
  setTimeout(() => box.classList.add("d-none"), 3000);
}

// أول رندر
renderChildren();
