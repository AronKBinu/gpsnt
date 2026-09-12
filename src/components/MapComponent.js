// MapComponent.js - handles Leaflet map interactions

class MapComponent {
    constructor(containerId) {
        // Initialize map centered at a default location (e.g., somewhere central)
        this.map = L.map(containerId, {
            zoomControl: false // We'll move it
        }).setView([20.5937, 78.9629], 5); // Default to India center for this example

        // Add Zoom control to bottom right
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        // Add Google Maps tiles (fits the Google Maps aesthetic perfectly and has global high-zoom coverage)
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            attribution: '&copy; Google Maps'
        }).addTo(this.map);

        this.userMarker = null;
        this.accuracyCircle = null;
        this.destMarker = null;
        this.routeLine = null;
    }

    updateUserLocation(lat, lon, accuracy) {
        const latlng = [lat, lon];
        
        if (!this.userMarker) {
            // Create user marker (blue dot)
            const userIcon = L.divIcon({
                className: 'custom-user-marker',
                html: '<div style="background-color: #007aff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
            });
            this.userMarker = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(this.map);
            this.accuracyCircle = L.circle(latlng, {
                radius: accuracy,
                color: '#007aff',
                fillColor: '#007aff',
                fillOpacity: 0.15,
                weight: 1
            }).addTo(this.map);
        } else {
            // Update existing
            this.userMarker.setLatLng(latlng);
            if (this.accuracyCircle) {
                this.accuracyCircle.setLatLng(latlng);
                this.accuracyCircle.setRadius(accuracy);
            }
        }
    }

    setCarMode(isCar) {
        if (!this.userMarker) return;
        
        this.isCarMode = isCar;
        
        // CSS Car pointing "up" by default (0 degrees)
        const carHtml = `
            <div class="css-car" style="
                width: 20px; height: 36px; background: #007aff; border-radius: 6px; position: relative; 
                box-shadow: 0 10px 20px rgba(0,0,0,0.6); 
                border: 1px solid #0056b3;
                transform-style: preserve-3d;
            ">
                <!-- Roof -->
                <div style="position: absolute; top: 25%; left: 10%; width: 80%; height: 40%; background: #1c1c1e; border-radius: 4px; box-shadow: inset 0 2px 5px rgba(255,255,255,0.2);"></div>
                <!-- Headlights -->
                <div style="position: absolute; top: 0; left: 15%; width: 20%; height: 4px; background: #fffae6; box-shadow: 0 -5px 15px #fffae6; border-radius: 2px;"></div>
                <div style="position: absolute; top: 0; right: 15%; width: 20%; height: 4px; background: #fffae6; box-shadow: 0 -5px 15px #fffae6; border-radius: 2px;"></div>
                <!-- Tail lights -->
                <div style="position: absolute; bottom: 0; left: 10%; width: 25%; height: 3px; background: #ff3b30; box-shadow: 0 2px 10px #ff3b30; border-radius: 2px;"></div>
                <div style="position: absolute; bottom: 0; right: 10%; width: 25%; height: 3px; background: #ff3b30; box-shadow: 0 2px 10px #ff3b30; border-radius: 2px;"></div>
            </div>
        `;
        
        const dotHtml = '<div style="background-color: #007aff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>';
            
        const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div id="marker-rotator" style="transition: transform 0.5s ease; transform: rotate(0deg); transform-origin: center center;">${isCar ? carHtml : dotHtml}</div>`,
            iconSize: isCar ? [20, 36] : [22, 22],
            iconAnchor: isCar ? [10, 18] : [11, 11]
        });
        
        this.userMarker.setIcon(userIcon);
        
        // Re-apply rotation if we have one
        if (this.lastHeading !== undefined) {
            this.updateUserHeading(this.lastHeading);
        }
    }

    updateUserHeading(bearing) {
        this.lastHeading = bearing;
        const rotator = document.getElementById('marker-rotator');
        if (rotator) {
            rotator.style.transform = `rotate(${bearing}deg)`;
        }
    }

    setDestination(lat, lon, name) {
        const latlng = [lat, lon];
        
        if (this.destMarker) {
            this.map.removeLayer(this.destMarker);
        }

        const destIcon = L.divIcon({
            className: 'custom-dest-marker',
            html: '<div style="color: #ff3b30; font-size: 32px; text-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fa-solid fa-location-dot"></i></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });

        this.destMarker = L.marker(latlng, { icon: destIcon }).addTo(this.map);
        if (name) {
            this.destMarker.bindPopup(`<b>${name}</b>`).openPopup();
        }
    }

    drawStraightRoute(startLat, startLon, endLat, endLon) {
        if (this.routeLineBg) this.map.removeLayer(this.routeLineBg);
        if (this.routeLine) this.map.removeLayer(this.routeLine);

        const latlngs = [
            [startLat, startLon],
            [endLat, endLon]
        ];

        this.routeLine = L.polyline(latlngs, {
            color: '#ff2d55', // Neon Pink/Red
            weight: 6,
            opacity: 0.9,
            dashArray: '15, 15',
            lineCap: 'round'
        }).addTo(this.map);
    }

    fitBoundsToRoute(userLat, userLon, destLat, destLon) {
        const bounds = L.latLngBounds(
            [userLat, userLon],
            [destLat, destLon]
        );
        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    centerOnUser(lat, lon) {
        this.map.setView([lat, lon], 16);
    }

    clearRouteAndDestination() {
        if (this.destMarker) {
            this.map.removeLayer(this.destMarker);
            this.destMarker = null;
        }
        if (this.routeLineBg) {
            this.map.removeLayer(this.routeLineBg);
            this.routeLineBg = null;
        }
        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
            this.routeLine = null;
        }
    }
}
