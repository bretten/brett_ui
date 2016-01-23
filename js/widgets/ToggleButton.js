/**
 * Models a ToggleButton that changes states and sends HTTP requests on state changes
 *
 * @param element The HTML element that the ToggleButton will be associated with
 * @param uri The URI that the request should be sent to
 * @param serverState The initial state of the toggle
 * @param parameterName The name of the HTTP request parameter that will carry the state of the ToggleButton
 * @constructor
 * @author Brett Namba (https://github.com/bretten)
 */
var ToggleButton = function (element, uri, serverState, parameterName) {
    this.element = element;
    this.uri = uri;
    this.serverState = this.selectedState = serverState;
    this.parameterName = parameterName;
};

/**
 * The HTML element that this ToggleButton is associated to
 *
 * @type {HTMLElement|null}
 */
ToggleButton.prototype.element = null;

/**
 * The URI that all HTTP requests will be directed at
 *
 * @type {string}
 */
ToggleButton.prototype.uri = "/";

/**
 * The state value from the server
 *
 * @type {number}
 */
ToggleButton.prototype.serverState = 0;

/**
 * The state that was selected by the user
 *
 * @type {number}
 */
ToggleButton.prototype.selectedState = 0;

/**
 * The type of HTTP request that will be sent when the ToggleButton changes states
 *
 * @type {string}
 */
ToggleButton.prototype.httpMethod = "POST";

/**
 * The data type of the HTTP request that will be sent when the ToggleButton changes states
 *
 * @type {string}
 */
ToggleButton.prototype.requestDataType = "json";

/**
 * The name of the HTTP request parameter that will carry the state of the ToggleButton
 *
 * @type {string}
 */
ToggleButton.prototype.parameterName = "state";

/**
 * Flag to determine if a HTTP request is currently being made to the server
 *
 * @type {boolean}
 */
ToggleButton.prototype.isRequestInProgress = false;

/**
 * Callback method that executes before a request is made to the server
 *
 * @type {function|null}
 */
ToggleButton.prototype.beforeSendCallback = null;

/**
 * Callback method that executes after a request is made to the server
 *
 * @type {function|null}
 */
ToggleButton.prototype.completeCallback = null;

/**
 * Callback method that executes after a successful request is made to the server
 *
 * @type {function|null}
 */
ToggleButton.prototype.successCallback = null;

/**
 * Callback method that executes after an error is returned from the server
 *
 * @type {function|null}
 */
ToggleButton.prototype.errorCallback = null;

/**
 * Sets the selected state of the ToggleButton
 *
 * @param state The new state
 */
ToggleButton.prototype.selectState = function (state) {
    this.selectedState = state == true || state == 1 || state == "1" ? 1 : 0;
    this.sendRequest();
};

/**
 * Sends a HTTP request to the URI with the new state of the ToggleButton
 */
ToggleButton.prototype.sendRequest = function () {
    if (this.isRequestInProgress) {
        return;
    }

    // Build the request object
    var ajax = {
        type: this.httpMethod,
        url: this.uri,
        dataType: this.requestDataType,
        beforeSend: function (jqXHR, settings) {
            // Indicate that a request is in progress
            this.isRequestInProgress = true;
            // Execute the callback
            if ($.isFunction(this.beforeSendCallback)) {
                this.beforeSendCallback(jqXHR, settings);
            }
        }.bind(this),
        complete: function (jqXHR, textStatus) {
            // Indicate that the request has finished
            this.isRequestInProgress = false;
            // Execute the callback
            if ($.isFunction(this.completeCallback)) {
                this.completeCallback(jqXHR, textStatus);
            }
        }.bind(this),
        success: function (data, textStatus, jqXHR) {
            // The selected state now reflects the server-side state
            this.serverState = this.selectedState;
            // Execute the callback
            if ($.isFunction(this.successCallback)) {
                this.successCallback(this.serverState, data, textStatus, jqXHR);
            }
        }.bind(this),
        error: function (jqXHR, textStatus, errorThrown) {
            // The request was unsuccessful, so revert the selected state back to the server-side state
            this.selectedState = this.serverState;
            // Execute the callback
            if ($.isFunction(this.errorCallback)) {
                this.errorCallback(this.serverState, jqXHR, textStatus, errorThrown);
            }
        }.bind(this)
    };

    // If the HTTP method is POST, set the data on the request object
    if (this.httpMethod.toUpperCase() === "POST") {
        ajax.data = {};
        // Set the data
        ajax.data[this.parameterName] = this.selectedState;
    }

    // Send the request
    $.ajax(ajax);
};
