import { GetAPI } from "../api/httpClient.js";
import {showError, showSpinner, hideSpinner,showSuccessMessage,hideErrorDialog,showErrorDialog,showSpinnerformLoading,hideSpinnerformLoading } from "../utils/helpers.js";

// مكان عرض الكروت
const accordionContainer = document.getElementById("accordionExample");

// user info
const husbandPersonId = localStorage.getItem("husbandPersonId"); 
const daysThreshold = 5; // نقدر نغيرها أو نخليها input

async function loadOverduePayments() {
  try {
    showSpinnerformLoading();

   
    const response = await GetAPI(
      `/api/Payments/Husband/overdue?husbandPersonId=${husbandPersonId}&daysThreshold=${daysThreshold}`
    );

    hideSpinnerformLoading();

    if (!response || !response.isSuccess) {
      showError("فشل في جلب البيانات من السيرفر");
      return;
    }

    const results = response.results;
    accordionContainer.innerHTML = ""; // نفرغ القديم

    if (results.length === 0) {
      accordionContainer.innerHTML = `<div class="alert alert-info">لا توجد مدفوعات متأخرة</div>`;
      return;
    }

    // نرسم الكروت
    results.forEach((item, index) => {
      const cardId = `accordion${index}`;
      const headingId = `heading${index}`;

      const cardHtml = `
        <div class="accordion-item">
          <h2 class="accordion-header" id="${headingId}">
            <button
              type="button"
              class="accordion-button ${index !== 0 ? "collapsed" : ""}"
              data-bs-toggle="collapse"
              data-bs-target="#${cardId}"
              aria-expanded="${index === 0 ? "true" : "false"}"
              aria-controls="${cardId}">
              <h5>موعد الدفع القادم : ${item.dueDate || "غير محدد"}</h5>
            </button>
          </h2>

          <div
            id="${cardId}"
            class="accordion-collapse collapse ${index === 0 ? "show" : ""}"
            data-bs-parent="#accordionExample">
            <div class="accordion-body">
              <p>رقم قرار النفقة : ${item.decisionNumber || "-"}</p>
              <p>اسم الزوجة : ${item.wifeName || "-"}</p>
              <p>المبلغ المتفق عليه: ${item.amount || "0"} د.ل</p>
              <a href="almony-payment.html?id=${item.id}" class="btn btn-primary">دفع النفقة</a>
            </div>
          </div>
        </div>
      `;

      accordionContainer.insertAdjacentHTML("beforeend", cardHtml);
    });
  } catch (err) {
      console.error(err);
      showErrorDialog("تعذر الاتصال بالخادم");
    } 
    finally {
      hideSpinnerformLoading();
    }
}

// تحميل عند فتح الصفحة
document.addEventListener("DOMContentLoaded", loadOverduePayments);
