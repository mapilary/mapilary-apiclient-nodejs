var conf        = require('./config.test.json');
    Promise     = require('bluebird'),
    mongodb     = require('mongodb'),
    request     = Promise.promisifyAll(require('request')),
	MongoClient = mongodb.MongoClient,
	Collection  = mongodb.Collection;

Promise.promisifyAll(Collection.prototype);
Promise.promisifyAll(MongoClient);

api = function (options) {
    return require('../lib/client')(options);
};

mongo = function () {
    var s = conf.db.mongo;
    var credentials = s.user ? [s.user, ':', s.pass, '@'].join('') : '';
    var url = ['mongodb://', credentials, s.host, ':', s.port, '/', s.db].join('');

    return MongoClient.connectAsync(url)
        .disposer(function(db) {
            try {
                db.close();
            } catch (e) {}
        });
};

getToken = function (user, password) {
    return request
        .postAsync([conf.url, 'token'].join('/'), {
            json: true,
            auth: {
                user: user,
                pass: password
            }
        })
        .spread(function(response, body) {
            if (!(/^2/.test(String(response.statusCode)))) {
                var msg = ['Obtaining token for user ' + user + ' failed ' , JSON.stringify(body)].join('\n');
                throw new Error(msg);
            }
            return body.access_token;
        });
};

postFixture = function (path, fixture, accessToken) {
    return request.postAsync([conf.url, path].join('/'), {
        json: fixture,
        headers: { Authorization: 'Bearer ' + accessToken }
    }).spread(function(response, body) {
        if (!(/^2/.test(String(response.statusCode)))) {
            var msg = ['Import of ' + path  + ' fixture failed', JSON.stringify(body)].join('\n');
            throw new Error(msg);
        }
        return body;
    });
};