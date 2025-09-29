import {  GetAPI } from "../api/httpClient.js";

const API_BASE = "http://localhost:5016";

document.addEventListener("DOMContentLoaded",async function () {
  const username = localStorage.getItem("username");

  if (username) {

    const usernameElement = document.getElementById("usernameDisplay");
    if (usernameElement) {
      usernameElement.textContent = username;
    }
  }

  
         try {
            const notificationCountElement = document.getElementById("notificationCount");

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