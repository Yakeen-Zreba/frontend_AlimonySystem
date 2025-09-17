
import {
  showError, showSpinner, hideSpinner,showSuccessMessage,hideErrorDialog,showErrorDialog,showSpinnerformLoading,hideSpinnerformLoading
} from "../utils/helpers.js";
import { GetAPI, postAPI ,postDataWithFile} from "../api/httpClient.js";

/* إعدادات API */
const API_BASE  = "http://localhost:5016";
const File_BASE = "http://localhost:1212/"; // جذر استضافة الملفات الثابتة (IIS static site)
const ENDPOINT_LIST   = `${API_BASE}/api/Nafaqa/Wife/requests`;

/* عناصر من الصفحة */
const grid    = document.getElementById("requestsGrid");
const tpl     = document.getElementById("requestCardTpl");
const modalEl = document.getElementById("modalShowChildren");
const tbodyEl = document.getElementById("chiledTableBody");
const courtDecisionSpan = document.getElementById("CourtDecision");
/* (اختياري) مودال عرض قرار المحكمة إن كان موجوداً في الصفحة */
const modalAlertMessage   = document.getElementById("modalAlertMessage");     // <div class="modal" id="modalCourtDoc">
const MessageSpan  = document.getElementById("MessageSpan");     // <span id="courtWifeName">


const courtWifeSpan  = document.getElementById("courtWifeName");     // <span id="courtWifeName">
const rejectNotesInput = document.getElementById("notes");
let currentRejectAlimonyId = null;  // نخزّن هنا الـ id للكرت المختار
let currentChildren = [];

/* أدوات مساعدة */
function timeAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "اليوم";
  if (days === 1) return "منذ يوم";
  return `منذ ${days} أيام`;
}
function genderLabel(v) {
  const n = typeof v === "string" ? parseInt(v, 10) : v;
  return n === 1 ? "أنثى" : "ذكر";
}
function parseDateOnly(iso) {
  if (!iso) return null;
  const s = String(iso).trim();
  const datePart = s.split("T")[0]; // "YYYY-MM-DD"
  const [y, m, d] = datePart.split("-").map(Number);
  if (y && m && d) return new Date(y, m - 1, d);
  const d2 = new Date(iso);
  return isNaN(d2) ? null : d2;
}
function daysInMonth(y, mIndex) {
  return new Date(y, mIndex + 1, 0).getDate();
}
function pluralYears(n){ if(n===0)return ""; if(n===1)return"سنة واحدة"; if(n===2)return"سنتان"; if(n<=10)return`${n} سنوات`; return`${n} سنة`; }
function pluralMonths(n){ if(n===0)return ""; if(n===1)return"شهر واحد"; if(n===2)return"شهران"; if(n<=10)return`${n} أشهر`; return`${n} شهراً`; }
function pluralDays(n){ if(n===0)return ""; if(n===1)return"يوم واحد"; if(n===2)return"يومان"; if(n<=10)return`${n} أيام`; return`${n} يوماً`; }
function fmtDMY(iso) {
  const d = parseDateOnly(iso);
  if (!d) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}
/** العمر النصّي: "سنة و3 أشهر ويومان" */
function ageExactLabel(isoDob) {
  const dob = parseDateOnly(isoDob);
  if (!dob) return "—";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (today < dob) return "—";

  let y = today.getFullYear() - dob.getFullYear();
  let m = today.getMonth() - dob.getMonth();
  let d = today.getDate() - dob.getDate();

  if (d < 0) {
    const prevMonthIndex = (today.getMonth() - 1 + 12) % 12;
    const prevMonthYear  = prevMonthIndex === 11 ? today.getFullYear() - 1 : today.getFullYear();
    d += daysInMonth(prevMonthYear, prevMonthIndex);
    m -= 1;
  }
  if (m < 0) { m += 12; y -= 1; }

  const parts = [pluralYears(y), pluralMonths(m), pluralDays(d)].filter(Boolean);
  return parts.length === 0 ? "أقل من يوم" : parts.join(" و");
}


/* مودال الأطفال */
function showChildrenModal(children) {
  currentChildren = Array.isArray(children) ? children : [];

  while (tbodyEl.firstChild) tbodyEl.removeChild(tbodyEl.firstChild);

  if (currentChildren.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="text-center text-muted">لا يوجد أطفال.</td>`;
    tbodyEl.appendChild(tr);
  } else {
    console.log('else')
    currentChildren.forEach((c, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.fullName ?? "—"}</td>
        <td>${fmtDMY(c.dateOfBirth)}</td>
        <td>${genderLabel(c.gender)}</td>
        <td>${ageExactLabel(c.dateOfBirth)}</td>
        <td>${c.isActive === false ? "غير مفعل" : "مفعل"}</td>
      
      `;
      tbodyEl.appendChild(tr);
    });
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}
/* مودال الأطفال */

const modalConfirmEl   = document.getElementById("modalConfirm");
const modalConfirm     = modalConfirmEl ? new bootstrap.Modal(modalConfirmEl) : null;

// دالة مساعدة لقراءة قيمة input/ select بسرعة
const getVal = (id) => document.getElementById(id)?.value?.trim() || "";


/* الكرت */
function renderCard(item) {
  const node = tpl.content.cloneNode(true);

  // رقم القضية
  node.querySelector("[data-field='caseNumber']").textContent = item.caseNumber ?? "—";

  // لافتة “غير مسجل”
  const IsReject = node.querySelector("[data-field='IsReject']");
  const showRed = item?.status == 2 
  if (showRed) IsReject.classList.remove("invisible"); else IsReject.classList.add("invisible");
  const notFound = node.querySelector("[data-field='notFoundBadge']");
  const showRed_ = item?.divorceCaseFlag == 2 
  if (showRed_) notFound.classList.remove("invisible"); else notFound.classList.add("invisible");
  
// اسم المطلّقة
const wifeName = item?.wifeName == "" ||  item?.wifeName == null ? " غير موجود في النظام":item?.wifeName ;
node.querySelector("[data-field='wifeName']").textContent = wifeName;
const StopReason = item?.stopReason ?? "لا يوجد";
node.querySelector("[data-field='StopReason']").textContent = StopReason;

node.querySelector("[data-field='State']").textContent =item?.status == 0? "قيد الانتظار" : item?.status == 1? "مقبول ":item?.status == 2? "مرفوض": "-";

// من قدّم الطلب
const requesterLabel = item?.requesterType  ? "الزوجة" : "موظف حكومي";
node.querySelector("[data-field='requesterLabel']").textContent = requesterLabel;

// اسم مقدّم الطلب
node.querySelector("[data-field='submittedByName']").textContent =
  item?.submittedByName ?? "—";


  // عدد الأطفال وتاريخ الإنشاء
  node.querySelector("[data-field='childrenCount']").textContent = item.children?.length ?? 0;
  node.querySelector("[data-field='createdAgo']").textContent    = timeAgo(item.createDate);

  // وصلة/مودال قرار المحكمة
  const docBtn = node.querySelector("[data-field='docLink']");
  const firstDoc = item?.documents?.[0];
  
  const docAnchor = node.querySelector("[data-field='docLink']");
  const doc = item.documents?.[0];
  if (doc?.filePath) {
    
    docAnchor.href =`${File_BASE}`+doc.filePath;
    docAnchor.textContent = "عرض مستند قرار الطلاق";
  } else {
    docAnchor.removeAttribute("href");
    docAnchor.textContent = "لا يوجد مستند";
  }


  // عرض الأطفال لهذه القضية
  node.querySelector("[data-action='showChildren']").addEventListener("click", () => {
    showChildrenModal(item.children);
  });

 




  grid.appendChild(node);
}



/* تحميل القائمة مع فلاتر */
let _lastQueryUsed = {};
export async function loadRequests(query = {}) {
  try {
    showSpinner();


    const p = new URLSearchParams();
    p.set("wifePersonId", localStorage.getItem("PersonId"));

    const caseNumber = query.caseNumber ?? query.CaseNumber ?? document.getElementById("filterCaseNumber")?.value;
    if (caseNumber && `${caseNumber}`.trim() !== "") p.set("CaseNumber", `${caseNumber}`.trim());

    let rt = query.requesterType ?? query.RequesterType ?? document.getElementById("filterRequesterType")?.value;
    if (rt !== undefined && rt !== null && !(typeof rt === "string" && rt.trim() === "")) {
      rt = /^true$/i.test(rt) ? 1 : /^false$/i.test(rt) ? 0 : rt;
      p.set("RequesterType", rt);
    }

    const url = `${ENDPOINT_LIST}?${p.toString()}`;
    _lastQueryUsed = { status, caseNumber, requesterType: rt };

    const resp = await GetAPI(url);
    grid.innerHTML = "";

    if (!resp?.isSuccess) {
      grid.innerHTML = `<div class="alert alert-danger"> ${resp?.message ?? ""}</div>`;
      return;
    }

    const list = Array.isArray(resp.results) ? resp.results : [];
    if (list.length === 0) {
    showError("لا توجد طلبات.")
      return;
    }

    list.forEach(renderCard);
  } catch (ex){
    console.log(ex)
    showError("تعذر الاتصال بالخادم");
  } finally {
    hideSpinner();
  }
}

/* تشغيل أولي */
document.addEventListener("DOMContentLoaded", async () => {
  await loadRequests();
});
