import { showError, showSpinner, hideSpinner } from "../utils/helpers.js";
import { GetAPI } from "../api/httpClient.js";

/* فورمات بسيطة */
const fmtMoney = n => (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB") : "-";
const fmtMonth = d => d ? new Date(d).toLocaleDateString("en-GB", { month:"2-digit", year:"numeric" }) : "-";
/** تحميل التقرير */
async function loadPaymentsReport(fromDate = "", toDate = "", courtDecisionNo = "") {
  try {
    showSpinner();

    // مفاتيح الباراميترات حسب الباك: from, to, CourtDecisionNo
    const params = new URLSearchParams();
    if (courtDecisionNo) params.append("CourtDecisionNo", courtDecisionNo.trim());
    if (fromDate)        params.append("from", fromDate);
    if (toDate)          params.append("to", toDate);

    const url = `http://localhost:5016/api/Payments/GetPaymentsReportAsDetailsAsync?${params.toString()}`;
    const response = await GetAPI(url);

    const tbody = document.getElementById("paymentsTableBody");
    tbody.innerHTML = "";

    if (!response?.isSuccess || !Array.isArray(response.results) || response.results.length === 0) {
      showError("لا توجد بيانات للعرض");
      return;
    }

    response.results.forEach((pay, idx) => {
      const rowId = `r${idx}`;

      // صف الملخص
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pay.courtDecisionNo || "-"}</td>
        <td>${fmtDate(pay.payDate)}</td>
        <td>${pay.wifeName || "-"}</td>
        <td>${pay.husbandName || "-"}</td>
        <td>${fmtMoney(pay.monthlyAmount)}</td>
        <td>${fmtMoney(pay.amountPaid)}</td>
        <td>${fmtMonth(pay.periodFrom) || "-"}</td>
        <td>${fmtMonth(pay.periodTo )|| "-"}</td>
        <td>${pay.methodText || "-"}</td>
        <td>
          <span class="badge ${
            pay.status === 3 ? "bg-label-danger" : // مرفوض
            pay.status === 0 ? "bg-label-success" : "bg-label-secondary"
          }">
            ${pay.statusText || "غير محدد"}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-toggle-details="${rowId}">
            التفاصيل
          </button>
        </td>
      `;
      tbody.appendChild(tr);

      // صف التفاصيل (مخفي)
      const trDetails = document.createElement("tr");
      trDetails.id = rowId;
      trDetails.className = "d-none";
      trDetails.innerHTML = `
        <td colspan="9" style="background:#fafafa">
          ${
            Array.isArray(pay.months) && pay.months.length
              ? `
                <div class="table-responsive">
                  <table class="table table-sm table-bordered align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>الشهر</th>
                        <th>المبلغ الشهري</th>
                        <th>المدفوع في هذه الدفعة</th>
                        <th>المدفوع حتى الآن</th>
                        <th>المتبقي بعد هذه الدفعة</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pay.months.map(m => `
                        <tr>
                          <td>${fmtMonth(m.monthStart)}</td>
                          <td>${fmtMoney(m.monthlyAmount)}</td>
                          <td>${fmtMoney(m.paidThisPayment)}</td>
                          <td>${fmtMoney(m.cumulativePaid)}</td>
                          <td>${fmtMoney(m.remainingAfter)}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              `
              : `<div class="text-muted">لا يوجد تفصيل شهري لهذه الدفعة.</div>`
          }
        </td>
      `;
      tbody.appendChild(trDetails);
    });

    // إظهار/إخفاء التفاصيل
    tbody.querySelectorAll("[data-toggle-details]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-toggle-details");
        const row = document.getElementById(id);
        row.classList.toggle("d-none");
      });
    });

  } catch (err) {
    console.error(err);
    showError("تعذر الاتصال بالخادم");
  } finally {
    hideSpinner();
  }
}

/* تحميل أولي + البحث */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPaymentsReport();

  document.getElementById("searchBtn").addEventListener("click", async () => {
    const courtDecisionNo = document.getElementById("searchAlmonyNumberInput").value;
    const fromDate        = document.getElementById("startDate").value;
    const toDate          = document.getElementById("endDate").value;

    if (!courtDecisionNo && !fromDate && !toDate) {
      showError("الرجاء إدخال رقم قرار النفقة أو تحديد فترة زمنية للبحث");
      return;
    }
    await loadPaymentsReport(fromDate, toDate, courtDecisionNo);
  });
});
