console.log("✅ script.js loaded");

// Initialize Realtime DB
const db = firebase.database();

// Map init (for dashboard)
if (document.getElementById('map')) {
  const map = L.map('map').setView([13.997, 74.525], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  let marker;

  // Show bus position
  db.ref('/fleet_status/Bus_101').on('value', snap => {
    const d = snap.val();
    if (!d) return;
    if (marker) map.removeLayer(marker);
    marker = L.marker([d.latitude, d.longitude]).addTo(map)
      .bindPopup(`🚌 Bus 101<br>Speed: ${d.speed_kmph} km/h`).openPopup();
  });

  // Show student logs
  const table = document.getElementById('logTable');
  const uid = localStorage.getItem('studentUID');
  db.ref('/fleet_events/rfid_logs').on('value', snap => {
    const data = snap.val();
    table.innerHTML = '';
    if (!data) return;
    Object.values(data)
      .filter(e => !uid || e.passenger_uid === uid)
      .reverse()
      .slice(0, 10)
      .forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML =
          `<td class="border p-2">${e.passenger_uid}</td>
           <td class="border p-2">${e.action}</td>
           <td class="border p-2">${e.lat?.toFixed(4)}, ${e.lng?.toFixed(4)}</td>
           <td class="border p-2">${e.timestamp}</td>`;
        table.appendChild(tr);
      });
  });
}
