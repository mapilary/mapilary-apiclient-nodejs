var Promise = require('bluebird');

module.exports = function requestHandler (opts) {

    var handler = require('./reqHandler')(opts);

    return function (err, req) {
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
};