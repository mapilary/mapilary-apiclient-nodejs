require('./common');
var _           = require('underscore'),
    conf        = require('./config.test.json'),
    Promise     = require('bluebird'),
    MongoDB     = Promise.promisifyAll(require('mongodb')),
    MongoClient = MongoDB.MongoClient;

fixtures = {};

module.exports = function (callback) {

    var s = conf.db.mongo;
    var credentials = s.user ? [s.user, ':', s.pass, '@'].join('') : '';
    var url = ['mongodb://', credentials, s.host, ':', s.port, '/', s.db].join('');

    MongoClient.connect(url, function(err, db) {
        if (err) {
            throw new Error('Connection to mongo failed.');
        }
        console.log('Connected to mongo');
        var dropCollections = 
        [
            // 'users',
            'routes',
            'deliveries',
            'positions',
            'users_history',
            'routes_history',
            'deliveries_history',
            'positions_history'
        ];

        dropCollections.forEach(function (collection) {
            db.collection(collection).drop();
        });

        var usersFixture = require('./fixtures/users.json');
        var deliveriesFixture = require('./fixtures/deliveries.json');
        var routesFixture = _.map(require('./fixtures/routes.json'), function (route) {
            route.startDate = new Date(route.startDate);
            route.endDate = new Date(route.endDate);
            return route;
        });

        Promise.all([
            db.collection('users').removeAsync(
            {
                status: { $ne: 'hidden' },
                company: 'test'
            }, { multi: true }
            )
        ]).then(function () {
            return Promise.props({
                deliveries: postFixture('deliveries', deliveriesFixture, conf.accessToken),
                users: postFixture('users', usersFixture, conf.accessToken)
                    .then(function (users) {
                        return _.map(users, function (user, idx) {
                            user.password = usersFixture[idx].password;    
                            return user;
                        });
                    })
                    .then(function (users) {
                        return db.collection('users').updateAsync({ username: 'online'}, { $set: {'stats.online': true}})
                            .then(function () {
                                return users;                                
                            });
                    }),
                routes: postFixture('routes', routesFixture, conf.accessToken),
            });
        }).then(function (results) {
            fixtures.users = results.users;
            fixtures.routes = results.routes;
            fixtures.deliveries = results.deliveries;
            return callback();
        }).catch(function (err) {
            return callback(err);
        }).finally(function () {
            db.close();
        });
    });
};