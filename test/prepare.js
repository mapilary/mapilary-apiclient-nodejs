require('./common');
var _           = require('underscore'),
    conf        = Object.freeze(require('./config.json')),
    Promise     = require('bluebird'),
    NRP         = require('node-redis-pubsub');

fixtures = {
    company: 'test' + new Date().getTime()
};

function handleCompany (collection, company) {
    return _.map(collection, function (doc) {
        doc.company = company;
        return doc;
    });
}

function buildUsers (collection, company) {
    return _.map(collection, function (doc) {
        doc.company = company;
        doc.profile.email = buildEmail(doc.username, company);
        return doc;
    });    
}

module.exports = function (callback) {

    var token, companyName = fixtures.company;

    var nrp = new NRP(conf.db.redis, { scope: conf.db.redis.scope });

    // get apikey for root user
    getToken(conf.rootUser, conf.rootPassword)
    .then(function (_token) {
        token = _token;
        //create company
        return new Promise(function (resolve, reject) {
            // wait for activation token
            nrp.on('company:register', function () {
                return resolve();
            });

            postFixture('companies/register', {
                name: companyName,
                admin: {
                    username: 'admina',
                    profile: { email: buildEmail('admina', companyName) }
                }
            }, token);
        });
    })
    .then(function () {
        var fixture = buildUsers(require('./fixtures/users.json'), companyName);
        return postFixture('users', fixture, token)
        .then(function (users) {
            fixtures.users = _.map(users, function (user, idx) {
                // user.company  = 'test';
                user.password = fixture[idx].password;    
                return user;
            });
        });
    })
    .then(function () {
        var fixture = handleCompany(require('./fixtures/deliveries.json'), companyName);
        return postFixture('deliveries', fixture, token)
        .then(function (deliveries) {
            fixtures.deliveries = deliveries;
        });
    })
    .then(function () {
        var fixture = _.map(require('./fixtures/routes.json'),
            function (route) {
                route.company   = companyName;
                route.startDate = new Date(route.startDate);
                route.endDate   = new Date(route.endDate);
                return route;
            }
        );
        return postFixture('routes', fixture, token)
        .then(function (routes) {
            fixtures.routes = routes;
        });
    })
    .then(function () {
        return callback();
    })
    .catch(function (err) {
        return callback(err);
    });
};