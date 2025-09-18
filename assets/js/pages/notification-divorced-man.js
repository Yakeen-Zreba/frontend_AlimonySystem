import { GetAPI } from "../api/httpClient.js";
import { showError, showSpinner, hideSpinner, showSuccessMessage, hideErrorDialog, showErrorDialog, showSpinnerformLoading, hideSpinnerformLoading } from "../utils/helpers.js";

// مكان عرض الكروت
const accordionContainer = document.getElementById("accordionExample");

// عنصر عدد الإشعارات في الـ NavBar
const notificationCountElement = document.getElementById("notificationCount");

// معلومات المستخدم
const husbandPersonId = localStorage.getItem("PersonId");
const daysThreshold = 19; // يمكن تغييرها أو جعلها كمدخل
const API_BASE = "http://localhost:5016";

// دالة لإنشاء HTML لكارت الدفع
function createCardHtml(item, index, type) {
    const cardId = `accordion${index}`;
    const headingId = `heading${index}`;
    const isFirstCard = index === 0;
    const isDueSoon = type === 'dueSoon';

    const formattedDate = item.monthStart ? new Date(item.monthStart).toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" }) : "غير محدد";    

    
    // النص والعنوان سيتغيران بناءً على نوع الدفعة
    const headingText = isDueSoon ? `يجب دفع نفقة عن شهر: ${formattedDate}` : `نفقة متأخرة عن شهر: ${formattedDate}`;
    const headingClass = isDueSoon ? 'text-primary' : 'text-danger';

    // حساب المبلغ المتبقي
    const remainingAmount = item.monthlyAmount - item.paidForMonth;
    
    // تحديد حالة الدفع
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
                    <p>رقم القضية : ${item.caseNumber || "-"}</p>
                    <p>رقم قرار النفقة : ${item.courtDecisionNo || "-"}</p>
                    <p>اسم الزوجة : ${item.wifeName || "-"}</p>
                    <p>المبلغ الإجمالي المستحق: ${item.monthlyAmount || "0"} د.ل</p>
                    <p class="mt-2 ${paymentStatusClass}">حالة الدفع: ${paymentStatusText}</p>
                    ${remainingAmount > 0 ? `<p class="mt-2">المبلغ المتبقي: ${remainingAmount} د.ل</p>` : ''}
                    <p>ملاحظات: ${item.description || "-"}</p>
                    <a href="almony-payment.html?id=${item.alimonyId}" class="btn btn-primary">دفع النفقة</a>
                </div>
            </div>
        </div>
    `;
}

async function loadOverduePayments() {
    try {
        showSpinner();

        const response = await GetAPI(
            `${API_BASE}/api/Payments/Husband/overdue?husbandPersonId=${husbandPersonId}&daysThreshold=${daysThreshold}`
        );

        if (!response || !response.isSuccess) {
            showError("فشل في جلب البيانات من السيرفر");
            return;
        }

        const results = response.results;
        accordionContainer.innerHTML = ""; // إفراغ المحتوى القديم

        // حساب عدد الإشعارات الديناميكي
        const notificationCount = results.length;
        notificationCountElement.textContent = notificationCount > 0 ? notificationCount : '';
        if (notificationCount === 0) {
            notificationCountElement.style.display = 'none';
        } else {
            notificationCountElement.style.display = 'inline-block';
        }

        const overduePayments = results.filter(item => item.isOverdue);
        const dueSoonPayments = results.filter(item => item.isDueSoon);

        if (overduePayments.length === 0 && dueSoonPayments.length === 0) {
            accordionContainer.innerHTML = `<div class="alert alert-info">لا توجد مدفوعات متأخرة أو قريبة الاستحقاق</div>`;
            return;
        }

        // رسم الكروت
        // أولاً، عرض المدفوعات "قريبة الاستحقاق" لأنها أكثر إلحاحًا
        dueSoonPayments.forEach((item, index) => {
            const cardHtml = createCardHtml(item, index, 'dueSoon');
            accordionContainer.insertAdjacentHTML("beforeend", cardHtml);
        });
        
        // ثم، عرض المدفوعات "المتأخرة"
        overduePayments.forEach((item, index) => {
            const cardHtml = createCardHtml(item, index + dueSoonPayments.length, 'overdue');
            accordionContainer.insertAdjacentHTML("beforeend", cardHtml);
        });

    } catch (err) {
        console.error(err);
        showError("تعذر الاتصال بالخادم");
    } finally {
        hideSpinner();
    }
}

// التحميل عند فتح الصفحة
document.addEventListener("DOMContentLoaded", loadOverduePayments);