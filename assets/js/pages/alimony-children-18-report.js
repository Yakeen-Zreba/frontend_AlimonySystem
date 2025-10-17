import { GetAPI } from "../api/httpClient.js";

const spinnerEl = document.getElementById("loadingSpinner");
const errBox    = document.getElementById("error-message");
const okBox     = document.getElementById("successMessageBox");
const accordion = document.getElementById("accordionExample");

const API_BASE = "http://localhost:5016";
const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB") : "-";
const money    = (n)=> (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

function showSpinner(){ spinnerEl?.classList.remove("d-none"); }
function hideSpinner(){ spinnerEl?.classList.add("d-none"); }
function showError(msg){ if(!errBox) return; errBox.textContent = msg || "حدث خطأ."; errBox.classList.remove("d-none"); }
function hideError(){ errBox?.classList.add("d-none"); errBox.textContent=""; }
function showOK(msg){ if(!okBox) return; okBox.textContent = msg || "تم بنجاح."; okBox.classList.remove("d-none"); setTimeout(()=>okBox.classList.add("d-none"), 3500); }

/* =========================
   مراجع المودال وحقوله
   ========================= */
const modalEl       = document.getElementById("modalStopChild");
const formEl        = document.getElementById("stopChildForm");
const scErr         = document.getElementById("stopChildErr");
const scOk          = document.getElementById("stopChildOk");

const fldOldId      = document.getElementById("sc_oldAlimonyId");
const fldChildId    = document.getElementById("sc_childId");
const fldChildName  = document.getElementById("sc_childName");
const fldCourtNo    = document.getElementById("sc_courtDecisionNo");
const fldCurrAmt    = document.getElementById("sc_currentAmount");
const fldEffFrom    = document.getElementById("sc_effectiveFrom");
const fldNewAmt     = document.getElementById("sc_newMonthly");

let bsModal = null;
function clearModalAlerts(){
  scErr.classList.add("d-none"); scErr.textContent="";
  scOk.classList.add("d-none");  scOk.textContent="";
}
function openStopChildModal(payload){
  clearModalAlerts();
  const { alimonyId, childId, childName, courtNo, currentAmount } = payload || {};

  fldOldId.value     = alimonyId ?? "";
  fldChildId.value   = childId ?? "";
  fldChildName.value = childName ?? "";
  fldCourtNo.value   = courtNo ?? "";
  fldCurrAmt.value   = currentAmount ?? "";

  // افتراضي: بداية الشهر القادم
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth()+1, 1);
  fldEffFrom.value = next.toISOString().slice(0,10);
  fldNewAmt.value  = "";

  bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
  bsModal.show();
}

/* =========================
   بناء بطاقة نفقة واحدة
   ========================= */
function buildAlimonyCard(item, idx){
  const cardId = `alimony${item.alimonyId}_${idx}`;
  const headId = `heading_${cardId}`;

  const title = `
    قرار نفقة: <strong>${item.courtDecisionNo || "-"}</strong>
    &nbsp;|&nbsp; الزوج: <strong>${item.husbandName || "-"}</strong>
    &nbsp;|&nbsp; الزوجة: <strong>${item.wifeName || "-"}</strong>
  `;

  const childRows = (item.children || []).map(ch => {
    const gText = ch.gender == 0 ? "ذكر" : "أنثى";
    const badge18 = (ch.is18OrMore && ch.gender == 0)
      ? `<span class="badge bg-danger">≥ 18</span>`
      : `<span class="badge bg-label-secondary">—</span>`;

    const isActiveText = ch.isActive ? "مفعّل" : "موقوف";

    // زر الإيقاف يظهر فقط لو ذكر ≥ 18 ومفعّل
    const showStop = (ch.gender == 0 && ch.is18OrMore == 1 && ch.isActive == 1);
    const stopBtn = showStop
      ? `<button 
           class="btn btn-sm btn-outline-danger"
           data-action="stop-child-open"
           data-alimony-id="${item.alimonyId}"
           data-child-id="${ch.childId}"
           data-name="${ch.childName}"
           data-court="${item.courtDecisionNo || ''}"
           data-current-amount="${item.monthlyAmount ?? 0}">
           إيقاف الابن
         </button>`
      : "";

    return `
      <tr>
        <td>${ch.childName}</td>
        <td>${gText}</td>
        <td>${fmtDate(ch.dateOfBirth)}</td>
        <td>${ch.ageCurrent}</td>
        <td>${isActiveText}</td>
        <td class="text-center">${badge18}</td>
        <td class="text-center">${stopBtn}</td>
      </tr>
    `;
  }).join("");

  return `
  <div class="accordion-item">
    <h2 class="accordion-header d-flex justify-content-between align-items-center" id="${headId}">
      <button class="accordion-button collapsed" type="button"
              data-bs-toggle="collapse" data-bs-target="#${cardId}"
              aria-expanded="false" aria-controls="${cardId}">
        <span class="ms-2" style="text-align:right">${title}</span>
      </button>
    </h2>
    <div id="${cardId}" class="accordion-collapse collapse" aria-labelledby="${headId}" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        <div class="row mb-3">
          <div class="col-md-4"><strong>المبلغ الشهري:</strong> ${money(item.monthlyAmount)} د.ل</div>
          <div class="col-md-4"><strong>عدد الأبناء الذكور ≥ 18:</strong> ${item.count18Males ?? 0}</div>
        </div>

        <div class="table-responsive">
          <table class="table table-sm table-bordered align-middle">
            <thead class="table-light">
              <tr>
                <th>اسم الابن</th>
                <th>النوع</th>
                <th>تاريخ الميلاد</th>
                <th>العمر الحالي</th>
                <th>حالته</th>
                <th class="text-center">شرط ≥ 18 (للذكور)</th>
                <th class="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${childRows || `<tr><td colspan="7" class="text-center text-muted">لا يوجد أبناء.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`;
}

/* =========================
   تحميل التقرير
   ========================= */
async function loadReport(){
  hideError();
  accordion.innerHTML = "";
  showSpinner();
  try{
    const res = await fetch(`${API_BASE}/api/Nafaqa/Employee/alimonies-with-18plus`);
    const json = await res.json();

    if(!json?.isSuccess){
      showError(json?.message || "فشل جلب البيانات.");
      return;
    }
    const list = Array.isArray(json.results) ? json.results : [];
    if(list.length === 0){
      accordion.innerHTML = `<div class="alert alert-info">لا توجد نفقات تحتوي على ابن ذكر تجاوز 18 سنة.</div>`;
      return;
    }

    list.forEach((it, i) => {
      accordion.insertAdjacentHTML("beforeend", buildAlimonyCard(it, i));
    });

  }catch(err){
    console.error(err);
    showError("تعذر الاتصال بالخادم");
  }finally{
    hideSpinner();
  }
}

/* =========================
   تفويض الأحداث داخل الأكورديون
   ========================= */
accordion.addEventListener("click", (e) => {
  e.preventDefault(); // فتح مودال الإيقاف
  const btnOpen = e.target.closest("[data-action='stop-child-open']");
console.log('88888888');
  if (btnOpen) {
   console.log('btnOpen');
    const payload = {
      alimonyId     : parseInt(btnOpen.getAttribute("data-alimony-id") || "0"),
      childId       : parseInt(btnOpen.getAttribute("data-child-id")   || "0"),
      childName     : btnOpen.getAttribute("data-name")                || "",
      courtNo       : btnOpen.getAttribute("data-court")               || "",
      currentAmount : btnOpen.getAttribute("data-current-amount")      || ""
    };
       console.log('openStopChildModal');

    openStopChildModal(payload);
    return;
  }
});

/* =========================
   إرسال نموذج المودال
   ========================= */
formEl?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearModalAlerts();

  const body = {
    oldAlimonyId    : parseInt(fldOldId.value || "0"),
    stoppedChildId  : parseInt(fldChildId.value || "0"),
    startFrom   : fldEffFrom.value,              
    newMonthlyAmount: parseFloat(fldNewAmt.value || "0")
  };

  if (!body.oldAlimonyId || !body.stoppedChildId) {
    scErr.textContent = "بيانات غير كاملة.";
    scErr.classList.remove("d-none");
    return;
  }
  if (!body.startFrom) {
    scErr.textContent = "يرجى تحديد تاريخ السريان.";
    scErr.classList.remove("d-none");
    return;
  }
  if (!(body.newMonthlyAmount > 0)) {
    scErr.textContent = "القيمة الشهرية الجديدة يجب أن تكون أكبر من صفر.";
    scErr.classList.remove("d-none");
    return;
  }

  try{
    const token = localStorage.getItem("jwtToken");
    const headers = { "Content-Type":"application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE}/api/Nafaqa/stop-child-and-split`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    const json = await resp.json();

    if (json?.isSuccess) {
      scOk.textContent = json?.message || "تم التنفيذ بنجاح.";
      scOk.classList.remove("d-none");
      setTimeout(() => {
        bootstrap.Modal.getOrCreateInstance(modalEl)?.hide();
        loadReport();
      }, 800);
    } else {
      scErr.textContent = json?.message || "فشلت العملية.";
      if (json?.messages) scErr.textContent += `\n${json.messages}`;
      scErr.classList.remove("d-none");
    }
  }catch(ex){
    console.error(ex);
    scErr.textContent = "تعذر الاتصال بالخادم.";
    scErr.classList.remove("d-none");
  }
});

/* بدء التحميل */
document.addEventListener("DOMContentLoaded", loadReport);
