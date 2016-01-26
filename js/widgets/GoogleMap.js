/**
 * Represents a GoogleMap that is location-aware
 *
 * @constructor
 * @author Brett Namba (https://github.com/bretten)
 */
var GoogleMap = function () {
    this.initializeGeolocator();
};

/**
 * Geolocator used to determine user location
 *
 * @type {Geolocator|null}
 */
GoogleMap.prototype.geolocator = null;

/**
 * The element that will contain the Map
 *
 * @type {HTMLElement|null}
 */
GoogleMap.prototype.mapElement = null;

/**
 * The Map object
 *
 * @type {google.maps.Map|null}
 */
GoogleMap.prototype.map = null;

/**
 * The default options for the Map
 *
 * @type {google.maps.MapOptions}
 */
GoogleMap.prototype.mapOptions = {
    center: new google.maps.LatLng(0, 0),
    disableDoubleClickZoom: true,
    keyboardShortcuts: false,
    streetViewControl: false,
    zoom: 2
};

/**
 * A collection of Marker icons
 *
 * @type {object}
 */
GoogleMap.prototype.markerIcons = {
    yellowDot: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    blueDot: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    redDot: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    greenDot: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    purpleDot: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png"
};

/**
 * The Marker for designating the user location
 *
 * @type {google.maps.Marker|null}
 */
GoogleMap.prototype.userMarker = null;

/**
 * The animation to use when animating the user Marker
 *
 * @type {google.maps.Animation}
 */
GoogleMap.prototype.userMarkerAnimation = google.maps.Animation.DROP;

/**
 * The default MarkerOptions for the user Marker
 *
 * @type {object}
 */
GoogleMap.prototype.userMarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP
};

/**
 * The Circle that surrounds the user's position
 *
 * @type {google.maps.Circle|null}
 */
GoogleMap.prototype.userLocationCircle = null;

/**
 * Callback that executes when a location request is made
 *
 * @type {function|null}
 */
GoogleMap.prototype.onGeolocationRequestCallback = null;

/**
 * Callback that executes when the user does not answer the geolocation permission prompt
 *
 * @type {function|null}
 */
GoogleMap.prototype.onGeolocationPermissionTimeoutCallback = null;

/**
 * Callback that executes when a location request is successful
 *
 * @type {function|null}
 */
GoogleMap.prototype.onGeolocationSuccessCallback = null;

/**
 * Callback that executes when a location error occurs
 *
 * @type {function|null}
 */
GoogleMap.prototype.onGeolocationErrorCallback = null;

/**
 * The amount of time (ms) to wait for a user response on the geolocation permission prompt before executing the
 * onGeolocationPermissionTimeoutCallback method
 *
 * @type {number}
 */
GoogleMap.prototype.geolocatorWaitTimeout = 3000;

/**
 * The Map zoom level to be used when focusing on a specific location
 *
 * @type {number}
 */
GoogleMap.prototype.focusedZoomLevel = 15;

/**
 * The minimum map zoom level that is still considered "focused" on a location
 *
 * @type {number}
 */
GoogleMap.prototype.minFocusedZoomLevel = 5;

/**
 * Callback that executes when a Marker is clicked
 *
 * @type {function|null}
 */
GoogleMap.prototype.onMarkerClickCallback = null;

/**
 * Initializes the map on the specified element
 *
 * @param mapElement The DOM element to add the map to
 */
GoogleMap.prototype.initializeMap = function (mapElement) {
    this.mapElement = mapElement;
    this.map = new google.maps.Map(this.mapElement, this.mapOptions);
};

/**
 * Initializes the Geolocator and sets the callbacks
 */
GoogleMap.prototype.initializeGeolocator = function () {
    this.geolocator = new Geolocator();
    // Set the timeout
    this.geolocator.permissionTimeout = this.geolocatorWaitTimeout;
    // Set the callback that executes when a location request is made
    this.geolocator.onRequestPositionCallback = this.onGeolocationRequest.bind(this);
    // Set the callback that executes if the geolocation permission prompt is not answered by the user
    this.geolocator.onPermissionTimeoutCallback = this.onGeolocationPermissionTimeout.bind(this);
    // Set the callback that executes on a successful location request
    this.geolocator.onPositionUpdateCallback = this.onGeolocationSuccess.bind(this);
    // Set the callback that executes on a location request error
    this.geolocator.onErrorCallback = this.onGeolocationError.bind(this);
};

/**
 * Initializes the Circle that bounds the user's current location
 *
 * @param options google.maps.CircleOptions that determines the appearances of the Circle
 */
GoogleMap.prototype.initializeUserLocationCircle = function (options) {
    this.userLocationCircle = new google.maps.Circle(options);
};

/**
 * Callback method that executes on a successful location request
 *
 * @param lat The latitude returned from the geolcation API
 * @param lng The longitude returned from the geolcation API
 */
GoogleMap.prototype.onGeolocationSuccess = function (lat, lng) {
    if ($.isFunction(this.onGeolocationSuccessCallback)) {
        this.onGeolocationSuccessCallback(lat, lng);
    }

    // Focus the Map on the user's location if it is not within the current Map bounds
    this.focusOnLocation(lat, lng);
    // Update the Marker indicating the user's location
    this.setUserMarker(lat, lng);
    // Update the position of the user's location circle
    this.setUserLocationCirclePosition(lat, lng);
};

/**
 * Callback method that executes if the geolocation permission prompt is not answered by the user
 */
GoogleMap.prototype.onGeolocationPermissionTimeout = function () {
    if ($.isFunction(this.onGeolocationPermissionTimeoutCallback)) {
        this.onGeolocationPermissionTimeoutCallback(this.geolocator.isCurrentPositionAvailable());
    }
};

/**
 * Callback method that executes when a location request is made
 */
GoogleMap.prototype.onGeolocationRequest = function () {
    // Clear the Geolocator's current position
    this.geolocator.clearCurrentPosition();
    // Remove the user's location marker from the map
    this.removeUserPosition();
    // Hide the location circle
    this.hideUserLocationCircle();
    // Execute the on request callback
    if ($.isFunction(this.onGeolocationRequestCallback)) {
        this.onGeolocationRequestCallback();
    }
};

/**
 * Callback method that executes when a location request results in an error
 *
 * @type {string} The error message
 */
GoogleMap.prototype.onGeolocationError = function (errorMessage) {
    if ($.isFunction(this.onGeolocationErrorCallback)) {
        this.onGeolocationErrorCallback(errorMessage);
    }
};

/**
 * Requests the current position once from the Geolocation API
 */
GoogleMap.prototype.requestPosition = function () {
    this.geolocator.getCurrentPosition();
};

/**
 * Continually requests the current position from the Geolocation API
 */
GoogleMap.prototype.startPositionUpdateListener = function () {
    this.geolocator.listenForPositionUpdates();
};

/**
 * Stops listening for position updates from the Geolocation API
 */
GoogleMap.prototype.stopPositionUpdateListener = function () {
    this.geolocator.stopListening();
};

/**
 * Removes the user location Marker from the Map
 */
GoogleMap.prototype.removeUserPosition = function () {
    if (this.userMarker != null && this.userMarker instanceof google.maps.Marker) {
        this.userMarker.setMap(null);
    }
};

/**
 * Sets the position of the user's current location on the Map
 *
 * @param lat The latitude of the user's position
 * @param lng The longitude of the user's position
 */
GoogleMap.prototype.setUserMarker = function (lat, lng) {
    if (this.map == null || !this.map instanceof google.maps.Map) {
        return;
    }

    if (this.userMarker == null || !(this.userMarker instanceof google.maps.Marker)) {
        this.userMarker = new google.maps.Marker(this.userMarkerOptions);
    }
    this.userMarker.setMap(this.map);
    this.userMarker.setAnimation(google.maps.Animation.DROP);
    this.userMarker.setPosition({lat: lat, lng: lng});
};

/**
 * Sets the user location Circle to visible and centers it on the specified location
 *
 * @param lat The new latitude
 * @param lng The new longitude
 */
GoogleMap.prototype.setUserLocationCirclePosition = function (lat, lng) {
    if (this.userLocationCircle != null && this.userLocationCircle instanceof google.maps.Circle) {
        // Show the Circle if it is hidden
        if (!this.userLocationCircle.getVisible()) {
            this.userLocationCircle.setVisible(true);
        }
        // Set the location of the circle
        this.userLocationCircle.setCenter(new google.maps.LatLng(lat, lng));
    }
};

/**
 * Hides the user location Circle if it is visible
 */
GoogleMap.prototype.hideUserLocationCircle = function () {
    if (this.userLocationCircle != null && this.userLocationCircle instanceof google.maps.Circle) {
        if (this.userLocationCircle.getVisible()) {
            this.userLocationCircle.setVisible(false);
        }
    }
};

/**
 * Centers the Map on the specified coordinates
 *
 * @param lat The new latitude
 * @param lng The new longitude
 */
GoogleMap.prototype.centerMap = function (lat, lng) {
    if (this.map == null || !this.map instanceof google.maps.Map) {
        return;
    }

    this.map.panTo({lat: lat, lng: lng});
};

/**
 * Zooms the map to the specified level
 *
 * @param zoom The zoom level
 */
GoogleMap.prototype.zoomMap = function (zoom) {
    if (this.map == null || !this.map instanceof google.maps.Map) {
        return;
    }

    this.map.setZoom(zoom);
};

/**
 * Focuses the Map on the specified location if it is not within the Map bounds or if the Map is zoomed too far out
 *
 * @param lat The new latitude
 * @param lng The new longitude
 */
GoogleMap.prototype.focusOnLocation = function (lat, lng) {
    if (this.map == null || !this.map instanceof google.maps.Map) {
        return;
    }

    if (!this.map.getBounds().contains(new google.maps.LatLng(lat, lng))
        || this.map.getZoom() < this.minFocusedZoomLevel) {
        // Zoom in on the location
        this.zoomMap(this.focusedZoomLevel);
        // Center the map on the location
        this.centerMap(lat, lng);
    }
};

/**
 * Adds a click listener to the specified Marker that executes the onMarkerClick callback
 *
 * @param marker The Marker to add the click listener to
 */
GoogleMap.prototype.addMarkerClickListener = function (marker) {
    if (marker == null || !marker instanceof google.maps.Marker) {
        return;
    }

    // Make sure the onMarkerClick callback method is set
    if (this.onMarkerClickCallback != null && typeof this.onMarkerClickCallback === "function") {
        var self = this;
        google.maps.event.addListener(marker, 'click', function () {
            // Execute the callback
            self.onMarkerClickCallback(marker);
        });
    }
};

/**
 * Removes the specified Marker from the Map
 *
 * @param marker The Marker to remove from the Map
 */
GoogleMap.prototype.removeMarker = function (marker) {
    if (marker == null || !marker instanceof google.maps.Marker) {
        return;
    }

    marker.setMap(null);
    marker = undefined;
};
