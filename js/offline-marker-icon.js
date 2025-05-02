// Leaflet icon: Circle merah dengan X putih (offline > 1 menit)
L.Icon.OfflineMarker = L.Icon.extend({
    options: {
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAyNSAyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmMDAiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxsaW5lIHgxPSI4IiB5MT0iOCIgeDI9IjE2IiB5Mj0iMTYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxsaW5lIHgxPSIxNiIgeTE9IjgiIHgyPSI4IiB5Mj0iMTYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }
});
L.icon.offlineMarker = function() {
    return new L.Icon.OfflineMarker();
};
