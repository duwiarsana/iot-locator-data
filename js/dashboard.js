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

// State untuk modal
let isRegisterModalOpen = false;

// Fungsi untuk menampilkan modal register
function showRegisterForm() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.remove('hidden');
        isRegisterModalOpen = true;
    }
}

// Fungsi untuk menutup modal register
function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.add('hidden');
        isRegisterModalOpen = false;
        // Reset form
        document.getElementById('register-form').reset();
    }
}

// Fungsi untuk menangani submit register
async function handleRegister(event) {
    event.preventDefault(); // Prevent form submission
    
    const nama = document.getElementById('register-nama').value;
    const nomor_hp = document.getElementById('register-nomor-hp').value;
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (!nama || !nomor_hp || !email || !username || !password) {
        alert('Semua field harus diisi!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nama, nomor_hp, email, username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registrasi berhasil! Silakan login.');
            closeRegisterModal();
        } else {
            alert(data.error || 'Registrasi gagal. Silakan coba lagi.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
}

// Add event listener to form
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

// Make login function global
window.login = async function() {
    try {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            throw new Error('Username dan password harus diisi!');
        }

        console.log('Attempting login with username:', username);
        
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store user data in localStorage
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userRole', data.role);
        
        // Close login modal
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
        
        // Show dashboard
        showDashboard();
        
        console.log('Login successful, user data stored:', {
            username: data.username,
            userId: data.userId,
            role: data.role
        });

    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
};

// Add event listener to login button
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', window.login);
}

// Fungsi hitung biaya PLN
function hitungBiaya(kwh) {
    const tarifPerKwh = 1444.7; // Tarif PLN per kWh
    return Math.round(kwh * tarifPerKwh);
}

// Initialize dashboard
window.initDashboard = function() {
    console.log('Initializing dashboard...');
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        console.log('DOM not ready, waiting for load...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded');
            
            try {
                // Check if we're already logged in
                const isLoggedIn = localStorage.getItem('username');
                if (isLoggedIn) {
                    console.log('User already logged in, showing dashboard');
                    showDashboard();
                }
            } catch (error) {
                console.error('Error in DOMContentLoaded:', error);
            }
        });
    } else {
        console.log('DOM already loaded');
        
        try {
            // Check if we're already logged in
            const isLoggedIn = localStorage.getItem('username');
            if (isLoggedIn) {
                console.log('User already logged in, showing dashboard');
                showDashboard();
            }
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }
};

// MQTT client configuration
const mqttConfig = {
    connectTimeout: 4000,
    reconnectPeriod: 4000,
    username: 'duwiarsana',
    password: 'Duwiarsana1234!?',
};

// Initialize MQTT client
const mqttClient = mqtt.connect('wss://1115a4b6fe5c40e588a3a85468f3c8be.s1.eu.hivemq.cloud:8884/mqtt', mqttConfig);

// MQTT event handlers
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
        sensorData.tegungan = payload;
        const el = document.getElementById('tegungan');
        if (el) el.innerText = payload;
        const popupEl = document.getElementById('tegunganPopup');
        if (popupEl) popupEl.innerText = payload;
    }
    if (topic === 'sensor/arus') {
        sensorData.arus = payload;
        const el = document.getElementById('arus');
        if (el) el.innerText = payload;
        const popupEl = document.getElementById('arusPopup');
        if (popupEl) popupEl.innerText = payload;
    }
    if (topic === 'sensor/daya') {
        sensorData.daya = payload;
        const el = document.getElementById('daya');
        if (el) el.innerText = payload;
        const popupEl = document.getElementById('dayaPopup');
        if (popupEl) popupEl.innerText = payload;
    }
    if (topic === 'sensor/kwh') {
        sensorData.kwh = payload;
        const el = document.getElementById('kwh');
        if (el) el.innerText = payload;
        const popupEl = document.getElementById('kwhPopup');
        if (popupEl) popupEl.innerText = payload;

        sensorData.biaya = hitungBiaya(parseFloat(payload));
        const biayaEl = document.getElementById('biaya');
        if (biayaEl) biayaEl.innerText = Number(sensorData.biaya).toLocaleString('id-ID');
        const popupBiayaEl = document.getElementById('biayaPopup');
        if (popupBiayaEl) popupBiayaEl.innerText = Number(sensorData.biaya).toLocaleString('id-ID');
    }
    if (topic === 'sensor/pf') {
        sensorData.pf = payload;
        const el = document.getElementById('pf');
        if (el) el.innerText = payload;
        const popupEl = document.getElementById('pfPopup');
        if (popupEl) popupEl.innerText = payload;
    }
});

mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err);
});

// Show dashboard
function showDashboard() {
    console.log('Showing dashboard...');
    
    const loginModal = document.getElementById('login-modal');
    const dashboard = document.getElementById('dashboard');
    const manageUsersLink = document.getElementById('manage-users-link');
    
    if (loginModal) loginModal.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    
    // Show manage users link only for admin users
    if (manageUsersLink) {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin') {
            manageUsersLink.classList.remove('hidden');
        }
    }

    // Initialize the map with a delay to ensure the container is fully visible
    setTimeout(() => {
        try {
            const map = initMap();
            if (map) {
                console.log('Map initialized successfully');
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }, 500); // Wait 500ms for the container to be fully visible
}

mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err);
});

// Map dan Marker
// Initialize map
function initMap() {
    try {
        console.log('Starting map initialization...');
        
        // Wait for the map container to be ready
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }
        
        // Ensure the container has proper dimensions
        mapContainer.style.width = '100%';
        mapContainer.style.height = '100vh';
        
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Map element not found');
            return;
        }
        
        // Ensure the map element has proper dimensions
        mapElement.style.width = '100%';
        mapElement.style.height = '100%';
        
        console.log('Map container found, dimensions:', mapContainer.offsetWidth, 'x', mapContainer.offsetHeight);

        // Remove any existing info-table to prevent duplicates
        const existingInfoTable = document.querySelector('.info-table');
        if (existingInfoTable) {
            existingInfoTable.remove();
        }

        // Initialize Leaflet map
        const map = L.map('map', {
            zoomControl: false,
            center: [-8.6773879009797, 115.22863462372545],
            zoom: 15
        });
        
        console.log('Leaflet map created');
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add marker
        const marker = L.marker([-8.6773879009797, 115.22863462372545]).addTo(map);
        
        // Force map to re-render
        map.invalidateSize();
        
        // Safe value for biaya
        let biayaDisplay = isNaN(Number(sensorData.biaya)) ? '-' : Number(sensorData.biaya).toLocaleString('id-ID');

        // --- Hapus info-table di kanan atas, hanya tampilkan data di popup marker ---
        // Create popup content
        const popupContent = `
            <div class="text-sm space-y-2">
                <table class="w-full text-left">
                    <tbody>
                        <tr>
                            <td class="pr-1 font-semibold">ID Device</td>
                            <td class="px-1 font-semibold">:</td>
                            <td><span id="idDevicePopup">${sensorData.id}</span></td>
                        </tr>
                        <tr>
                            <td class="pr-1 font-semibold">Tegangan</td>
                            <td class="px-1 font-semibold">:</td>
                            <td><span id="teganganPopup">${sensorData.tegangan}</span> V</td>
                        </tr>
                        <tr>
                            <td class="pr-1 font-semibold">Arus</td>
                            <td class="px-1 font-semibold">:</td>
                            <td><span id="arusPopup">${sensorData.arus}</span> A</td>
                        </tr>
                        <tr>
                            <td class="pr-1 font-semibold">Daya Listrik</td>
                            <td class="px-1 font-semibold">:</td>
                            <td><span id="dayaPopup">${sensorData.daya}</span> Watt</td>
                        </tr>
                        <tr>
                            <td class="pr-1 font-semibold">Kwh</td>
                            <td class="px-1 font-semibold">:</td>
                            <td><span id="kwhPopup">${sensorData.kwh}</span> kWh</td>
                        </tr>
                        <tr>
                            <td class="pr-1 font-semibold">Power Factor</td>
                            <td class="px-1 font-semibold">:</td>
                            <td><span id="pfPopup">${sensorData.pf}</span></td>
                        </tr>
                        <tr>
                            <td class="pr-1 font-semibold">Biaya</td>
                            <td class="px-1 font-semibold">:</td>
                            <td>Rp <span id="biayaPopup">${biayaDisplay}</span></td>
                        </tr>
                    </tbody>
                </table>
                <div class="pt-2 mt-2 border-t text-xs text-gray-600">
                    📍 Alamat : Jalan Tukad Yeh Aya 18x
                </div>
            </div>
        `;

        // Set popup content
        marker.bindPopup(popupContent);

        // Add click handler for popup
        marker.on('click', function() {
            marker.openPopup();
        });

        console.log('Map initialized successfully');
        
        return map;
    } catch (error) {
        console.error('Error initializing map:', error);
        throw error;
    }
}


// Add Device Form Handling
function showDeviceRegisterForm() {
    const area = document.getElementById('floatingArea');
    area.innerHTML = `
      <form id="device-register-form" class="bg-white p-4 rounded-md shadow-md flex flex-col gap-2 min-w-[220px]">
        <div class="font-bold mb-2">Register Device</div>
        <input type="text" id="deviceId" class="border rounded p-1" placeholder="Device ID" readonly />
        <input type="text" id="latlong" class="border rounded p-1" placeholder="Latitude,Longitude" />
        <input type="text" id="mqttIp" class="border rounded p-1" placeholder="MQTT IP" />
        <input type="text" id="mqttPort" class="border rounded p-1" placeholder="MQTT Port" />
        <div class="flex flex-col gap-1" id="topicsArea">
          <div class="flex gap-2">
            <input type="text" class="topic-input w-full border rounded-md p-2" placeholder="MQTT Topic" />
            <input type="text" class="keterangan-input w-full border rounded-md p-2" placeholder="Keterangan" />
            <button type="button" onclick="addTopic()" class="bg-green-500 text-white px-3 py-1 rounded">+</button>
          </div>
        </div>
        <div class="flex gap-2 mt-2">
          <button type="button" onclick="submitDevice()" class="bg-blue-500 text-white px-3 py-1 rounded">Register</button>
          <button type="button" onclick="cancelRegister()" class="bg-gray-300 px-3 py-1 rounded">Cancel</button>
        </div>
      </form>
    `;
    generateDeviceId();
}

function addTopic() {
    const topicsArea = document.getElementById('topicsArea');
    const div = document.createElement('div');
    div.className = "flex gap-2";
    div.innerHTML = `
      <input type="text" class="topic-input w-full border rounded-md p-2" placeholder="MQTT Topic" />
      <input type="text" class="keterangan-input w-full border rounded-md p-2" placeholder="Keterangan" />
      <button type="button" onclick="this.parentNode.remove()" class="bg-red-500 text-white px-3 py-1 rounded">-</button>
    `;
    topicsArea.appendChild(div);
}

function cancelRegister() {
    const area = document.getElementById('floatingArea');
    area.innerHTML = `
      <button id="addDeviceButton" onclick="showDeviceRegisterForm()" 
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
    // Ambil semua pasangan topic & keterangan
    const topicInputs = document.querySelectorAll('.topic-input');
    const ketInputs = document.querySelectorAll('.keterangan-input');
    const topics = Array.from(topicInputs).map((input, i) => {
        return {
            topic: input.value,
            keterangan: ketInputs[i]?.value || ''
        };
    }).filter(t => t.topic);

    if (!id || !mqttIp || !mqttPort || topics.length === 0) {
        alert('Isi semua field yang wajib dan minimal satu topic!');
        return;
    }

    // Kirim ke backend
    fetch('http://localhost:3001/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, latlong, mqttIp, mqttPort, topics })
    })
    .then(res => res.json())
    .then(data => {
        alert('Device registered!');
        cancelRegister();
    })
    .catch(err => {
        alert('Gagal register device');
        console.error(err);
    });
}

// --- END OF FILE ---
