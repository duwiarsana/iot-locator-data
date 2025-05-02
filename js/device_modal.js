// Device List Modal Functions
function showDeviceListModal() {
    document.getElementById('deviceListModal').classList.remove('hidden');
    renderDeviceList();
}

function hideDeviceListModal() {
    document.getElementById('deviceListModal').classList.add('hidden');
}

function showDeviceRegisterFormFromList() {
    hideDeviceListModal();
    if (typeof showDeviceRegisterForm === 'function') {
        showDeviceRegisterForm(); // gunakan fungsi lama untuk form pendaftaran
    }
}

function renderDeviceList() {
    const container = document.getElementById('deviceListContainer');
    container.innerHTML = '<div class="text-gray-400 text-center">Loading...</div>';
    fetch('http://localhost:3001/devices')
        .then(res => res.json())
        .then(devices => {
            if (!Array.isArray(devices) || devices.length === 0) {
                container.innerHTML = '<div class="text-gray-500 text-center">No devices registered.</div>';
                return;
            }
            container.innerHTML = devices.map((d, i) => `
    <div class="border-b py-2 flex items-center justify-between">
        <div>
            <div class="font-semibold text-gray-800">${d.id || 'Device ' + (i+1)}</div>
            <div class="text-xs text-gray-500">${d.mqttIp || ''} : ${d.mqttPort || ''}</div>
${(typeof d.alamatLokasi === 'string' && d.alamatLokasi.trim()) ? `<div class='text-xs text-gray-600 mt-1'>📍 ${d.alamatLokasi}</div>` : ''}
        </div>
        <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm ml-2" onclick="editDevice('${d.id}')">Edit</button>
    </div>
`).join('');
        })
        .catch(err => {
            container.innerHTML = '<div class="text-red-500 text-center">Failed to load devices</div>';
            console.error(err);
        });
}
