// --- Custom DivIcon untuk status marker ---
window.getDelayDivIcon = function() {
    return L.divIcon({
        className: 'custom-delay-icon',
        html: `<div style="width:22px;height:22px;background:#f00;border-radius:50%;border:2px solid #fff;"></div>`,
        iconSize: [22,22],
        iconAnchor: [11,11]
    });
};
window.getOfflineDivIcon = function() {
    return L.divIcon({
        className: 'custom-offline-icon',
        html: `<div style="width:22px;height:22px;background:#f00;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:16px;">×</div>`,
        iconSize: [22,22],
        iconAnchor: [11,11]
    });
};
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

// Store previous valid values
const previousValues = {};

mqttClient.on('message', (topic, message) => {
    const payload = message.toString();
    // Cari deviceId yang punya topik ini
    const deviceId = window.deviceTopicMap && window.deviceTopicMap[topic];
    if (deviceId && window.deviceMarkers && window.deviceMarkers[deviceId]) {
        const { marker, device } = window.deviceMarkers[deviceId];
        // Update lastUpdate setiap ada data masuk
        device.lastUpdate = Date.now();
        
        // Initialize previousValues for this device if not exists
        if (!previousValues[deviceId]) {
            previousValues[deviceId] = {
                tegangan: "-",
                arus: "-",
                daya: "-",
                kwh: "-",
                pf: "-",
                biaya: "-"
            };
        }
        
        // Update liveData sesuai jenis topik, handle NaN values
        if (/tegangan/i.test(topic)) {
            const value = parseFloat(payload);
            device.liveData.tegangan = isNaN(value) ? previousValues[deviceId].tegangan : payload;
            previousValues[deviceId].tegangan = device.liveData.tegangan;
        }
        if (/arus/i.test(topic)) {
            const value = parseFloat(payload);
            device.liveData.arus = isNaN(value) ? previousValues[deviceId].arus : payload;
            previousValues[deviceId].arus = device.liveData.arus;
        }
        if (/daya/i.test(topic)) {
            const value = parseFloat(payload);
            device.liveData.daya = isNaN(value) ? previousValues[deviceId].daya : payload;
            previousValues[deviceId].daya = device.liveData.daya;
        }
        if (/kwh/i.test(topic)) {
            const value = parseFloat(payload);
            if (!isNaN(value)) {
                device.liveData.kwh = payload;
                device.liveData.biaya = hitungBiaya(value);
                previousValues[deviceId].kwh = device.liveData.kwh;
                previousValues[deviceId].biaya = device.liveData.biaya;
            } else {
                device.liveData.kwh = previousValues[deviceId].kwh;
                device.liveData.biaya = previousValues[deviceId].biaya;
            }
        }
        if (/pf/i.test(topic)) {
            const value = parseFloat(payload);
            device.liveData.pf = isNaN(value) ? previousValues[deviceId].pf : payload;
            previousValues[deviceId].pf = device.liveData.pf;
        }
        
        // Jika popup terbuka, update popup
        if (marker.isPopupOpen && marker.isPopupOpen()) {
            marker.setPopupContent(window.renderDevicePopup(device));
        }
    }
});

// --- Cek status data masuk setiap 5 detik, ubah marker jadi merah jika tidak ada data ---
if (!window.statusIntervalSet) {
    window.statusIntervalSet = true;
    setInterval(() => {
        const now = Date.now();
        const THRESHOLD_RED = 10000; // 10 detik
        const THRESHOLD_OFFLINE = 60000; // 1 menit
        Object.values(window.deviceMarkers || {}).forEach(({ marker, device }) => {
            if (!device.lastUpdate || now - device.lastUpdate > THRESHOLD_OFFLINE) {
                // Lebih dari 1 menit: icon offline bulat X
                if (marker.setIcon && window.getOfflineDivIcon) {
                    marker.setIcon(window.getOfflineDivIcon());
                }
            } else if (now - device.lastUpdate > THRESHOLD_RED) {
                // Lebih dari 10 detik tapi kurang dari 1 menit: icon bulat merah polos
                if (marker.setIcon && window.getDelayDivIcon) {
                    marker.setIcon(window.getDelayDivIcon());
                }
            } else {
                // Data masuk normal: icon default
                if (marker.setIcon && window.L && window.L.Icon && window.L.Icon.Default) {
                    marker.setIcon(new window.L.Icon.Default());
                }
            }
        });
    }, 5000);
}

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
            attribution: ' OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Tidak ada marker dummy, semua marker diambil dari data backend
        // Force map to re-render
        map.invalidateSize();
        
        // --- Tambah marker untuk semua device terdaftar dan siapkan mapping live MQTT ---
        window.deviceMarkers = {};
        window.deviceTopicMap = {};
        fetch('http://localhost:3001/devices')
            .then(res => res.json())
            .then(devices => {
                if (Array.isArray(devices)) {
                    devices.forEach(device => {
                        if (device.latlong && device.latlong.includes(',')) {
                            const [lat, lng] = device.latlong.split(',').map(Number);
                            if (!isNaN(lat) && !isNaN(lng)) {
                                // Inisialisasi data live
                                device.liveData = {
                                    tegangan: '-', arus: '-', daya: '-', kwh: '-', pf: '-', biaya: '-'
                                };
                                const devMarker = L.marker([lat, lng], {
                                    title: device.id
                                }).addTo(map);
                                devMarker.bindPopup(renderDevicePopup(device));
                                devMarker.bindTooltip(device.id, {
                                    permanent: true,
                                    direction: 'top',
                                    offset: [0, -10],
                                    className: 'device-id-tooltip'
                                });
                                // Tambahkan lastUpdate untuk status data
                                const now = Date.now();
                                device.lastUpdate = now;
                                window.deviceMarkers[device.id] = { marker: devMarker, device };
                                // Mappingkan semua topik milik device
                                if (Array.isArray(device.topics)) {
                                    device.topics.forEach(t => {
                                        if (t.topic) {
                                            window.deviceTopicMap[t.topic] = device.id;
                                        }
                                    });
                                }
                                // Update popup saat dibuka
                                devMarker.on('popupopen', function() {
                                    devMarker.setPopupContent(renderDevicePopup(device));
                                });
                            }
                        }
                    });
                }
            })
            .catch(err => {
                console.error('Gagal mengambil daftar device:', err);
            });

        // Fungsi render popup device
        function renderDevicePopup(device) {
            // Helper untuk ambil satuan dari topics
            function getUnit(label) {
                if (!device.topics) return '';
                // Cari topic dengan keterangan yang cocok (case-insensitive)
                const found = device.topics.find(t => t.keterangan && t.keterangan.toLowerCase().includes(label.toLowerCase()));
                return found && found.unit ? found.unit : '';
            }
            return `
                <div class="text-sm space-y-2">
                    <table class="w-full text-left">
                        <tbody>
                            <tr>
                                <td class="pr-1 font-semibold">ID Device</td>
                                <td class="px-1 font-semibold">:</td>
                                <td>${device.id || '-'}</td>
                            </tr>
                            <tr>
                                <td class="pr-1 font-semibold">Tegangan</td>
                                <td class="px-1 font-semibold">:</td>
                                <td>${device.liveData?.tegangan || '-'}${getUnit('tegangan') ? ' ' + getUnit('tegangan') : ''}</td>
                            </tr>
                            <tr>
                                <td class="pr-1 font-semibold">Arus</td>
                                <td class="px-1 font-semibold">:</td>
                                <td>${device.liveData?.arus || '-'}${getUnit('arus') ? ' ' + getUnit('arus') : ''}</td>
                            </tr>
                            <tr>
                                <td class="pr-1 font-semibold">Daya Listrik</td>
                                <td class="px-1 font-semibold">:</td>
                                <td>${device.liveData?.daya || '-'}${getUnit('daya') ? ' ' + getUnit('daya') : ''}</td>
                            </tr>
                            <tr>
                                <td class="pr-1 font-semibold">Kwh</td>
                                <td class="px-1 font-semibold">:</td>
                                <td>${device.liveData?.kwh || '-'}${getUnit('kwh') ? ' ' + getUnit('kwh') : ''}</td>
                            </tr>
                            <tr>
                                <td class="pr-1 font-semibold">Power Factor</td>
                                <td class="px-1 font-semibold">:</td>
                                <td>${device.liveData?.pf || '-'}${getUnit('pf') ? ' ' + getUnit('pf') : ''}</td>
                            </tr>
                            <tr>
                                <td class="pr-1 font-semibold">Biaya</td>
                                <td class="px-1 font-semibold">:</td>
                                <td>Rp ${device.liveData?.biaya !== '-' ? Number(device.liveData.biaya).toLocaleString('id-ID') : '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="pt-2 mt-2 border-t text-xs text-gray-600">
                        📍 Alamat : ${device.alamatLokasi || '-'}
                    </div>
                </div>
            `;
        }
        window.renderDevicePopup = renderDevicePopup;

        console.log('Map initialized successfully');
        
        return map;
    } catch (error) {
        console.error('Error initializing map:', error);
        throw error;
    }
}


// Submit Edit Device
window.submitEditDevice = function(id) {
    const latlong = document.getElementById('latlong')?.value || '';
    const mqttIp = document.getElementById('mqttIp')?.value || '';
    const mqttPort = document.getElementById('mqttPort')?.value || '';
    const mqttUsername = document.getElementById('mqttUsername')?.value || '';
    const mqttPassword = document.getElementById('mqttPassword')?.value || '';
    // Ambil semua pasangan topic & keterangan
    const topicInputs = document.querySelectorAll('.topic-input');
    const ketInputs = document.querySelectorAll('.keterangan-input');
    const unitInputs = document.querySelectorAll('.unit-input');
    const topics = Array.from(topicInputs).map((input, i) => {
        return {
            topic: input.value,
            keterangan: ketInputs[i]?.value || '',
            unit: unitInputs[i]?.value || ''
        };
    }).filter(t => t.topic);

    if (!mqttIp || !mqttPort || topics.length === 0) {
        alert('Isi semua field yang wajib dan minimal satu topic!');
        return;
    }

    const alamatLokasiInput = document.getElementById('alamatLokasi');
    let alamatLokasi = alamatLokasiInput && alamatLokasiInput.value ? alamatLokasiInput.value : '';
    if (alamatLokasi === '[object Object]') alamatLokasi = '';
    console.log('Alamat yang akan dikirim:', alamatLokasi);
    fetch(`http://localhost:3001/devices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latlong, alamatLokasi, mqttIp, mqttPort, mqttUsername, mqttPassword, topics })
    })
    .then(res => res.json())
    .then(data => {
        alert('Device updated!');
        cancelRegister();
    })
    .catch(err => {
        alert('Gagal update device');
        console.error(err);
    });
}

// Edit Device
window.editDevice = function(id) {
    fetch(`http://localhost:3001/devices/${id}`)
        .then(res => res.json())
        .then(device => {
            const area = document.getElementById('floatingArea');
            area.innerHTML = `
              <form id="device-edit-form" class="bg-white p-4 rounded-md shadow-md flex flex-col gap-2 min-w-[220px]">
                <div class="font-bold mb-2">Edit Device</div>
                <input type="text" id="deviceId" class="border rounded p-1" placeholder="Device ID" value="${device.id}" readonly />
                <input type="text" id="latlong" class="border rounded p-1" placeholder="Latitude,Longitude" value="${device.latlong||''}" />
<input type="text" id="alamatLokasi" class="border rounded p-1" placeholder="Alamat Lokasi" value="${typeof device.alamatLokasi === 'string' ? device.alamatLokasi : ''}" />
                <input type="text" id="mqttIp" class="border rounded p-1" placeholder="MQTT IP" value="${device.mqttIp||''}" />
                <input type="text" id="mqttPort" class="border rounded p-1" placeholder="MQTT Port" value="${device.mqttPort||''}" />
                <input type="text" id="mqttUsername" class="border rounded p-1" placeholder="MQTT Username (optional)" value="${device.mqttUsername||''}" />
                <input type="password" id="mqttPassword" class="border rounded p-1" placeholder="MQTT Password (optional)" value="${device.mqttPassword||''}" />
                <div class="flex flex-col gap-1" id="topicsArea">
                  ${(device.topics||[]).map((t,i) => `
                    <div class='flex gap-2'>
                      <input type='text' class='topic-input w-full border rounded-md p-2' placeholder='MQTT Topic' value='${t.topic||''}' />
<input type='text' class='keterangan-input w-full border rounded-md p-2' placeholder='Keterangan' value='${t.keterangan||''}' />
<input type='text' class='unit-input w-16 border rounded-md p-2' placeholder='Satuan' value='${t.unit||''}' />
                      <button type='button' onclick='this.parentNode.remove()' class='bg-red-500 text-white px-3 py-1 rounded'>-</button>
                    </div>
                  `).join('')}
                  <div class='flex gap-2'>
                    <button type='button' onclick='addTopicRow()' class='bg-green-500 text-white px-3 py-1 rounded'>+ Topik</button>
                  </div>
                </div>
                <div class="flex gap-2 mt-2">
                  <button type="button" onclick="submitEditDevice('${device.id}')" class="bg-blue-500 text-white px-3 py-1 rounded">Update</button>
                  <button type="button" onclick="cancelRegister()" class="bg-gray-300 px-3 py-1 rounded">Cancel</button>
                </div>
              </form>
            `;
        })
        .catch(err => {
            alert('Gagal mengambil data device');
            console.error(err);
        });
}

// Add Device Form Handling
function showDeviceRegisterForm() {
    const area = document.getElementById('floatingArea');
    area.innerHTML = `
      <form id="device-register-form" class="bg-white p-4 rounded-md shadow-md flex flex-col gap-2 min-w-[220px]">
        <div class="font-bold mb-2">Register Device</div>
        <input type="text" id="deviceId" class="border rounded p-1" placeholder="Device ID" readonly />
        <input type="text" id="latlong" class="border rounded p-1" placeholder="Latitude,Longitude" />
<input type="text" id="alamatLokasi" class="border rounded p-1" placeholder="Alamat Lokasi" />
        <input type="text" id="mqttIp" class="border rounded p-1" placeholder="MQTT IP" />
        <input type="text" id="mqttPort" class="border rounded p-1" placeholder="MQTT Port" />
        <input type="text" id="mqttUsername" class="border rounded p-1" placeholder="MQTT Username (optional)" />
        <input type="password" id="mqttPassword" class="border rounded p-1" placeholder="MQTT Password (optional)" />
        <div class="flex flex-col gap-1" id="topicsArea">
          <div class="flex gap-2">
            <input type="text" class="topic-input w-full border rounded-md p-2" placeholder="MQTT Topic" />
            <input type="text" class="keterangan-input w-full border rounded-md p-2" placeholder="Keterangan" />
            <input type="text" class="unit-input w-16 border rounded-md p-2" placeholder="Satuan" />
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

window.addTopicRow = function() {
    const topicsArea = document.getElementById('topicsArea');
    const div = document.createElement('div');
    div.className = "flex gap-2";
div.innerHTML = `
  <input type="text" class="topic-input w-full border rounded-md p-2" placeholder="MQTT Topic" />
  <input type="text" class="keterangan-input w-full border rounded-md p-2" placeholder="Keterangan" />
  <input type="text" class="unit-input w-16 border rounded-md p-2" placeholder="Satuan" />
  <button type="button" onclick="this.parentNode.remove()" class="bg-red-500 text-white px-3 py-1 rounded">-</button>
`;
    topicsArea.appendChild(div);
}

function cancelRegister() {
    const area = document.getElementById('floatingArea');
    area.innerHTML = `
      <button id="manageDeviceButton" onclick="showDeviceListModal()" 
              class="flex items-center justify-center gap-2 min-w-[140px] md:min-w-[160px] px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium text-base rounded-md transform hover:scale-105 transition-transform duration-200 shadow">
        Manage Device
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
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

function showAccount() {
    const modal = document.getElementById('account-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Get user data from localStorage
        const username = localStorage.getItem('username') || 'N/A';
        const role = localStorage.getItem('userRole') || 'N/A';
        
        // Try to get email from userData if exists
        let email = 'N/A';
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            email = userData.email || 'N/A';
        } catch (error) {
            console.error('Error parsing userData:', error);
        }
        
        // Populate the modal with user data
        document.getElementById('username').value = username;
        document.getElementById('email').value = email;
        document.getElementById('role').value = role;
    }
}

function saveAccount() {
    // Get updated values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Basic validation
    if (!username || !email) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update localStorage with new values
    localStorage.setItem('username', username);
    
    // Update userData object
    let userData = JSON.parse(localStorage.getItem('userData') || '{}');
    userData.email = email;
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update the display
    showAccount();
    
    // Close modal
    document.getElementById('account-modal').classList.add('hidden');
    
    // Show success message
    alert('Account information updated successfully!');
}

function changePassword() {
    // Get password values
    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields');
        return;
    }
    

    
    // Password confirmation validation
    if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match');
        return;
    }
    
    // Get user ID from localStorage
    const userId = localStorage.getItem('userId');
    
    // Make API call to change password
    fetch('http://localhost:3001/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Password change failed');
        }
        return response.json();
    })
    .then(data => {
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        // Show success message
        alert('Password changed successfully!');
    })
    .catch(error => {
        alert('Error changing password: ' + error.message);
    });
}

function isValidPassword(password) {
    // Password must be at least 8 characters long
    if (password.length < 8) return false;
    
    // Password must contain at least one letter
    if (!/[a-zA-Z]/.test(password)) return false;
    
    // Password must contain at least one number
    if (!/[0-9]/.test(password)) return false;
    
    // Password must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    
    return true;
}

function addTopic() {
    const topicsArea = document.getElementById('topicsArea');
    // Ambil semua input terakhir
    const lastTopic = topicsArea.querySelector('.topic-input:last-of-type');
    const lastKet = topicsArea.querySelector('.keterangan-input:last-of-type');
    const lastUnit = topicsArea.querySelector('.unit-input:last-of-type');

    // Jika sudah ada baris, cek validasi sebelum tambah baru
    if (lastTopic && lastKet && lastUnit) {
        if (!lastTopic.value.trim() || !lastKet.value.trim() || !lastUnit.value.trim()) {
            alert('Isi semua kolom (MQTT Topic, Keterangan, dan Satuan) sebelum menambah baris baru!');
            return;
        }
    }

    // Buat baris baru
    const div = document.createElement('div');
    div.className = "flex gap-2 mb-2";
    div.innerHTML = `
      <input type="text" class="topic-input w-full border rounded-md p-2" placeholder="MQTT Topic">
      <input type="text" class="keterangan-input w-full border rounded-md p-2" placeholder="Keterangan">
      <input type="text" class="unit-input w-16 border rounded-md p-2" placeholder="Satuan">
      <button type="button" onclick="this.parentNode.remove()" class="bg-red-500 text-white px-3 py-1 rounded">-</button>
    `;
    topicsArea.appendChild(div);
}

function submitDevice() {
    const id = document.getElementById('deviceId')?.value || '';
    const latlong = document.getElementById('latlong')?.value || '';
    const mqttIp = document.getElementById('mqttIp')?.value || '';
    const mqttPort = document.getElementById('mqttPort')?.value || '';
    const mqttUsername = document.getElementById('mqttUsername')?.value || '';
    const mqttPassword = document.getElementById('mqttPassword')?.value || '';
    // Ambil semua pasangan topic & keterangan
    const topicInputs = document.querySelectorAll('.topic-input');
    const ketInputs = document.querySelectorAll('.keterangan-input');
    const unitInputs = document.querySelectorAll('.unit-input');
    const topics = Array.from(topicInputs).map((input, i) => {
        return {
            topic: input.value,
            keterangan: ketInputs[i]?.value || '',
            unit: unitInputs[i]?.value || ''
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
        body: JSON.stringify({ id, latlong, alamatLokasi, mqttIp, mqttPort, mqttUsername, mqttPassword, topics })
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
