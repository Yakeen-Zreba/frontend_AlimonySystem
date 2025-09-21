
import {
  showError, showSpinner, hideSpinner,showSuccessMessage,hideErrorDialog,showErrorDialog,showSpinnerformLoading,hideSpinnerformLoading
} from "../utils/helpers.js";
import { GetAPI, postAPI ,postDataWithFile} from "../api/httpClient.js";

/* إعدادات API */
const API_BASE  = "http://localhost:5016";
const File_BASE = "http://localhost:1212/"; // جذر استضافة الملفات الثابتة (IIS static site)
const ENDPOINT_LIST   = `${API_BASE}/api/Payments/Husband/payments-by-payer`;

/* عناصر من الصفحة */
const grid    = document.getElementById("requestsGrid");
const tpl     = document.getElementById("requestCardTpl");
/* (اختياري) مودال عرض قرار المحكمة إن كان موجوداً في الصفحة */


const courtWifeSpan  = document.getElementById("courtWifeName");     // <span id="courtWifeName">
const rejectNotesInput = document.getElementById("notes");
let currentRejectAlimonyId = null;  // نخزّن هنا الـ id للكرت المختار

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
  renderDocumentLinks(docsBox, item.Documents);
  node.querySelector("[data-field='createdAgo']").textContent    = timeAgo(item.payDate);

  grid.appendChild(node);
}



/* تحميل القائمة مع فلاتر */
let _lastQueryUsed = {};
export async function loadRequests(query = {}) {
  try {
    showSpinner();


    const p = new URLSearchParams();
    p.set("payerPersonId", localStorage.getItem("PersonId"));


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
  const notificationCountElement = document.getElementById("notificationCount");


   try {
const husbandPersonId = localStorage.getItem("PersonId");
const daysThreshold = 12; 
        const response = await GetAPI(
            `${API_BASE}/api/Payments/Husband/overdue?husbandPersonId=${husbandPersonId}&daysThreshold=${daysThreshold}`
        );

        if (!response || !response.isSuccess) {
            return;
        }

        const results = response.results;

        // حساب عدد الإشعارات الديناميكي
        const notificationCount = results.length;
        notificationCountElement.textContent = notificationCount > 0 ? notificationCount : '';
        if (notificationCount === 0) {
            notificationCountElement.style.display = 'none';
        } else {
            notificationCountElement.style.display = 'inline-block';
        }

      
    } catch (err) {
        console.error(err);
    } finally {
    }
});
