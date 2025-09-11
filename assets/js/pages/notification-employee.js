import { GetAPI } from "../api/httpClient.js";
import { showError, showSpinner, hideSpinner } from "../utils/helpers.js";

// مكان عرض الكروت
const accordionContainer = document.getElementById("accordionExample");
const notificationCountElement = document.getElementById("notificationCount");

const daysThreshold = 5; // يمكن تغييرها
const API_BASE = "http://localhost:5016";

// دالة لإنشاء HTML لكارت الدفع
function createCardHtml(item, index) {
    const cardId = `accordion${index}`;
    const headingId = `heading${index}`;
    const isFirstCard = index === 0;

const formattedDate = item.monthStart ? new Date(item.monthStart).toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" }) : "غير محدد";    

    const headingText = `نفقة متأخرة عن شهر: ${formattedDate} (${item.husbandName})`;
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
            <div
                id="${cardId}"
                class="accordion-collapse collapse ${isFirstCard ? "show" : ""}"
                data-bs-parent="#accordionExample">
                <div class="accordion-body">
                    <p>اسم الزوج: ${item.husbandName || "-"}</p>
                    <p>رقم القضية : ${item.caseNumber || "-"}</p>
                    <p>رقم قرار النفقة : ${item.courtDecisionNo || "-"}</p>
                    <p>اسم الزوجة : ${item.wifeName || "-"}</p>
                    <p>المبلغ الإجمالي المستحق: ${item.monthlyAmount || "0"} د.ل</p>
                    <p class="mt-2 ${paymentStatusClass}">حالة الدفع: ${paymentStatusText}</p>
                    ${remainingAmount > 0 ? `<p class="mt-2">المبلغ المتبقي: ${remainingAmount} د.ل</p>` : ''}
                    <p>ملاحظات: ${item.description || "-"}</p>
                </div>
            </div>
        </div>
    `;
}

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
            accordionContainer.innerHTML = `<div class="alert alert-info">لا توجد مدفوعات متأخرة أو قريبة الاستحقاق</div>`;
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