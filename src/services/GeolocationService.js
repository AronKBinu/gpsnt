// GeolocationService.js - handles browser Geolocation API

class GeolocationService {
    static getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    let msg = "Unknown error";
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            msg = "User denied the request for Geolocation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            msg = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            msg = "The request to get user location timed out.";
                            break;
                    }
                    reject(new Error(msg));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    static watchPosition(callback, errorCallback) {
        if (!navigator.geolocation) {
            errorCallback(new Error("Geolocation is not supported by your browser"));
            return null;
        }

        return navigator.geolocation.watchPosition(
            (position) => {
                callback({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let msg = "Unknown error";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                }
                errorCallback(new Error(msg));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    static clearWatch(watchId) {
        if (navigator.geolocation && watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }
    }
}
