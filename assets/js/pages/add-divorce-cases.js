// divorce-create.js
import { showError, hideError, hideSpinnerformLoading, showSpinnerformLoading } from "../utils/helpers.js";
import {  GetAPI } from "../api/httpClient.js";

// === الإعدادات العامة ===
const API_BASE = "http://localhost:5016";
const FORM_ID = "AddDivorceCases";
const HUSBAND_SELECT_ID = "divorcedMan";
const WIFE_SELECT_ID = "divorcedWoman";

// حدّدي قِيَم الأدوار الصحيحة من نظامك:
const ROLE_DIVORCED_MAN = 3;     // 👈 غيّري للقيمة الفعلية لدور الزوج
const ROLE_DIVORCED_WOMAN = 4;   // 👈 غيّري للقيمة الفعلية لدور الزوجة

document.addEventListener("DOMContentLoaded", async () => {

  await populatePersons(HUSBAND_SELECT_ID, ROLE_DIVORCED_MAN);
  await populatePersons(WIFE_SELECT_ID, ROLE_DIVORCED_WOMAN);

  const form = document.getElementById(FORM_ID);
  form?.addEventListener("submit", onSubmit);
});

// جلب الأشخاص حسب الدور وملء القائمة
async function populatePersons(selectId, role) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = `<option selected disabled>جاري التحميل...</option>`;

   try {
          const response = await GetAPI(`${API_BASE}/api/Person/GetPersonByRole?Role=${encodeURIComponent(role)}`);
           if (response.isSuccess && Array.isArray(response.results)) {
                const items = response.results
    sel.innerHTML = `<option selected disabled value='' >اختر</option>`;
 sel.classList.add('direction-rtl'); 
    for (const p of items) {
        console.log(p)
      const opt = document.createElement("option");
      opt.value = p.personId;        
      opt.textContent = p.name;      
      opt.classList.add('direction-rtl'); 
      sel.appendChild(opt);
        }
    }
    else{
          sel.innerHTML = `<option selected disabled value=''  >${ response.Message || 'تعذر التحميل'}</option>`;
  
    }

 
  } catch (err) {
    console.error(err);
    sel.innerHTML = `<option selected disabled value=''  >تعذر التحميل</option>`;
  }
}
// === دالة تنظيف الحقول بعد النجاح ===
function clearFormFields() {
  const form = document.getElementById(FORM_ID);
  if (!form) return;

  form.reset();

  resetSelect(document.getElementById(HUSBAND_SELECT_ID));
  resetSelect(document.getElementById(WIFE_SELECT_ID));

  // 3) تصفير ملفات الرفع (بعض المتصفحات تحتاج هذا صراحة)
  const filesIds = ["marriageFile", "divorceDecreeFile"];
  filesIds.forEach(id => {
    const f = document.getElementById(id);
    if (f) f.value = "";
  });
}

function resetSelect(selectEl) {
  if (!selectEl) return;

  // أزل حالة الخطأ إن وُجدت
  selectEl.classList.remove("is-invalid");
  selectEl.setAttribute("aria-invalid", "false");

  // نبحث عن خيار placeholder بقيمة فارغة
  const placeholder = selectEl.querySelector('option[value=""]');
  if (placeholder) {
    placeholder.selected = true;                  // اجعل placeholder هو المختار
    selectEl.value = "";                          // يضمن التعيين
  } else {
    // fallback: أول عنصر
    selectEl.selectedIndex = 0;
  }

  // لو في أي listeners يعتمدون على change
  selectEl.dispatchEvent(new Event("change"));
}
function getVal(id) {
  const el = document.getElementById(id);
  return (el?.value ?? "").trim();
}
function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function ensureSelected(selectId, label) {
  const el = document.getElementById(selectId);
  const val = (el?.value ?? "").trim();
  const invalid = !val;                 // فاضي = لم يُختر
  markInvalid(selectId, invalid);
  return invalid ? label : null;
}

function markInvalid(selectId, isInvalid) {
  const el = document.getElementById(selectId);
  if (!el) return;
  el.classList.toggle("is-invalid", !!isInvalid); // Bootstrap
  el.setAttribute("aria-invalid", isInvalid ? "true" : "false");
}
async function onSubmit(e) {
  e.preventDefault();
  hideError();

  // === قراءة الحقول من الفورم ===
  // عقد الزواج
  const contractNumber   = getVal("contractId");       // input رقم العقد (اسم الحقل عندك)
  const contractDate     = getVal("contractDate");     // yyyy-MM-dd (input type=date)
  const husbandPersonId  = getVal(HUSBAND_SELECT_ID);  // GUID
  const wifePersonId     = getVal(WIFE_SELECT_ID);     // GUID
  const civilRegistry    = getVal("nationalId");       // السجل المدني
  const mahrTotal        = getVal("mahr");             // المهر الكامل
  const paidMahr         = getVal("paidMahr");         // المهر المدفوع
  const deferred         = getVal("deferredMahr");     // المهر المؤجل
    const deferredPaid         = getVal("PaidDeferred");     // المهر المؤجل
  const marriageFile     = document.getElementById("marriageFile")?.files?.[0] || null;

  // واقعة الطلاق
  const caseNumber       = getVal("divorceId");        // رقم القضية
  const courtName        = getVal("courtName");
  const courtDecision    = getVal("courtDecision");
  const divorceDate      = getVal("divorceDate");      // 👈 تأكدي من تعديل id بالـ HTML
  const divorceFile      = document.getElementById("divorceDecreeFile")?.files?.[0] || null;

  // === تحقق بسيط (اختياري) ===
  const missing = [];

  if (!contractNumber) missing.push("رقم عقد الزواج");
  if (!contractDate) missing.push("تاريخ عقد الزواج");
  if (!husbandPersonId) missing.push("اسم الزوج");
  if (!wifePersonId) missing.push("اسم الزوجة");
  if (!caseNumber) missing.push("رقم القضية");
  if (!courtName) missing.push("المحكمة");
  if (!courtDecision) missing.push("قرار المحكمة");
  if (!divorceDate) missing.push("تاريخ الطلاق");

  if (missing.length) {
    showError("الحقول التالية مطلوبة: " + missing.join("، "));
    return;
  }

  // === بناء FormData بنفس أسماء خصائص DTO ===
  const fd = new FormData();
  // MarriageContractCreateDto
  fd.append("Marriage.ContractNumber", contractNumber);
  fd.append("Marriage.ContractDate", contractDate); // DateOnly: yyyy-MM-dd
  fd.append("Marriage.CivilRegistry", civilRegistry);
  fd.append("Marriage.HusbandPersonId", husbandPersonId);
  fd.append("Marriage.WifePersonId", wifePersonId);
  fd.append("Marriage.MahrTotal", toNumber(mahrTotal, 0));
  if (paidMahr) fd.append("Marriage.MahrPaid", toNumber(paidMahr, 0));
  fd.append("Marriage.Deferred", toNumber(deferred, 0));
   if (deferredPaid) fd.append("Marriage.DeferredPaid", toNumber(deferredPaid, 0));

  // DivorceCaseCreateDto
  fd.append("Divorce.CaseNumber", caseNumber);
  fd.append("Divorce.CourtName", courtName);
  fd.append("Divorce.CourtDecision", courtDecision);
  fd.append("Divorce.DivorceDate", divorceDate); // DateOnly: yyyy-MM-dd

  // الملفات
  if (marriageFile) fd.append("marriageFile", marriageFile);
  if (divorceFile)  fd.append("divorceFile", divorceFile);

  // === الإرسال ===
  try {
    showSpinnerformLoading();
    const token = localStorage.getItem("jwtToken");
    const res = await fetch(`${API_BASE}/api/MarriageDivorce/add-contract-and-divorce`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd 
    });
if (res.status === 413) {
  showError("حجم الملف/الطلب أكبر من الحد المسموح به على الخادم. تم رفع الحدود، أعد المحاولة.");
  hideSpinnerformLoading();
  return;
}
    const json = await res.json();
    if (json?.isSuccess) {
        clearFormFields();
   showSuccessMessage(" تم إضافة واقعة الطلاق بنجاح.");

    } else {
      showError(json?.message || "فشل في الحفظ");
    }
  } catch (err) {
    console.error(err);
    showError("خطأ في الاتصال بالخادم");
  } finally {
    hideSpinnerformLoading();
  }
}
function showSuccessMessage(msg) {
  const box = document.getElementById("successMessageBox");
  box.textContent = msg;
  box.classList.remove("d-none");
  setTimeout(() => {
    box.classList.add("d-none");
  }, 3000);
}
