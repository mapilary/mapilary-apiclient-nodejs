var _ = require('underscore');
var e = require('./errorTypes');
var request = require('request');

var defaultOptions = {
    simple: true,
    resolveWithFullResponse: false
};

module.exports = function requestHandler(err, req) {

    var c = _.extend({}, defaultOptions);
    var callback = req.options.callback;

    if (err) {
        return callback(err);
    }

    // console.log('[DEBUG] HTTP method', req);

    request({
        method: req.method,
        uri: req.url,
        headers: req.headers,
        auth: req.auth,
        json: true,
        body: req.body
    }, function(error, response, body) {
        if (error) {
            return callback(error);
        } else if (c.simple && response.statusCode === 401) {
            return callback(new e.Unauthorized(body.message));
        } else if (c.simple && response.statusCode === 404) {
            // console.log(error, response, response.statusCode);
            return callback(new e.ResourceNotFound(body.message));
        } else if (c.simple && response.statusCode === 405) {
            return callback(new e.MethodNotAllowed(body.message));
        } else if (c.simple && (/^5/.test('' + response.statusCode))) {
            return callback(new e.InternalServerError(body.message));
        } else if (c.simple && !(/^2/.test('' + response.statusCode))) {
            return callback(new e.InvalidRequestError(body.message));
        } else {
            if (c.transform && typeof c.transform === 'function') {
                try {
                    return callback(null, c.transform(body, response));
                } catch (e) {
                    return callback(e);
                }
            } else if (c.resolveWithFullResponse) {
                return callback(null, response);
            } else {
                return callback(null, body);
            }
        }
    });
};