// Red marker icon for Leaflet
// Usage: new L.Icon.RedMarker()
// Red marker icon for Leaflet (base64 SVG, always available)
L.Icon.RedMarker = L.Icon.extend({
    options: {
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9IjAgMCAyNSAyNSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjI1IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTI1LjQ3MiAxMi41NjNjMC0yLjQ4My0yLjE4Ni00LjQ3Mi00LjQ3Mi00LjQ3MmMwLTIuNDgzIDIuMTg2LTQuNDcyIDQuNDcyLTQuNDcyYzIuNDgzIDAgNC40NzIgMi4xODYgNC40NzIgNC40NzJ6IiBmaWxsPSIjZjAwIi8+PC9zdmc+',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }
});
L.icon.redMarker = function() {
    return new L.Icon.RedMarker();
};
