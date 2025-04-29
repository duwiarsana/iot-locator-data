// Data sensor ditampung di object
let sensorData = {
    id: "PDM1234", // ID Dummy
    tegangan: "-",
    arus: "-",
    daya: "-",
    kwh: "-",
    pf: "-",
    biaya: "-"
};

// Fungsi hitung biaya PLN
function hitungBiaya(kwh) {
    const tarifPerKwh = 1444.7; // Tarif PLN per kWh
    return Math.round(kwh * tarifPerKwh);
}

// MQTT Connect
const options = {
    connectTimeout: 4000,
    reconnectPeriod: 4000,
};

const mqttClient = mqtt.connect('ws://10.242.232.8:9001', options);

mqttClient.on('connect', () => {
    console.log('MQTT Connected');
    mqttClient.subscribe('sensor/tegangan');
    mqttClient.subscribe('sensor/arus');
    mqttClient.subscribe('sensor/daya');
    mqttClient.subscribe('sensor/kwh');
    mqttClient.subscribe('sensor/pf');
});

mqttClient.on('message', (topic, message) => {
    const payload = message.toString();

    if (topic === 'sensor/tegangan') {
        sensorData.tegangan = payload;
        const el = document.getElementById('tegangan');
        if (el) el.innerText = payload;
    }
    if (topic === 'sensor/arus') {
        sensorData.arus = payload;
        const el = document.getElementById('arus');
        if (el) el.innerText = payload;
    }
    if (topic === 'sensor/daya') {
        sensorData.daya = payload;
        const el = document.getElementById('daya');
        if (el) el.innerText = payload;
    }
    if (topic === 'sensor/kwh') {
        sensorData.kwh = payload;
        const el = document.getElementById('kwh');
        if (el) el.innerText = payload;

        sensorData.biaya = hitungBiaya(parseFloat(payload));
        const biayaEl = document.getElementById('biaya');
        if (biayaEl) biayaEl.innerText = Number(sensorData.biaya).toLocaleString('id-ID');
    }
    if (topic === 'sensor/pf') {
        sensorData.pf = payload;
        const el = document.getElementById('pf');
        if (el) el.innerText = payload;
    }
});


mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err);
});

// Map dan Marker
window.addEventListener('load', function() {
    const map = L.map('map', { zoomControl: false })
        .setView([-8.6773879009797, 115.22863462372545], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([-8.6773879009797, 115.22863462372545]).addTo(map);

    const popupContent = document.createElement('div');
    popupContent.className = 'text-sm';
    popupContent.innerHTML = `
        <table class="table-auto">
          <tr><td class="pr-2 font-semibold">ID Device</td><td>:</td><td id="idDevice">${sensorData.id}</td></tr>
          <tr><td class="pr-2 font-semibold">Tegangan</td><td>:</td><td><span id="tegangan">-</span> V</td></tr>
          <tr><td class="pr-2 font-semibold">Arus</td><td>:</td><td><span id="arus">-</span> A</td></tr>
          <tr><td class="pr-2 font-semibold">Daya Listrik</td><td>:</td><td><span id="daya">-</span> Watt</td></tr>
          <tr><td class="pr-2 font-semibold">Kwh</td><td>:</td><td><span id="kwh">-</span> kWh</td></tr>
          <tr><td class="pr-2 font-semibold">Power Factor</td><td>:</td><td><span id="pf">-</span></td></tr>
          <tr><td class="pr-2 font-semibold">Biaya</td><td>:</td><td>Rp <span id="biaya">-</span></td></tr>
        </table>
    `;

    marker.bindPopup(popupContent);

    // Supaya popup langsung tampil pas klik
    marker.on('click', function() {
        const popupContent = `
          <div class="text-sm space-y-2">
            <table class="w-full text-left">
              <tbody>
                <tr>
                  <td class="pr-1 font-semibold">ID Device</td>
                  <td class="px-1 font-semibold">:</td>
                  <td><span id="idDevice">${sensorData.id}</span></td>
                </tr>
                <tr>
                  <td class="pr-1 font-semibold">Tegangan</td>
                  <td class="px-1 font-semibold">:</td>
                  <td><span id="tegangan">${sensorData.tegangan}</span> V</td>
                </tr>
                <tr>
                  <td class="pr-1 font-semibold">Arus</td>
                  <td class="px-1 font-semibold">:</td>
                  <td><span id="arus">${sensorData.arus}</span> A</td>
                </tr>
                <tr>
                  <td class="pr-1 font-semibold">Daya Listrik</td>
                  <td class="px-1 font-semibold">:</td>
                  <td><span id="daya">${sensorData.daya}</span> Watt</td>
                </tr>
                <tr>
                  <td class="pr-1 font-semibold">Kwh</td>
                  <td class="px-1 font-semibold">:</td>
                  <td><span id="kwh">${sensorData.kwh}</span> kWh</td>
                </tr>
                <tr>
                  <td class="pr-1 font-semibold">Power Factor</td>
                  <td class="px-1 font-semibold">:</td>
                  <td><span id="pf">${sensorData.pf}</span></td>
                </tr>
                <tr>
                  <td class="pr-1 font-semibold">Biaya</td>
                  <td class="px-1 font-semibold">:</td>
                  <td>Rp <span id="biaya">${Number(sensorData.biaya).toLocaleString('id-ID')}</span></td>
                </tr>
              </tbody>
            </table>
            <div class="pt-2 mt-2 border-t text-xs text-gray-600">
              📍 Jalan Tukad Yeh Aya 18x
            </div>
          </div>
        `;
    
        marker.bindPopup(popupContent).openPopup();
    });
    
});


// Add Device Form Handling
function showRegisterForm() {
    const area = document.getElementById('floatingArea');
    area.innerHTML = `
      <div class="bg-white p-4 rounded-md shadow-md w-80 space-y-3">
        <h2 class="text-lg font-semibold mb-2">Register Device</h2>

        <div>
          <label class="block text-sm mb-1">Device ID</label>
          <input type="text" id="deviceId" class="w-full border rounded-md p-2" readonly>
        </div>

        <div>
          <label class="block text-sm mb-1">Lat, Long</label>
          <input type="text" id="latlong" class="w-full border rounded-md p-2" placeholder="-8.67738,115.22863">
        </div>

        <div>
          <label class="block text-sm mb-1">MQTT IP</label>
          <input type="text" id="mqttIp" class="w-full border rounded-md p-2" placeholder="192.168.1.10">
        </div>

        <div>
          <label class="block text-sm mb-1">MQTT Port</label>
          <input type="text" id="mqttPort" class="w-full border rounded-md p-2" placeholder="1883">
        </div>

        <div id="topicsArea" class="space-y-2">
          <label class="block text-sm mb-1">Topics</label>
          <div class="flex gap-2">
            <input type="text" class="topic-input w-full border rounded-md p-2" placeholder="sensor/temp">
            <button type="button" onclick="addTopic()" class="bg-gray-200 px-2 rounded-md hover:bg-gray-300">+</button>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button onclick="cancelRegister()" class="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
          <button onclick="submitDevice()" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Save</button>
        </div>
      </div>
    `;

    generateDeviceId();
}

function cancelRegister() {
    const area = document.getElementById('floatingArea');
    area.innerHTML = `
      <button id="addDeviceButton" onclick="showRegisterForm()" 
              class="flex items-center justify-center gap-2 min-w-[140px] md:min-w-[160px] px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium text-base rounded-md transform hover:scale-105 transition-transform duration-200 shadow">
        <span class="text-lg">+</span>
        <span class="text-base">Add New Device</span>
      </button>
    `;
}

function generateDeviceId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const deviceIdInput = document.getElementById('deviceId');
    if (deviceIdInput) {
        deviceIdInput.value = `PDM${randomNum}`;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedIn');
        window.location.href = "index.html";
    }
}

function addTopic() {
    const topicsArea = document.getElementById('topicsArea');
    const div = document.createElement('div');
    div.className = "flex gap-2";
    div.innerHTML = `
      <input type="text" class="topic-input w-full border rounded-md p-2" placeholder="new/topic">
    `;
    topicsArea.appendChild(div);
}

function submitDevice() {
    const id = document.getElementById('deviceId')?.value || '';
    const latlong = document.getElementById('latlong')?.value || '';
    const mqttIp = document.getElementById('mqttIp')?.value || '';
    const mqttPort = document.getElementById('mqttPort')?.value || '';
    const topics = Array.from(document.querySelectorAll('.topic-input')).map(input => input.value.trim()).filter(t => t);

    if (!id || !latlong || !mqttIp || !mqttPort || topics.length === 0) {
        alert("Semua field wajib diisi!");
        return;
    }

    const device = { id, latlong, mqttIp, mqttPort, topics, createdAt: new Date() };
    console.log("Device Registered:", device);

    cancelRegister();
}
