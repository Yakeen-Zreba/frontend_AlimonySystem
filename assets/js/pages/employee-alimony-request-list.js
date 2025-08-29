
import {
  showError, showSpinner, hideSpinner
} from "../utils/helpers.js";
import { GetAPI, postAPI ,postDataWithFile} from "../api/httpClient.js";

/* إعدادات API */
const API_BASE  = "http://localhost:5016/api/Nafaqa";
const File_BASE = "http://localhost:1212/"; // جذر استضافة الملفات الثابتة (IIS static site)
const ENDPOINT_LIST   = `${API_BASE}/Admin/requests`;
const ENDPOINT_ACCEPT =  `${API_BASE}/Admin/requests/accept`;
const ENDPOINT_REJECT = `${API_BASE}/Admin/decide-alimony`;

/* عناصر من الصفحة */
const grid    = document.getElementById("requestsGrid");
const tpl     = document.getElementById("requestCardTpl");
const modalEl = document.getElementById("modalShowChildren");
const tbodyEl = document.getElementById("chiledTableBody");
const courtDecisionSpan = document.getElementById("CourtDecision");
/* (اختياري) مودال عرض قرار المحكمة إن كان موجوداً في الصفحة */
const modalCourtEl   = document.getElementById("modalCourtDoc");     // <div class="modal" id="modalCourtDoc">
const courtWifeSpan  = document.getElementById("courtWifeName");     // <span id="courtWifeName">
const modalRejectEl   = document.getElementById("modalReject");
const rejectNotesInput = document.getElementById("notes");
const rejectSaveBtn   = document.getElementById("rejectSaveBtn");

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
    currentChildren.forEach((c, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.fullName ?? "—"}</td>
        <td>${fmtDMY(c.dateOfBirth)}</td>
        <td>${genderLabel(c.gender)}</td>
        <td>${ageExactLabel(c.dateOfBirth)}</td>
        <td>${c.isActive === false ? "غير مفعل" : "مفعل"}</td>
        <td>
          <a class="dropdown-item btn-edit" href="#" data-index="${idx}">
            <i class="icon-base bx bx-edit-alt me-1"></i>
          </a>
        </td>
        <td>
          <a class="dropdown-item btn-delete text-danger" href="#" data-index="${idx}">
            <i class="icon-base bx bx-trash me-1"></i>
          </a>
        </td>
      `;
      tbodyEl.appendChild(tr);
    });
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}
/* مودال الأطفال */
function showCourtDocModal(item) {
console.log( item.CourtDecision)
  const text = item.courtDecision ||  "لا يوجد نص قرار لانه لم يتم ادخال الواقعة الطلاق في النظام.";
courtDecisionSpan.textContent = text;

    const modal = new bootstrap.Modal(modalCourtEl);
  modal.show();


}

/* الكرت */
function renderCard(item) {
  const node = tpl.content.cloneNode(true);

  // رقم القضية
  node.querySelector("[data-field='caseNumber']").textContent = item.caseNumber ?? "—";

  // لافتة “غير مسجل”
  const notFound = node.querySelector("[data-field='notFoundBadge']");
  const showRed = item?.divorceCaseFlag == 2 || !item?.caseNumber || String(item.caseNumber).trim() === "";
  if (showRed) notFound.classList.remove("invisible"); else notFound.classList.add("invisible");
// اسم المطلّقة
const wifeName = item?.wifeName ?? "—";
node.querySelector("[data-field='wifeName']").textContent = wifeName;

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

  node.querySelector("[data-action='ShowCourtDoc']").addEventListener("click", () => {

     showCourtDocModal(item);
  
  });
  // قبول → (اظهار مودال التأكيد لديك إن رغبت) أو نداء API مباشرة
  node.querySelector("[data-action='accept']").addEventListener("click", async () => {
    // إن أردت فقط فتح مودال التأكيد الموجود عندك:
    const modalConfirm = document.getElementById("modalConfirm");
    if (modalConfirm) {
      const m = new bootstrap.Modal(modalConfirm);
      m.show();
      return;
    }

    // أو نفّذ القبول مباشرة:
    try {
      showSpinner();
      const r = await postAPI(ENDPOINT_ACCEPT(item.alimonyId), {});
      if (r?.isSuccess) await loadRequests(_lastQueryUsed);
      else showError(r?.message || "فشل القبول");
    } catch {
      showError("تعذر الاتصال بالخادم");
    } finally {
      hideSpinner();
    }
  });
// داخل renderCard(item)
node.querySelector("[data-action='rejectSave']").addEventListener("click", () => {
  currentRejectAlimonyId = item.alimonyId;      // خزّن رقم الطلب
  rejectNotesInput.value = "";                  // صفّر الحقل
  const m = new bootstrap.Modal(modalRejectEl); // افتح المودال
  m.show();
});



  grid.appendChild(node);
}
rejectSaveBtn.addEventListener("click", async () => {
  if (!currentRejectAlimonyId) return;

  const notes = (rejectNotesInput.value || "").trim();
  if (!notes) {
    rejectNotesInput.focus();
    return;
  }

  try {
    showSpinner();
    // الجسم حسب المطلوب: سبب الرفض مع id في الـURL
    const fd = new FormData();
    fd.append('AlimonyId',currentRejectAlimonyId);
    fd.append('Decision',2);
    fd.append('StopReason',notes);
    const res = await postDataWithFile(ENDPOINT_REJECT, fd );

    if (res?.isSuccess) {
      // اغلق المودال ونظف
     
      rejectNotesInput.value = "";
      currentRejectAlimonyId = null;

      // أعد تحميل القائمة بنفس الفلاتر
      await loadRequests(_lastQueryUsed);
    } else {
      showError(res?.message || "فشل الرفض");
    }
  } catch (e) {
    showError("تعذر الاتصال بالخادم" );
  } finally {
       const inst = bootstrap.Modal.getInstance(modalRejectEl) || new bootstrap.Modal(modalRejectEl);
      inst.hide();
    hideSpinner();
  }
});

/* تحميل القائمة مع فلاتر */
let _lastQueryUsed = {};
export async function loadRequests(query = {}) {
  try {
    showSpinner();

    let status = query.status ?? query.Status;
    if (status === undefined || status === null || (typeof status === "string" && status.trim() === "")) {
      const sel = document.getElementById("filterStatus");
      status = sel?.value ?? 0;
    }

    const p = new URLSearchParams();
    p.set("Status", status);

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
      grid.innerHTML = `<div class="alert alert-danger">فشل الجلب: ${resp?.message ?? ""}</div>`;
      return;
    }

    const list = Array.isArray(resp.results) ? resp.results : [];
    if (list.length === 0) {
      grid.innerHTML = `<div class="alert alert-info">لا توجد طلبات.</div>`;
      return;
    }

    list.forEach(renderCard);
  } catch {
    showError("تعذر الاتصال بالخادم");
  } finally {
    hideSpinner();
  }
}

/* تشغيل أولي */
document.addEventListener("DOMContentLoaded", async () => {
  await loadRequests();
});
