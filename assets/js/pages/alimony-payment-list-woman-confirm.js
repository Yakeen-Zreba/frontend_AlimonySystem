
import {
  showError,hideError, showSpinner, hideSpinner,showSuccessMessage,hideErrorDialog,showErrorDialog,showSpinnerformLoading,hideSpinnerformLoading
} from "../utils/helpers.js";
import { GetAPI, postAPI ,postDataWithFile} from "../api/httpClient.js";

/* إعدادات API */
const API_BASE  = "http://localhost:5016";
const File_BASE = "http://localhost:1212/"; // جذر استضافة الملفات الثابتة (IIS static site)
const ENDPOINT_LIST   = `${API_BASE}/api/Payments/GetAllWifePayments`;
const ENDPOINT_CONFIRM   = `${API_BASE}/api/Payments/Wife/confirm-receipt`;
const modalConfirmEl   = document.getElementById("modalReceipt");
const modalConfirm     = modalConfirmEl ? new bootstrap.Modal(modalConfirmEl) : null;
const BtnConfirm   = document.getElementById("confirm");
const MessageSpan  = document.getElementById("MessageSpan");     // <span id="courtWifeName">
const modalAlertMessage   = document.getElementById("modalAlertMessage");     // <div class="modal" id="modalCourtDoc">

/* عناصر من الصفحة */
const grid    = document.getElementById("requestsGrid");
const tpl     = document.getElementById("requestCardTpl");
/* (اختياري) مودال عرض قرار المحكمة إن كان موجوداً في الصفحة */


const courtWifeSpan  = document.getElementById("courtWifeName");     // <span id="courtWifeName">
let NotesInput = null;
let currentPaymentId = null;  // نخزّن هنا الـ id للكرت المختار

/* أدوات مساعدة */
function timeAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "اليوم";
  if (days === 1) return "منذ يوم";
  return `منذ ${days} أيام`;
}


function normalizePath(p) {
  // حوّل backslashes إلى slashes، وشيل أي بادئة غريبة
  return String(p).replace(/\\/g, "/").replace(/^([A-Za-z]:\/)+/, "");
}

function buildFileUrl(filePath) {
  return File_BASE + normalizePath(filePath);
}

function renderDocumentLinks(containerEl, documents) {
  containerEl.innerHTML = "";

  const validDocs = (documents || []).filter(d => d && d.filePath);
  if (validDocs.length === 0) {
    containerEl.textContent = "لا توجد مستندات";
    return;
  }

  validDocs.forEach((doc, idx) => {
    const a = document.createElement("a");
    a.href = buildFileUrl(doc.filePath);
    a.target = "_blank";
    a.rel = "noopener";
    // لو فيه واصف/وصف نستخدمه، وإلا اسم افتراضي
    a.textContent = doc.description?.trim() || `ملف #${idx + 1}`;
    a.className = "d-block"; // كل رابط في سطر لوحده
    containerEl.appendChild(a);
  });
}
function formatMonthYear(value) {
  if (!value) return "—";
  // جرّب تحويله كـ Date أولاً
  const d1 = new Date(value);
  if (!isNaN(d1)) {
    const mm = String(d1.getMonth() + 1).padStart(2, "0");
    const yy = d1.getFullYear();
    return `${mm}/${yy}`;
  }
  // fallback لِـ "YYYY-MM" أو "YYYY/MM"
  const m = String(value).match(/^(\d{4})[-/](\d{1,2})/);
  if (m) {
    const yy = m[1];
    const mm = String(m[2]).padStart(2, "0");
    return `${mm}/${yy}`;
  }
  return "—";
}
/* الكرت */
function renderCard(item) {
  const node = tpl.content.cloneNode(true);

  // رقم القضية
  node.querySelector("[data-field='courtDecisionNo']").textContent = item.courtDecisionNo ?? "—";

// اسم المطلّقة
const monthlyAmount = item?.monthlyAmount == "" ||  item?.monthlyAmount == null ? " -" :item?.monthlyAmount ;
node.querySelector("[data-field='monthlyAmount']").textContent = monthlyAmount;
node.querySelector("[data-field='notes']").textContent =  item?.notes ?? "لا يوجد";

node.querySelector("[data-field='state']").textContent =item?.status == 0? " تم تسليم من قبل الزوج فقط" : item?.status == 1? "تم تاكيد الاستلام من المحضر ":item?.status == 2? "تم استلام من الزوجة":item?.status == 3? "رفض من قبل المحضر ": "غير معروفه";
node.querySelector("[data-field='payDate']").textContent =  item?.payDate ;
node.querySelector("[data-field='periodTo']").textContent =  formatMonthYear(item?.periodTo) ;
node.querySelector("[data-field='amountPaid']").textContent =  item?.amountPaid ;
node.querySelector("[data-field='periodFrom']").textContent =  formatMonthYear(item?.periodFrom );
node.querySelector("[data-field='wifeName']").textContent =  item?.wifeName ;
node.querySelector("[data-field='husbandName']").textContent =  item?.husbandName ;

// من قدّم الطلب
node.querySelector("[data-field='method']").textContent = item?.method == 1 ? "كاش"  : "شيك";


  const docsBox = node.querySelector("[data-field='docLinks']");
  renderDocumentLinks(docsBox, item.documents);
  node.querySelector("[data-field='createdAgo']").textContent    = timeAgo(item.payDate);
// داخل renderCard(item)
node.querySelector("[data-action='accept']").addEventListener("click",async () => {

  // خزّني AlimonyId على المودال عشان نرجع له عند الحفظ
  modalConfirmEl.dataset.paymentId = item.paymentId;

  modalConfirm.show();
});

  grid.appendChild(node);
}
BtnConfirm.addEventListener("click",  submitAcceptFromModal);

async function submitAcceptFromModal() {
    hideErrorDialog('error-messageDialog-accept')

  if (!modalConfirmEl) return;

  const paymentId = modalConfirmEl.dataset.paymentId;
  if (!paymentId) {
    console.log("رقم الدفع مفقود.");
    showErrorDialog("رقم الدفع مفقود.");
    return;
  }

  const receiptFile = document.getElementById("receipt")?.files?.[0] || null;

  // تحقّق بسيط
  const missing = [];

  if (!receiptFile)   missing.push("إيصال الإستلام ");

  if (missing.length) {
    console.log(missing)
    showErrorDialog("الحقول التالية مطلوبة: " + missing.join("، "),'error-messageDialog-accept');
    return;
  }

  const fd = new FormData();

fd.append("attachmentFile", receiptFile);
  fd.append("paymentId",        paymentId);
  fd.append("wifePersonId",    localStorage.getItem('PersonId'));          // GUID

  // الإرسال
  try {
    showSpinnerformLoading('formLoading-accept');
    const res = await postDataWithFile(ENDPOINT_CONFIRM,fd)
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
      showErrorDialog(res?.message || "فشل تأكيد الاستلام",'error-messageDialog-accept');
    }
  } catch (err) {
    console.error(err);
    showErrorDialog("تعذر الاتصال بالخادم",'error-messageDialog-accept');
  } finally {
    hideSpinnerformLoading('formLoading-accept');
  }
}

export async function ConfirmPayment(Approve) {
    hideError()
  if (!currentPaymentId) return;

console.log(currentPaymentId)

  try {
    showSpinner();
    // الجسم حسب المطلوب: سبب الرفض مع id في الـURL
    const data ={
      PaymentId: currentPaymentId,
      Approve: Approve,
      Note: NotesInput
    }
    const res = await postAPI(ENDPOINT_CONFIRM, data );

    if (res?.isSuccess) {
      // اغلق المودال ونظف
     
      NotesInput = "";
      currentPaymentId = null;
      showSuccessMessage(res?.message)    
      // أعد تحميل القائمة بنفس الفلاتر
      await loadRequests(_lastQueryUsed);
    } else {
      showError(res?.message );
    }
  } catch (e) {
    showError("تعذر الاتصال بالخادم" );
  } finally {
 
    hideSpinner();
  }
};


/* تحميل القائمة مع فلاتر */
let _lastQueryUsed = {};
export async function loadRequests(query = {}) {
  try {
    showSpinner();


    const p = new URLSearchParams();

    p.set("wifeUserId", localStorage.getItem('PersonId'));

  

    const url = `${ENDPOINT_LIST}?${p.toString()}`;
    _lastQueryUsed = {  };

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
