import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const studentUID = localStorage.getItem("studentUID");
const studentName = localStorage.getItem("studentName");

if (!studentUID) {
  window.location.href = "index.html";
}

document.getElementById("studentName").textContent = studentName;
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "index.html";
};

// Ask notification permission
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

const tableBody = document.getElementById("activityTable");
const statusEl = document.getElementById("status");
const locationEl = document.getElementById("location");
const busEl = document.getElementById("busInfo");

const logRef = ref(db, "fleet_events/rfid_logs");

let lastStatus = "";

onValue(logRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const logs = Object.values(data).filter(d => d.uid === studentUID);
  if (logs.length === 0) return;

  const latest = logs[logs.length - 1];

  busEl.textContent = latest.bus || "Bus 101";
  statusEl.textContent = latest.status;
  locationEl.textContent = latest.location;

  // Table display
  tableBody.innerHTML = "";
  logs.slice(-10).reverse().forEach(log => {
    const row = `<tr class="border-b">
      <td class="p-2">${new Date(log.timestamp).toLocaleString()}</td>
      <td class="p-2">${log.status}</td>
      <td class="p-2">${log.location}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });

  // Send notification if status changes
  if (latest.status !== lastStatus) {
    new Notification(`${studentName} ${latest.status} the bus!`, {
      body: `Bus: ${latest.bus}\nLocation: ${latest.location}`,
      icon: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png"
    });
    lastStatus = latest.status;
  }
});

