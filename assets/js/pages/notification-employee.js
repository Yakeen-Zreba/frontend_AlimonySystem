import { GetAPI } from "../api/httpClient.js";
import { showError, showSpinner, hideSpinner,showSuccessMessage } from "../utils/helpers.js";

// مكان عرض الكروت
const accordionContainer = document.getElementById("accordionExample");
const notificationCountElement = document.getElementById("notificationCount");

const daysThreshold = 5; 
const API_BASE = "http://localhost:5016";

function createCardHtml(item, index) {
    const cardId = `accordion${index}`;
    const headingId = `heading${index}`;
    const isFirstCard = index === 0;

const formattedDate = item.monthStart ? new Date(item.monthStart).toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" }) : "غير محدد";    

    const headingText = `نفقة متأخرة عن شهر: ${formattedDate} (${item.husbandName})`;
    const headingTextEmail = `${formattedDate}` ;
    const headingClass = 'text-danger';

    // حساب المبلغ المتبقي
    const remainingAmount = item.monthlyAmount - item.paidForMonth;
    
    let paymentStatusText = '';
    let paymentStatusClass = '';

    if (item.paidForMonth === item.monthlyAmount && item.paidForMonth > 0) {
        paymentStatusText = "مدفوع بالكامل";
        paymentStatusClass = "text-success";
    } else if (item.paidForMonth > 0 && item.paidForMonth < item.monthlyAmount) {
        paymentStatusText = `مدفوع جزئياً: ${item.paidForMonth} د.ل`;
        paymentStatusClass = "text-warning";
    } else {
        paymentStatusText = "غير مدفوع";
        paymentStatusClass = "text-danger";
    }
    
    return `
        <div class="accordion-item">
        <div class=""row>
          <h2 class="accordion-header" id="${headingId}">
                <button
                    type="button"
                    class="accordion-button ${isFirstCard ? "" : "collapsed"}"
                    data-bs-toggle="collapse"
                    data-bs-target="#${cardId}"
                    aria-expanded="${isFirstCard ? "true" : "false"}"
                    aria-controls="${cardId}">
                    <h5 class="${headingClass}">
                        ${headingText}
                    </h5>
                </button>
            </h2>
      </div>
            <div 
                id="${cardId}"
                class="accordion-collapse collapse ${isFirstCard ? "show" : ""}"
                data-bs-parent="#accordionExample">
                <div class="accordion-body">
                    <p>اسم الزوج: ${item.husbandName || "-"}</p>
                    <p>رقم قضية الطلاق : ${item.caseNumber || "-"}</p>
                    <p>رقم قرار النفقة : ${item.courtDecisionNo || "-"}</p>
                    <p>اسم المطلقة : ${item.wifeName || "-"}</p>
                    <p>المبلغ المتفق عليه شهريا: ${item.monthlyAmount || "0"} د.ل</p>
                    <p class="mt-2 ${paymentStatusClass}">حالة الدفع: ${item.description }</p>
                    ${remainingAmount > 0 ? `<p class="mt-2">المبلغ المتبقي: ${remainingAmount} د.ل</p>` : ''}
                     <a href="#"
           class="ms-0 text-success fw-medium"
           style="white-space:nowrap"
           data-action="sendEmail"
           data-id="${item.alimonyId}"
           data-husband="${item.husbandName}"
           data-wife="${item.wifeName}"
           data-case="${item.caseNumber}"
           data-decision="${item.courtDecisionNo}"
           data-monthly="${item.monthlyAmount}"
           data-heading="${headingTextEmail}"
           data-amount="${remainingAmount}">
           ✉️ ارسال إشعار عبر البريد
        </a>
                </div>
            </div>
        </div>
    `;
}
// بعد الإدراج اربط event
accordionContainer.addEventListener("click", async (e) => {
  const link = e.target.closest("[data-action='sendEmail']");
  if (!link) return;

  e.preventDefault();
  e.stopPropagation(); // مهمّة: ما تخليش زر الكولابس يشتغل

  const husband    = link.dataset.husband || "-";
  const wife       = link.dataset.wife || "-";
  const caseNumber = link.dataset.case || "-";
  const decisionNo = link.dataset.decision || "-";
  const amount     = link.dataset.amount || "0";
  const monthlyAmount= link.dataset.monthly|| "0";
  const  heading= link.dataset.heading || " ";
  const content = `
  لديك نفقة يجب تسديسها عن شهر ${heading}
   بيانات النفقة
    اسم الزوج: ${husband}
       اسم المطلقة : ${wife}
    رقم قرار النفقة : ${decisionNo}
      المبلغ المتفق عليه شهرياً: ${monthlyAmount}
    المبلغ الذي يجب تسديده: ${amount} د.ل
  `;

  const emailData = {
    emailTo: "amal.elbuaishi95@gmail.com", // غيّرها
    subject: `تنبيه بتأخير دفع النفقة - قرار ${decisionNo}`,
    message: content
  };

  try {
            showSpinner();

    const resp = await fetch(`${API_BASE}/api/Payments/admin/SendEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData)
    });
    const json = await resp.json();
    if (json?.isSuccess) {
      showSuccessMessage(json.message || "تم إرسال البريد بنجاح");
    } else {
      showError("فشل إرسال البريد: " + (json?.message || ""));
    }
  } catch (err) {
    console.error(err);
    showError("خطأ في الاتصال بالسيرفر");
  }finally {
        hideSpinner();
    }
});


async function loadOverduePayments() {
    try {
        showSpinner();

        const response = await GetAPI(
            `${API_BASE}/api/Payments/Employee/overdue?daysThreshold=${daysThreshold}`
        );

        if (!response || !response.isSuccess) {
            showError("فشل في جلب البيانات من السيرفر");
            return;
        }

        const results = response.results;
        accordionContainer.innerHTML = "";

        const notificationCount = results.length;
        notificationCountElement.textContent = notificationCount > 0 ? notificationCount : '';
        if (notificationCount === 0) {
            notificationCountElement.style.display = 'none';
        } else {
            notificationCountElement.style.display = 'inline-block';
        }

        if (results.length === 0) {
            accordionContainer.innerHTML = `<div class="alert alert-secondary"  style="font-weight: bold;">لا توجد مدفوعات متأخرة </div>`;
            return;
        }

        results.forEach((item, index) => {
            const cardHtml = createCardHtml(item, index);
            accordionContainer.insertAdjacentHTML("beforeend", cardHtml);
        });

    } catch (err) {
        console.error(err);
        showError("تعذر الاتصال بالخادم");
    } finally {
        hideSpinner();
    }
}

// تحميل عند فتح الصفحة
document.addEventListener("DOMContentLoaded", loadOverduePayments);