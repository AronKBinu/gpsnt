
class App {
    constructor() {
        this.mapComponent = null;
        this.userLocation = null;
        this.destination = null;
        this.isNavigating = false;
        this.watchId = null;
        this.isDemoMode = false;
        this.demoUserPos = { lat: 18.5204, lon: 73.8567 }; // e.g., Pune

        this.funnyMessages = [
            "Keep going straight.",
            "Still straight.",
            "Yes, still straight.",
            "Road detected. Ignore it.",
            "Turn? No.",
            "You could use the road, but that would defeat the purpose.",
            "Obstacle ahead. We recommend going through it.",
            "Common sense is not part of this navigation system."
        ];

        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        this.els = {
            landingOverlay: document.getElementById('landing-overlay'),
            startBtn: document.getElementById('start-btn'),
            demoBtn: document.getElementById('demo-btn'),
            mainHeader: document.getElementById('main-header'),
            themeToggle: document.getElementById('theme-toggle'),
            searchInput: document.getElementById('destination-input'),
            clearSearchBtn: document.getElementById('clear-search-btn'),
            searchResults: document.getElementById('search-results'),
            useLocationBtn: document.getElementById('use-location-btn'),
            infoPanel: document.getElementById('info-panel'),
            recalculateBtn: document.getElementById('recalculate-btn'),
            resetRouteBtn: document.getElementById('reset-route-btn'),
            summaryModal: document.getElementById('summary-modal'),
            closeSummaryBtn: document.getElementById('close-summary-btn'),
            demoIndicator: document.getElementById('demo-indicator'),
            
            infoDestName: document.getElementById('info-destination-name'),
            infoDistance: document.getElementById('info-distance'),
            infoDirection: document.getElementById('info-direction'),
            infoTime: document.getElementById('info-time'),
            
            summaryDistance: document.getElementById('summary-distance'),
            summaryDir: document.getElementById('summary-dir'),
            
            topNavBanner: document.getElementById('top-nav-banner'),
            bottomNavBar: document.getElementById('bottom-nav-bar'),
            navDirectionText: document.getElementById('nav-direction-text'),
            navTime: document.getElementById('nav-time'),
            navDist: document.getElementById('nav-dist'),
            navEta: document.getElementById('nav-eta'),
            navCloseBtn: document.getElementById('nav-close-btn'),
            navRecentreBtn: document.getElementById('nav-recentre-btn')
        };
    }

    bindEvents() {
        this.els.startBtn.addEventListener('click', () => this.startApp(false));
        this.els.demoBtn.addEventListener('click', () => this.startApp(true));
        
        this.els.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            this.els.themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        });

        // Search logic
        let searchTimeout;
        this.els.searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            toggleElement('clear-search-btn', query.length > 0);
            
            clearTimeout(searchTimeout);
            if (query.length < 3) {
                toggleElement('search-results', false);
                return;
            }
            
            searchTimeout = setTimeout(() => this.handleSearch(query), 500);
        });

        this.els.clearSearchBtn.addEventListener('click', () => {
            this.els.searchInput.value = '';
            toggleElement('clear-search-btn', false);
            toggleElement('search-results', false);
        });

        this.els.useLocationBtn.addEventListener('click', () => this.getUserLocationAndCenter());

        this.els.recalculateBtn.addEventListener('click', () => this.recalculateRoute());
        this.els.resetRouteBtn.addEventListener('click', () => this.endNavigation());
        this.is3D = false;
        this.currentPitch = 60;
        this.currentRotation = 0;
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;
        this.currentTranslateZ = 0;
        this.isDragging3D = false;
        this.lastX = 0;
        this.lastY = 0;
        
        const mapContainer = document.getElementById('map-container');

        this.els.navRecentreBtn.addEventListener('click', () => {
            this.is3D = !this.is3D;
            
            if (this.is3D) {
                this.els.navRecentreBtn.style.backgroundColor = 'rgba(52, 199, 89, 0.2)';
                this.mapComponent.setCarMode(true);
                showNavMessage("3D Camera unlocked. Right-Click to rotate. Shift+Right-Click to pan X/Y. Alt+Right-Click to move Z axis!", 5000);
                
                // Apply 3D transform
                this.updateTransform();
                document.querySelector('.leaflet-control-container').style.opacity = '0';
            } else {
                this.els.navRecentreBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                this.mapComponent.setCarMode(false);
                
                // Reset Camera
                this.currentPitch = 60;
                this.currentRotation = 0;
                this.currentTranslateX = 0;
                this.currentTranslateY = 0;
                this.currentTranslateZ = 0;
                
                // Remove 3D transform
                mapContainer.style.transform = '';
                document.querySelector('.leaflet-control-container').style.opacity = '1';
            }
            
            if (this.userLocation) {
                this.mapComponent.centerOnUser(this.userLocation.lat, this.userLocation.lon);
            }
        });

        this.updateTransform = () => {
            mapContainer.style.transform = `perspective(1000px) translate3d(${this.currentTranslateX}px, ${this.currentTranslateY}px, ${this.currentTranslateZ}px) rotateX(${this.currentPitch}deg) rotateZ(${this.currentRotation}deg) scale(1.6)`;
        };
        
        // 3D Dragging Logic
        mapContainer.addEventListener('contextmenu', e => e.preventDefault());

        mapContainer.addEventListener('mousedown', (e) => {
            if (this.is3D && (e.button === 2 || e.button === 1 || e.ctrlKey)) {
                this.isDragging3D = true;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                mapContainer.style.transition = 'none';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging3D || !this.is3D) return;
            
            const deltaX = e.clientX - this.lastX;
            const deltaY = e.clientY - this.lastY;
            
            if (e.shiftKey) {
                // X and Y axis movement
                this.currentTranslateX += deltaX;
                this.currentTranslateY += deltaY;
            } else if (e.altKey) {
                // Z axis movement
                this.currentTranslateZ -= deltaY * 2;
            } else {
                // Rotation
                this.currentRotation += deltaX * 0.5;
                this.currentPitch -= deltaY * 0.5;
                
                if (this.currentPitch > 85) this.currentPitch = 85;
                if (this.currentPitch < 0) this.currentPitch = 0;
            }
            
            this.updateTransform();
            
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging3D) {
                this.isDragging3D = false;
                mapContainer.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });

        // Touch support for 3D dragging (two fingers)
        mapContainer.addEventListener('touchstart', (e) => {
            if (this.is3D && e.touches.length === 2) {
                this.isDragging3D = true;
                mapContainer.style.transition = 'none';
                this.lastX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                this.lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            }
        }, {passive: false});

        // Hide UI on map click
        let uiVisible = true;
        mapContainer.addEventListener('click', (e) => {
            // Don't toggle if we are dragging, panning, or clicking a leaflet control
            if (e.target.closest('.leaflet-control') || this.isDragging3D) return;
            
            if (this.isNavigating) {
                uiVisible = !uiVisible;
                const topBanner = document.getElementById('top-nav-banner');
                const bottomBar = document.getElementById('bottom-nav-bar');
                
                if (uiVisible) {
                    topBanner.classList.remove('ui-hidden');
                    bottomBar.classList.remove('ui-hidden');
                } else {
                    topBanner.classList.add('ui-hidden');
                    bottomBar.classList.add('ui-hidden');
                }
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging3D && this.is3D && e.touches.length === 2) {
                e.preventDefault();
                const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                
                const deltaX = currentX - this.lastX;
                const deltaY = currentY - this.lastY;
                
                this.currentRotation += deltaX * 0.8;
                this.currentPitch -= deltaY * 0.8;
                
                if (this.currentPitch > 85) this.currentPitch = 85;
                if (this.currentPitch < 0) this.currentPitch = 0;
                
                this.updateTransform();
                
                this.lastX = currentX;
                this.lastY = currentY;
            }
        }, {passive: false});

        window.addEventListener('touchend', (e) => {
            if (this.isDragging3D && e.touches.length < 2) {
                this.isDragging3D = false;
                mapContainer.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });
        
        this.els.closeSummaryBtn.addEventListener('click', () => {
            toggleElement('summary-modal', false);
            this.startNavigationLoop();
        });
    }

    async startApp(demoMode) {
        this.isDemoMode = demoMode;
        toggleElement('landing-overlay', false);
        toggleElement('main-header', true);
        
        if (this.isDemoMode) {
            toggleElement('demo-indicator', true);
        }

        // Initialize Map
        this.mapComponent = new MapComponent('map-container');
        
        if (this.isDemoMode) {
            this.userLocation = { ...this.demoUserPos, accuracy: 10 };
            this.mapComponent.updateUserLocation(this.userLocation.lat, this.userLocation.lon, this.userLocation.accuracy);
            this.mapComponent.centerOnUser(this.userLocation.lat, this.userLocation.lon);
            showToast("Demo mode started. Using sample location.");
        } else {
            await this.getUserLocationAndCenter();
        }
    }

    async getUserLocationAndCenter() {
        if (this.isDemoMode) {
            this.mapComponent.centerOnUser(this.demoUserPos.lat, this.demoUserPos.lon);
            return;
        }

        try {
            const pos = await GeolocationService.getCurrentPosition();
            this.userLocation = pos;
            this.mapComponent.updateUserLocation(pos.lat, pos.lon, pos.accuracy);
            this.mapComponent.centerOnUser(pos.lat, pos.lon);
            showToast("Location updated.");
        } catch (error) {
            showToast("We couldn't access your location.");
            console.error(error);
        }
    }

    async handleSearch(query) {
        try {
            const results = await GeocodingService.search(query);
            this.els.searchResults.innerHTML = '';
            
            if (results.length === 0) {
                const li = document.createElement('li');
                li.textContent = "Destination not found. Even GPSn't can't find that.";
                this.els.searchResults.appendChild(li);
            } else {
                results.forEach(result => {
                    const li = document.createElement('li');
                    
                    const icon = document.createElement('i');
                    icon.className = 'fa-solid fa-location-dot search-result-icon';
                    icon.style.color = '#8e8e93';
                    icon.style.marginRight = '12px';
                    icon.style.fontSize = '18px';
                    
                    const textSpan = document.createElement('span');
                    textSpan.textContent = result.fullName;
                    
                    li.appendChild(icon);
                    li.appendChild(textSpan);
                    
                    li.style.display = 'flex';
                    li.style.alignItems = 'center';
                    li.style.padding = '12px 16px';
                    li.style.cursor = 'pointer';
                    li.style.borderBottom = '1px solid #2c2c2e';
                    
                    li.addEventListener('click', () => this.selectDestination(result));
                    this.els.searchResults.appendChild(li);
                });
            }
            toggleElement('search-results', true);
        } catch (error) {
            showToast("Error searching location.");
        }
    }

    selectDestination(result) {
        this.els.searchInput.value = result.name;
        toggleElement('search-results', false);
        
        if (!this.userLocation) {
            showToast("Please allow location access first.");
            this.getUserLocationAndCenter().then(() => {
                if(this.userLocation) this.setupRoute(result);
            });
            return;
        }

        this.setupRoute(result);
    }

    setupRoute(destination) {
        this.destination = destination;
        this.isNavigating = true;

        this.els.infoDestName.textContent = destination.name;
        
        this.mapComponent.setDestination(destination.lat, destination.lon, destination.fullName);
        this.recalculateRoute(true);
        
        toggleElement('main-header', false); // Hide search always during nav for maps feel
    }

    recalculateRoute(initial = false) {
        if (!this.userLocation || !this.destination) return;

        const dist = calculateDistance(
            this.userLocation.lat, this.userLocation.lon,
            this.destination.lat, this.destination.lon
        );
        const bearing = calculateBearing(
            this.userLocation.lat, this.userLocation.lon,
            this.destination.lat, this.destination.lon
        );
        const dir = getCompassDirection(bearing);
        const time = estimateTime(dist);
        
        this.mapComponent.updateUserHeading(bearing);

        const distStr = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
        
        // Calculate ETA
        const now = new Date();
        now.setMinutes(now.getMinutes() + time);
        const eta = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Update old info panel
        this.els.infoDistance.textContent = distStr;
        this.els.infoDirection.textContent = dir;
        this.els.infoTime.textContent = time >= 60 ? `${Math.floor(time/60)} hr ${time%60} min` : `${time} min`;

        const secondaryInstructions = [
            "Then drive straight through a living room",
            "Then break all laws of physics",
            "Then proceed directly over the mountain",
            "Then ignore the 'Do Not Enter' sign",
            "Then prepare for a sudden drop",
            "Then scale the fence ahead",
            "Then deploy wings",
            "Then swim across the lake"
        ];
        const randomInstruction = secondaryInstructions[Math.floor(Math.random() * secondaryInstructions.length)];

        // Update new nav UI
        document.getElementById('nav-direction-text').textContent = `Head ${dir.split(' ')[1] || 'Straight'}`;
        document.getElementById('nav-secondary-text').textContent = randomInstruction;
        
        document.getElementById('nav-time').textContent = time >= 60 ? `${Math.floor(time/60)} hr ${time%60} min` : `${time} min`;
        document.getElementById('nav-dist').textContent = distStr;
        document.getElementById('nav-eta').textContent = eta;

        this.mapComponent.drawStraightRoute(
            this.userLocation.lat, this.userLocation.lon,
            this.destination.lat, this.destination.lon
        );

        if (initial) {
            this.mapComponent.fitBoundsToRoute(
                this.userLocation.lat, this.userLocation.lon,
                this.destination.lat, this.destination.lon
            );

            // Show summary modal
            this.els.summaryDistance.textContent = distStr;
            this.els.summaryDir.textContent = dir;
            toggleElement('summary-modal', true);
        } else {
            // Recalculating mid-drive
        }
    }

    startNavigationLoop() {
        toggleElement('top-nav-banner', true);
        toggleElement('bottom-nav-bar', true);
        toggleElement('info-panel', false); // Hide the old panel

        showNavMessage("Navigation started. Go straight.", 5000);
        
        if (!this.isDemoMode) {
            this.watchId = GeolocationService.watchPosition(
                (pos) => {
                    this.userLocation = pos;
                    this.mapComponent.updateUserLocation(pos.lat, pos.lon, pos.accuracy);
                    
                    this.mapComponent.drawStraightRoute(
                        pos.lat, pos.lon,
                        this.destination.lat, this.destination.lon
                    );
                    
                    this.recalculateRoute(); // update stats live
                    
                    if (Math.random() < 0.1) {
                        const msg = this.funnyMessages[Math.floor(Math.random() * this.funnyMessages.length)];
                        showNavMessage(msg);
                    }
                },
                (error) => {
                    console.error("Live tracking error:", error);
                }
            );
        } else {
            // Demo mode fake movement
            this.demoInterval = setInterval(() => {
                if(Math.random() < 0.3) {
                    const msg = this.funnyMessages[Math.floor(Math.random() * this.funnyMessages.length)];
                    showNavMessage(msg);
                }
            }, 10000);
        }
    }

    endNavigation() {
        this.isNavigating = false;
        this.destination = null;
        if (this.watchId) {
            GeolocationService.clearWatch(this.watchId);
            this.watchId = null;
        }
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }

        this.mapComponent.clearRouteAndDestination();
        
        // Reset 3D
        const mapContainer = document.getElementById('map-container');
        this.is3D = false;
        mapContainer.style.transform = '';
        document.querySelector('.leaflet-control-container').style.opacity = '1';
        this.els.navRecentreBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        this.mapComponent.setCarMode(false);
        
        toggleElement('top-nav-banner', false);
        toggleElement('bottom-nav-bar', false);
        toggleElement('info-panel', false);
        toggleElement('main-header', true);
        document.getElementById('top-nav-banner').classList.remove('ui-hidden');
        document.getElementById('bottom-nav-bar').classList.remove('ui-hidden');
        this.els.searchInput.value = '';
        
        if (this.userLocation) {
            this.mapComponent.centerOnUser(this.userLocation.lat, this.userLocation.lon);
        }
        
        showToast("Navigation ended.");
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
