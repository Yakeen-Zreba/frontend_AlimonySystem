// updateNotificationCount.js

import { GetAPI } from "./api/httpClient.js";

const notificationCountElement = document.getElementById("notificationCount");
const API_BASE = "http://localhost:5016";
const husbandPersonId = localStorage.getItem("PersonId"); // أو EmployeeId

export async function updateNotificationCount() {
    try {
        let response;
        if (husbandPersonId) {
            // حالة الزوج
            response = await GetAPI(`${API_BASE}/api/Payments/Husband/overdue?husbandPersonId=${husbandPersonId}&daysThreshold=5`);
        } else {
            // حالة الموظف
            response = await GetAPI(`${API_BASE}/api/Payments/Employee/overdue?daysThreshold=5`);
        }

        if (!response || !response.isSuccess) {
            console.error("Failed to fetch notification count.");
            return;
        }

        const notificationCount = response.results.length;
        if (notificationCountElement) {
            notificationCountElement.textContent = notificationCount > 0 ? notificationCount : '';
            notificationCountElement.style.display = notificationCount > 0 ? 'inline-block' : 'none';
        }

    } catch (err) {
        console.error("Error updating notification count:", err);
    }
}