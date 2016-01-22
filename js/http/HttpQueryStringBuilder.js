/**
 * Handles and keeps track of HTTP query parameters
 *
 * @constructor
 * @author Brett Namba (https://github.com/bretten)
 */
var HttpQueryStringBuilder = function () {
    this.queryParameters = new Collection();
};

/**
 * The base URI that all HTTP requests will be directed at
 *
 * @type {string}
 */
HttpQueryStringBuilder.prototype.baseUri = "/";

/**
 * The current page of results that are being displayed
 *
 * @type {number}
 */
HttpQueryStringBuilder.prototype.page = 0;

/**
 * The collection of query parameters
 *
 * @type {object|null}
 */
HttpQueryStringBuilder.prototype.queryParameters = null;

/**
 * Callback that will be fired before the HTTP request is sent
 *
 * @type {function|null}
 */
HttpQueryStringBuilder.prototype.beforeSendCallback = null;

/**
 * Callback that will be fired after the HTTP request is sent
 *
 * @type {function|null}
 */
HttpQueryStringBuilder.prototype.completeCallback = null;

/**
 * Callback that will be fired upon success of the HTTP request
 *
 * @type {function|null}
 */
HttpQueryStringBuilder.prototype.successCallback = null;

/**
 * Callback that will be fired upon failure of the HTTP request
 *
 * @type {function|null}
 */
HttpQueryStringBuilder.prototype.errorCallback = null;

/**
 * Sets the base URI
 *
 * @param baseUri The base URI
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.setBaseUri = function (baseUri) {
    this.baseUri = baseUri;
    return this;
};

/**
 * Sets the page
 *
 * @param {number|string|null} page The page
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.setPage = function (page) {
    this.page = page;
    return this;
};

/**
 * Sets the beforeSend callback
 *
 * @param {function|null} beforeSendCallback The beforeSend callback
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.setBeforeSendCallback = function (beforeSendCallback) {
    this.beforeSendCallback = beforeSendCallback;
    return this;
};

/**
 * Sets the complete callback
 *
 * @param {function|null} completeCallback
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.setCompleteCallback = function (completeCallback) {
    this.completeCallback = completeCallback;
    return this;
};

/**
 * Sets the success callback
 *
 * @param {function|null} successCallback
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.setSuccessCallback = function (successCallback) {
    this.successCallback = successCallback;
    return this;
};

/**
 * Sets the error callback
 *
 * @param {function|null} errorCallback
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.setErrorCallback = function (errorCallback) {
    this.errorCallback = errorCallback;
    return this;
};

/**
 * Adds a query parameter to the collection
 *
 * @param {string} parameter The name of the query parameter
 * @param {string} value The value of the query parameter
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.addQueryParameter = function (parameter, value) {
    if ((typeof parameter === 'string' || parameter instanceof String)
        && (typeof value === 'string' || value instanceof String)) {
        this.queryParameters.add(parameter, value);
    }
    return this;
};

/**
 * Removes a query parameter from the collection
 *
 * @param {string} parameter The name of the query parameter
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.removeQueryParameter = function (parameter) {
    this.queryParameters.remove(parameter);
    return this;
};

/**
 * Builds the query string based on the current page and the collection of query parameters
 *
 * @returns {string} A query string containing all of the query parameters
 */
HttpQueryStringBuilder.prototype.buildQueryString = function () {
    var queryString;
    // Append the page parameter if the page is greater than 0
    if (this.page > 0) {
        queryString = "?page=" + this.page;
    } else {
        queryString = "";
    }
    // Append all the query parameters
    var i = 0;
    for (var parameter in this.queryParameters.objects) {
        // Check if the key exists
        if (this.queryParameters.hasKey(parameter)) {
            // Determine what the first character needs to be
            if (i == 0 && this.page < 1) {
                queryString += "?";
            } else {
                queryString += "&";
            }
            // Append the query parameter and value
            queryString +=
                encodeURIComponent(parameter) + "=" + encodeURIComponent(this.queryParameters.get(parameter));
            // Increment the counter
            i++;
        }
    }
    return queryString;
};

/**
 * Increments the current page
 *
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.incrementPage = function () {
    this.page++;
    return this;
};

/**
 * Decrements the current page. Only decrements when the page is greater than 1 to prevent going to a negative page
 *
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.decrementPage = function () {
    if (this.page > 1) {
        this.page--;
    }
    return this;
};

/**
 * Resets the page number to the beginning
 *
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.resetPageNumber = function () {
    this.page = 1;
    return this;
};

/**
 * Resets all query parameters
 *
 * @returns {HttpQueryStringBuilder} Reference to the current instance for chaining
 */
HttpQueryStringBuilder.prototype.resetQueryParams = function () {
    this.resetPageNumber();
    this.queryParameters = new Collection();
    return this;
};

/**
 * Sends a HTTP GET request via AJAX using the current query parameters and delegates handling to the callbacks
 */
HttpQueryStringBuilder.prototype.sendRequest = function () {
    $.ajax({
        type: 'GET',
        url: this.baseUri + this.buildQueryString(),
        beforeSend: (function (jqXHR, settings) {
            if ($.isFunction(this.beforeSendCallback)) {
                this.beforeSendCallback(jqXHR, settings);
            }
        }).bind(this),
        complete: (function (jqXHR, textStatus) {
            if ($.isFunction(this.completeCallback)) {
                this.completeCallback(jqXHR, textStatus);
            }
        }).bind(this),
        success: (function (data, textStatus, jqXHR) {
            if ($.isFunction(this.successCallback)) {
                this.successCallback(data, textStatus, jqXHR);
            }
        }).bind(this),
        error: (function (jqXHR, textStatus, errorThrown) {
            if ($.isFunction(this.errorCallback)) {
                this.errorCallback(jqXHR, textStatus, errorThrown);
            }
        }).bind(this)
    });
};
