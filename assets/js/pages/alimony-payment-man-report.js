import { showError, showSpinner, hideSpinner } from "../utils/helpers.js";
import { GetAPI } from "../api/httpClient.js";


const ENDPOINT_LIST   = `http://localhost:5016/api/Payments/GetAllPaymentsWithHusbandsAsync`;

async function loadPaymentsReport(fromDate = "", toDate = "", CourtDecisionNo = "") {
  try {
    showSpinner();

    const params = new URLSearchParams();

    params.set("payerPersonId", localStorage.getItem('PersonId'));



    if (CourtDecisionNo) {
      params.append("courtDecisionNo", CourtDecisionNo.trim());
    }
    if (fromDate) {
      params.append("payDateFrom", fromDate);
    }
    if (toDate) {
      params.append("payDateTo", toDate);
    }

    const url = `${ENDPOINT_LIST}?${params.toString()}`;
    const response = await GetAPI(url);


    console.log("API Response:", response);

    const tableBody = document.getElementById("paymentsTableBody");
    tableBody.innerHTML = "";

    if (response.isSuccess && Array.isArray(response.results) && response.results.length > 0) {
      response.results.forEach((pay) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${pay.courtDecisionNo || "-"}</td>
          <td>${pay.payDate ? new Date(pay.payDate).toLocaleDateString("en-GB") : "-"}</td>
          <td>${pay.wifeName || "-"}</td>
          <td>${pay.husbandName || "-"}</td>
          <td>${pay.monthlyAmount || "0"}</td>
          <td>${pay.amountPaid || "0"}</td>
          <td>${pay.methodText || "-"}</td>
          <td>
            <span class="badge ${pay.status === 3 ?  "bg-label-danger": "bg-label-success" }">
              ${pay.statusText || "غير محدد"}
            </span>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    } else {
      showError("لا توجد بيانات للعرض");
    }
  } catch (err) {
    console.error(err);
    showError("تعذر الاتصال بالخادم");
  } finally {
    hideSpinner();
  }
}

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", async () => {
  // تحميل أولي بدون فلترة
  await loadPaymentsReport();

  // زر البحث
  document.getElementById("searchBtn").addEventListener("click", async () => {
    const CourtDecisionNo = document.getElementById("searchAlmonyNumberInput").value;
    const fromDate = document.getElementById("startDate").value;
    const toDate = document.getElementById("endDate").value;

    if (!CourtDecisionNo && !fromDate && !toDate) {
      showError("الرجاء إدخال رقم قرار النفقة أو تحديد فترة زمنية للبحث");
      return;
    }

    await loadPaymentsReport(fromDate, toDate, CourtDecisionNo);
      const notificationCountElement = document.getElementById("notificationCount");
    
    
       try {
    const husbandPersonId = localStorage.getItem("PersonId");
    const daysThreshold = 5; 
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
});
