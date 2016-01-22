/**
 * Represents a collection.  This collection stores its items inside of an object and provides methods to
 * add, remove, or get them.
 *
 * @constructor
 * @author Brett Namba (https://github.com/bretten)
 */
var Collection = function (objects) {
    if (!objects || objects.length < 1) {
        this.objects = {};
    } else {
        this.objects = objects;
    }
};

/**
 * The internal object representing the collection
 *
 * @type {{}}
 */
Collection.prototype.objects = {};

/**
 * Adds an object to the collection with the specified key
 *
 * @param key The key to store the object with
 * @param object The object to store
 */
Collection.prototype.add = function (key, object) {
    this.objects[key] = object;
};

/**
 * Removes an item from the collection with the specified key
 *
 * @param key The key corresponding to the item to remove
 */
Collection.prototype.remove = function (key) {
    if (this.objects.hasOwnProperty(key)) {
        this.objects[key] = undefined;
    }
};

/**
 * Gets the object with the specified key
 *
 * @param key The key corresponding to the item to get
 * @returns {*} The object if found, otherwise null
 */
Collection.prototype.get = function (key) {
    if (this.objects.hasOwnProperty(key) && this.objects[key] != undefined) {
        return this.objects[key];
    } else {
        return null;
    }
};

/**
 * Checks if the specified key exists and that the key is associated with an object
 *
 * @param key The key to check
 * @returns {boolean} True if the key and corresponding object exist, otherwise false
 */
Collection.prototype.hasKey = function (key) {
    return this.objects.hasOwnProperty(key) && this.objects[key] != undefined;
};
