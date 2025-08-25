import { showError,  showSpinner,hideSpinner,   } from "../utils/helpers.js";
import {  GetAPI } from "../api/httpClient.js";


document.addEventListener("DOMContentLoaded",async function () {
  await loadMarriageContract();
});



async function loadMarriageContract() {
    try{
      showSpinner()
   
    const response = await GetAPI("https://localhost:44377/api/MarriageDivorce/GetDivorce-Cases",'../login.html');
  
    if (response.isSuccess && Array.isArray(response.results)) {
  const tableBody = document.getElementById("DivorceCasesTableBody");
      tableBody.innerHTML = ""; // تنظيف الجدول قبل إعادة تعبئته

        response.results.forEach(Item => {
          const tr = document.createElement("tr");

 
          tr.innerHTML = `
            <td><span class="badge bg-label-primary me-1">${Item.caseNumber || ''} </span></td>
            <td>${Item.husbandName || ''}</td>
            <td>${Item.wifeName || ''}</td>
            <td>${Item.courtDecision || ''}</td>
            <td>${Item.divorceDate || ''}</td>
          
          `;

//  أخيرًا: أضف الصف للجدول
tableBody.appendChild(tr);
          tableBody.appendChild(tr);
     });
    } else {
      showError("فشل في جلب البيانات");
    }
  } catch (error) {
    console.log(error)
    showError("تعذر الاتصال بالخادم", error);
  } 
  finally {
    hideSpinner(); //  بعد الانتهاء
  }
}

