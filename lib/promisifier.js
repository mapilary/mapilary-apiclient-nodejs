var _ = require('underscore');
var Promise = require('bluebird');

module.exports = function promisify (resource) {
    _.each(resource, function (operation, operationName) {
        if (_.isFunction(operation)) {
            return resource[operationName + 'Async'] = Promise.promisify(operation);
        }
        if (_.isObject(operation)) {
            parent = operationName;
            return promisify(operation);
        }
    });
    return resource;
};