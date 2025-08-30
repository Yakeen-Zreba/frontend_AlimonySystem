
import {
  showError, showSpinner, hideSpinner,showSuccessMessage,hideErrorDialog,showErrorDialog,showSpinnerformLoading,hideSpinnerformLoading
} from "../utils/helpers.js";
import { GetAPI, postAPI ,postDataWithFile} from "../api/httpClient.js";

/* إعدادات API */
const API_BASE  = "http://localhost:5016";
const File_BASE = "http://localhost:1212/"; // جذر استضافة الملفات الثابتة (IIS static site)
const ENDPOINT_LIST   = `${API_BASE}/api/Nafaqa/Admin/requests`;
const ENDPOINT_ACCEPT =  `${API_BASE}/api/Nafaqa/Admin/decide-alimony`;
const ENDPOINT_REJECT = `${API_BASE}/api/Nafaqa/Admin/decide-alimony`;
const FOLLOWUPAGENT_SELECT_ID = "followUpAgent";
const ddWrap   = document.getElementById("agentDropdown");
const ddBtn    = document.getElementById("agentDropdownBtn");
const ddLabel  = document.getElementById("agentDropdownLabel");
const ddMenu   = ddWrap?.querySelector(".dropdown-menu");
const listEl   = document.getElementById("agentList");
const filterEl = document.getElementById("agentFilterInput");

// خزن الاختيار هنا (id + name)
let selectedAgent = { id: null, name: "" };
// حدّدي قِيَم الأدوار الصحيحة من نظامك:
const ROLE_FOLLOWUPAGENT = 2;     // 👈 غيّري للقيمة الفعلية لدور الزوج
/* عناصر من الصفحة */
const grid    = document.getElementById("requestsGrid");
const tpl     = document.getElementById("requestCardTpl");
const modalEl = document.getElementById("modalShowChildren");
const tbodyEl = document.getElementById("chiledTableBody");
const courtDecisionSpan = document.getElementById("CourtDecision");
/* (اختياري) مودال عرض قرار المحكمة إن كان موجوداً في الصفحة */
const modalCourtEl   = document.getElementById("modalCourtDoc");     // <div class="modal" id="modalCourtDoc">
const modalAlertMessage   = document.getElementById("modalAlertMessage");     // <div class="modal" id="modalCourtDoc">
const MessageSpan  = document.getElementById("MessageSpan");     // <span id="courtWifeName">


const courtWifeSpan  = document.getElementById("courtWifeName");     // <span id="courtWifeName">
const modalRejectEl   = document.getElementById("modalReject");
const rejectNotesInput = document.getElementById("notes");
const rejectSaveBtn   = document.getElementById("rejectSaveBtn");
const acceptAlimony = document.getElementById("accept-Alimony");
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
    console.log('show')

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
const modalConfirmEl   = document.getElementById("modalConfirm");
const modalConfirm     = modalConfirmEl ? new bootstrap.Modal(modalConfirmEl) : null;

// دالة مساعدة لقراءة قيمة input/ select بسرعة
const getVal = (id) => document.getElementById(id)?.value?.trim() || "";

// نخزن رقم طلب النفقة الحالي داخل المودال عند الفتح
function openAcceptModal(item) {
  if (!modalConfirmEl || !modalConfirm) return;

  // خزّني AlimonyId على المودال عشان نرجع له عند الحفظ
  modalConfirmEl.dataset.alimonyId = item.alimonyId;

  // عبّي الحقول للعرض/التحرير
  document.getElementById("CaseNumber").value   = item.caseNumber ?? "";
  document.getElementById("husbandName").value  = item.husbandName ?? "";
  document.getElementById("wifeName").value     = item.wifeName ?? "";

  // تهيئة حقول قابلة للتحرير (فارغة بشكل افتراضي)
  document.getElementById("CourtDecisionNo").value = item.courtDecisionNo ?? "";
  document.getElementById("MonthlyAmount").value   = item.monthlyAmount ?? "";
  document.getElementById("startDate").value       = item.startDate ? String(item.startDate).split("T")[0] : "";
  document.getElementById("stopDate").value        = item.stopDate ? String(item.stopDate).split("T")[0] : "";
  document.getElementById("stopReason").value      = item.stopReason ?? "";

  // إن كنتِ تستخدمين dropdown مخصص للمحضّرين:
  // الزر يحوي data-agent-id بعد الاختيار (من كود الدروبداون السابق)
  // لا حاجة لتعبئته هنا

  // افتحي المودال
  modalConfirm.show();
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

node.querySelector("[data-action='accept']").addEventListener("click", () => {
    if(item?.divorceCaseFlag == 2){
  const text =   "لا يمكنك قبول الطلب لأنه الواقعة الطلاق غير مسجلة في النظام.";
  MessageSpan.textContent = text;

    const modal = new bootstrap.Modal(modalAlertMessage);
  modal.show();
    }
 else{

    openAcceptModal(item);
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
    hideErrorDialog()
  if (!currentRejectAlimonyId) return;

  const notes = (rejectNotesInput.value || "").trim();
  if (!notes) {
    rejectNotesInput.focus();
    return;
  }

  try {
    showSpinnerformLoading();
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
      showSuccessMessage(res?.message)    
        const inst = bootstrap.Modal.getInstance(modalRejectEl) || new bootstrap.Modal(modalRejectEl);
      inst.hide();
      // أعد تحميل القائمة بنفس الفلاتر
      await loadRequests(_lastQueryUsed);
    } else {
      showErrorDialog(res?.message || "فشل الرفض");
    }
  } catch (e) {
    showErrorDialog("تعذر الاتصال بالخادم" );
  } finally {
 
    // hideSpinnerformLoading();
  }
});
async function submitAcceptFromModal() {
    hideErrorDialog('error-messageDialog-accept')

  if (!modalConfirmEl) return;

  const alimonyId = modalConfirmEl.dataset.alimonyId;
  if (!alimonyId) {
    console.log("رقم طلب النفقة مفقود.");
    showErrorDialog("رقم طلب النفقة مفقود.");
    return;
  }

  // قراءة القيم من المودال
  const caseNumber      = getVal("CaseNumber");            // نص/للإظهار غالباً
  const courtDecisionNo = getVal("CourtDecisionNo");       // رقم قضية النفقة
  const monthlyAmount   = getVal("MonthlyAmount");         // مبلغ شهري
  const startDate       = getVal("startDate");             // yyyy-MM-dd
  const stopDate        = getVal("stopDate");              // yyyy-MM-dd
  const stopReason      = getVal("stopReason");            // سبب الإيقاف (اختياري)

  // ملف قرار النفقة
  const decreeFile = document.getElementById("alimonyDecree")?.files?.[0] || null;

  // مُعرّف المحضر المختار من dropdown المخصص (زرّ الاختيار يحمل القيم)
  const bailiffUserId = ddBtn?.dataset?.agentId || "";
console.log(document.getElementById("agentDropdownBtn").value) 
 console.log(ddBtn?.dataset?.agentId)

  // تحقّق بسيط
  const missing = [];
  if (!courtDecisionNo) missing.push("رقم قضية النفقة");
  if (!monthlyAmount)   missing.push("مبلغ النفقة الشهري");
  if (!startDate)       missing.push("تاريخ السريان");
  if (!bailiffUserId)   missing.push("اسم المحضر");
  if (!decreeFile)   missing.push("مستند قرار النفقة ");

  if (missing.length) {
    console.log(missing)
    showErrorDialog("الحقول التالية مطلوبة: " + missing.join("، "),'error-messageDialog-accept');
    console.log('sazdasdad')
    return;
  }

  const fd = new FormData();

fd.append("attachmentFile", decreeFile);
  fd.append("AlimonyId",        alimonyId);
  fd.append("Decision",         1); // 2 = قبول
  if (caseNumber)               fd.append("CaseNumber", caseNumber);
  fd.append("MonthlyAmount",    monthlyAmount);          // رقم/نص (الباك يحوله)
  fd.append("StartDate",        startDate);              // yyyy-MM-dd
  if (stopDate)                 fd.append("StopDate", stopDate);
  if (stopReason)               fd.append("StopReason", stopReason);
  fd.append("CourtDecisionNo",  courtDecisionNo);
  fd.append("BailiffUserId",    bailiffUserId);          // GUID

  // الإرسال
  try {
    showSpinnerformLoading('formLoading-accept');
    const res = await postDataWithFile(ENDPOINT_ACCEPT,fd)
    if (res.status === 413) {
      showErrorDialog("حجم الملف/الطلب أكبر من الحد المسموح به على الخادم. تم رفع الحدود، أعد المحاولة.",'error-messageDialog-accept');
      return;
    }
    if (res?.isSuccess) {
      modalConfirm.hide();
        const text =  res?.message;
  MessageSpan.textContent = text;

    const modal = new bootstrap.Modal(modalAlertMessage);
  modal.show();
      await loadRequests(_lastQueryUsed);
    } else {
      showErrorDialog(res?.message || "فشل القبول",'error-messageDialog-accept');
    }
  } catch (err) {
    console.error(err);
    showErrorDialog("تعذر الاتصال بالخادم",'error-messageDialog-accept');
  } finally {
    hideSpinnerformLoading('formLoading-accept');
  }
}

// اربطي زرّ “حفظ” داخل المودال (زر .btn-primary)
acceptAlimony.addEventListener("click",  submitAcceptFromModal);

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
await populateAgents(ROLE_FOLLOWUPAGENT)
  await loadRequests();
});
let agentsCache = [];

function normalize(str) {
  return (str ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
function onPickAgent(e) {
  e.preventDefault();
  const a = e.currentTarget;
  selectedAgent = { id: a.dataset.id, name: a.dataset.name };

  // عدّل عنوان الزر وخزّن القيم عليه لو احتجتها لاحقًا
  ddLabel.textContent = selectedAgent.name || "اختر";
  ddBtn.dataset.agentId = selectedAgent.id;
  ddBtn.dataset.agentName = selectedAgent.name;
console.log(  ddBtn.dataset.agentId = selectedAgent.id)
  // أغلق القائمة
  const bsDD = bootstrap.Dropdown.getOrCreateInstance(ddBtn);
  bsDD.hide();
}
function renderAgentItems(items, query = "") {
  const q = normalize(query);
  listEl.innerHTML = "";

  const visible = items.filter(it =>
    !q || normalize(it.name).includes(q) || String(it.id).includes(q)
  );

  if (visible.length === 0) {
    listEl.innerHTML = `<div class="list-group-item text-muted direction-rtl">لا نتائج</div>`;
    return;
  }

  for (const it of visible) {
    const a = document.createElement("a");
    a.href = "#";
    a.className = "list-group-item list-group-item-action direction-rtl";
    a.dataset.id = it.id;
    a.dataset.name = it.name;
    a.textContent = it.name;
    a.addEventListener("click", onPickAgent);
    listEl.appendChild(a);
  }
}

export async function populateAgents(role = ROLE_FOLLOWUPAGENT) {
  listEl.innerHTML = `<div class="list-group-item text-muted direction-rtl">جاري التحميل...</div>`;
  try {
    const res = await GetAPI(`${API_BASE}/api/Person/GetPersonByRole?Role=${encodeURIComponent(role)}`);
    agentsCache = (res?.results || []).map(x => ({ id: x.personId, name: x.name }));
    renderAgentItems(agentsCache);
  } catch (e) {
    console.log(e)
    listEl.innerHTML = `<div class="list-group-item text-danger direction-rtl">تعذر التحميل</div>`;
  }
}

filterEl?.addEventListener("input", () => {
  renderAgentItems(agentsCache, filterEl.value);
});

ddBtn?.addEventListener("click", async () => {
  if (!ddBtn.dataset.loaded) {
    await populateAgents(ROLE_FOLLOWUPAGENT);
    ddBtn.dataset.loaded = "1";
  } else {
    filterEl.value = "";
    renderAgentItems(agentsCache);
  }
  setTimeout(() => filterEl?.focus(), 50);
});
