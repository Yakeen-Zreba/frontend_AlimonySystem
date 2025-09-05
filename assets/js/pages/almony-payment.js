// divorce-create.js
import { showError, hideError, hideSpinnerformLoading, showSpinnerformLoading } from "../utils/helpers.js";
import {  GetAPI, postDataWithFile } from "../api/httpClient.js";

// === الإعدادات العامة ===
const API_BASE = "http://localhost:5016";
const FORM_ID = "alimonyPaymentForm";
const CourtDecisionNo_SELECT_ID = "CourtDecisionNo";
const receiptFile = "receipt";
const PersonId = localStorage.getItem('PersonId') 
document.addEventListener("DOMContentLoaded", async () => {

  await populateAlimonyDecision('decision');

  const form = document.getElementById(FORM_ID);
  form?.addEventListener("submit", onSubmit);
});

// جلب الأشخاص حسب الدور وملء القائمة
async function populateAlimonyDecision() {
  const sel = document.getElementById('decision');
  if (!sel) return;
  
  sel.innerHTML = `<option selected disabled>جاري التحميل...</option>`;
console.log('decision')
   try {
          const response = await GetAPI(`${API_BASE}/api/Nafaqa/Husband/many_requests?HusbandPersonId=${encodeURIComponent(PersonId)}`);
           if (response.isSuccess && Array.isArray(response.results)) {
            if(response.results.length==0){

          sel.innerHTML = `<option selected disabled value=''  >لا يوجد نفقة لدفعها</option>`;

                return
            }
                const items = response.results
    sel.innerHTML = `<option selected disabled value='' >اختر</option>`;
 sel.classList.add('direction-rtl'); 
    for (const p of items) {
        console.log(p)
      const opt = document.createElement("option");
      opt.value = p.id;        
      opt.textContent = p.text;      
      opt.classList.add('direction-rtl'); 
      sel.appendChild(opt);
        }
    }
    else{
          sel.innerHTML = `<option selected disabled value=''  >${ response.message || 'تعذر التحميل'}</option>`;
  
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
document.getElementById(receiptFile);
  resetSelect(document.getElementById('decision'));

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


async function onSubmit(e) {
  e.preventDefault();
  hideError();

  // === قراءة الحقول من الفورم ===
  // عقد الزواج
  const alimonyId   = getVal("decision");       // input رقم العقد (اسم الحقل عندك)
  const amountPaid    = getVal("payAmount");       // السجل المدني
  const method        = getVal("payMethod");             // المهر الكامل
  const notes         = getVal("notes");         // المهر المدفوع
  const payDateFrom         = getVal("payDateFrom");         // المهر المدفوع
  const payDateTo         = getVal("payDateTo");         // المهر المدفوع
console.log(getVal("decision"))
  const File_     = document.getElementById(receiptFile)?.files?.[0] || null;

  // === تحقق بسيط (اختياري) ===
  const missing = [];

  if (!alimonyId) missing.push("رقم قرار النفقة");
  if (!payDateFrom) missing.push("تاريخ الدفع من");
  if (!payDateTo) missing.push("تاريخ الدفع إلى");
  if (!amountPaid) missing.push("المبلغ ");
  if (!method) missing.push("اختيار طريقة الدفع ");
  if (!File_) missing.push("ايصال الدفع");

  if (missing.length) {
    showError("الحقول التالية مطلوبة: " + missing.join("، "));
    return;
  }

  // === بناء FormData بنفس أسماء خصائص DTO ===
  const fd = new FormData();
  // MarriageContractCreateDto
  fd.append("AlimonyId", alimonyId);
  fd.append("PayerPersonId", PersonId); // DateOnly: yyyy-MM-dd
  fd.append("AmountPaid", amountPaid);
  fd.append("PeriodFrom", payDateFrom);
  fd.append("PeriodTo", payDateTo);
  fd.append("Method", method);
  fd.append("Notes", notes);
 fd.append("attachmentFile",File_ );

  // === الإرسال ===
  try {
    showSpinnerformLoading();
    const res = await postDataWithFile(`${API_BASE}/api/Payments/Husband/create-payment`,fd);
if (res.status === 413) {
  showError("حجم الملف/الطلب أكبر من الحد المسموح به على الخادم. تم رفع الحدود، أعد المحاولة.");
  hideSpinnerformLoading();
  return;
}
    if (res?.isSuccess) {
        clearFormFields();
   showSuccessMessage(res?.message );

    } else {
      showError(res?.message || "فشل في الحفظ");
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
