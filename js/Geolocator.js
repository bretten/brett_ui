/**
 * Uses the Geolocation API to aid in finding the user location.  Allows callbacks to be set at different
 * stages of the Geolocation permission process.
 *
 * @constructor
 * @author Brett Namba (https://github.com/bretten)
 */
var Geolocator = function () {

};

/**
 * Default options for location requests
 *
 * @type {object}
 */
Geolocator.prototype.options = {
    enableHighAccuracy: true
};

/**
 * The watch ID that is returned when indefinitely listening for location updates
 *
 * @type {number|null}
 */
Geolocator.prototype.watchId = null;

/**
 * The current latitude
 *
 * @type {number|null}
 */
Geolocator.prototype.lat = null;

/**
 * The current longitude
 *
 * @type {number|null}
 */
Geolocator.prototype.lng = null;

/**
 * The amount of time (ms) to wait after the geolocation permission prompt is displayed before executing the
 * onPermissionTimeoutCallback method
 *
 * @type {number}
 */
Geolocator.prototype.permissionTimeout = 0;

/**
 * Callback that executes when a location request is made
 *
 * @type {function|null}
 */
Geolocator.prototype.onRequestPositionCallback = null;

/**
 * Callback that executes when the permissionTimeout interval ends after the geolocation permission prompt appears
 *
 * @type {function|null}
 */
Geolocator.prototype.onPermissionTimeoutCallback = null;

/**
 * Callback that executes when the user position is successfully retrieved
 *
 * @type {function|null}
 */
Geolocator.prototype.onPositionUpdateCallback = null;

/**
 * Callback that executes on an error
 *
 * @type {function|null}
 */
Geolocator.prototype.onErrorCallback = null;

/**
 * Error message for a PERMISSION_DENIED error code from the Geolocation API
 *
 * @type {string}
 */
Geolocator.prototype.errorMessagePermissionDenied =
    "The browser does not have permission to retrieve your location data.";

/**
 * Error message for a POSITION_UNAVAILABLE error code from the Geolocation API
 *
 * @type {string}
 */
Geolocator.prototype.errorMessagePositionUnavailable = "Your location is currently not available.";

/**
 * Error message for a TIMEOUT error code from the Geolocation API
 *
 * @type {string}
 */
Geolocator.prototype.errorMessageTimeout = "There was a timeout when trying to retrieve your location data.";

/**
 * General error message
 *
 * @type {string}
 */
Geolocator.prototype.errorMessageGeneral = "An unknown geolocation error has occurred.";

/**
 * Error message for when the browser does not support geolocation
 *
 * @type {string}
 */
Geolocator.prototype.errorMessageGeolocationNotAvailable = "Geolocation is not available";

/**
 * Determines if the Geolocation API is available
 *
 * @returns {boolean}
 */
Geolocator.prototype.isGeolocationAvailable = function () {
    return "geolocation" in navigator;
};

/**
 * Determines if the user's current location has been found
 *
 * @returns {boolean}
 */
Geolocator.prototype.isCurrentPositionAvailable = function () {
    return this.lat != null || this.lng != null;
};

/**
 * Clears out the current location
 */
Geolocator.prototype.clearCurrentPosition = function () {
    this.lat = null;
    this.lng = null;
};

/**
 * Stops the Geolocation API from receiving further location updates and clears out the watch ID
 */
Geolocator.prototype.stopListening = function () {
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
};

/**
 * Starts listening on a constant interval for location updates
 */
Geolocator.prototype.listenForPositionUpdates = function () {
    if (!this.isGeolocationAvailable()) {
        this.executeErrorCallback(this.errorMessageGeolocationNotAvailable);
        return;
    }

    // Execute the onRequestPositionUpdate callback
    this.executeOnRequestPositionCallback();

    // Continuously listen for position updates and keep track of the watch ID
    this.watchId = navigator.geolocation.watchPosition(
        this.onPositionUpdate.bind(this), this.onError.bind(this), this.options);

    // Execute the executePermissionTimeout callback
    this.executePermissionTimeoutCallback(this.permissionTimeout);
};

/**
 * Requests the current location once
 */
Geolocator.prototype.getCurrentPosition = function () {
    if (!this.isGeolocationAvailable()) {
        this.executeErrorCallback(this.errorMessageGeolocationNotAvailable);
        return;
    }

    // Execute the onRequestPositionUpdate callback
    this.executeOnRequestPositionCallback();

    // Get the current position only once
    navigator.geolocation.getCurrentPosition(
        this.onPositionUpdate.bind(this), this.onError.bind(this), this.options);

    // Execute the executePermissionTimeout callback
    this.executePermissionTimeoutCallback(this.permissionTimeout);
};

/**
 * Called when the location is successfully returned from the Geolocation API
 *
 * @param position The current position
 */
Geolocator.prototype.onPositionUpdate = function (position) {
    // Get the latitude and longitude
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
    // Execute the onPositionUpdate callback
    this.executeOnPositionUpdateCallback(this.lat, this.lng);
};

/**
 * Called when the Geolocation API returns an error
 *
 * @param error The error object
 */
Geolocator.prototype.onError = function (error) {
    // Determine the error message
    var errorMessage = "";
    if (error.code == error.PERMISSION_DENIED) {
        errorMessage = this.errorMessagePermissionDenied;
    } else if (error.code == error.POSITION_UNAVAILABLE) {
        errorMessage = this.errorMessagePositionUnavailable;
    } else if (error.code == error.TIMEOUT) {
        errorMessage = this.errorMessageTimeout;
    } else {
        errorMessage = this.errorMessageGeneral;
    }
    // Execute the callback
    this.executeErrorCallback(errorMessage);
};

/**
 * Executes onRequestPositionCallback
 */
Geolocator.prototype.executeOnRequestPositionCallback = function () {
    if ($.isFunction(this.onRequestPositionCallback)) {
        this.onRequestPositionCallback();
    }
};

/**
 * Executes onPositionUpdateCallback
 *
 * @param lat The latitude value from the location update
 * @param lng The longitude value from the location update
 */
Geolocator.prototype.executeOnPositionUpdateCallback = function (lat, lng) {
    if ($.isFunction(this.onPositionUpdateCallback)) {
        this.onPositionUpdateCallback(lat, lng);
    }
};

/**
 * Executes onPositionUpdateCallback
 *
 * @param timeout The amount of time to wait (ms) before executing the callback
 */
Geolocator.prototype.executePermissionTimeoutCallback = function (timeout) {
    if (this.permissionTimeout > 0 && $.isFunction(this.onPositionUpdateCallback)) {
        // Wrap callback in function to be passed to setTimeout
        var executeCallback = function () {
            this.onPermissionTimeoutCallback();
        }.bind(this);
        // Run the callback after the interval
        setTimeout(executeCallback, timeout);
    }
};

/**
 * Executes onErrorCallback
 *
 * @param errorMessage The error message to display
 */
Geolocator.prototype.executeErrorCallback = function (errorMessage) {
    if ($.isFunction(this.onErrorCallback)) {
        this.onErrorCallback(errorMessage);
    }
};
