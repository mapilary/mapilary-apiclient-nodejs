var handler = require('./reqHandler');
var Promise = require('bluebird');

module.exports = function requestHandler (err, req) {

    if (err) {
        return Promise.reject(err);
    }

    return new Promise (function (resolve, reject) {
        req.options.callback = function (err, res) {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        };
        handler(err, req);
    });
};