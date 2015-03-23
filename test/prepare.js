require('./common');
var _           = require('underscore'),
    conf        = Object.freeze(require('./config.json')),
    Promise     = require('bluebird'),
    MongoDB     = Promise.promisifyAll(require('mongodb')),
    MongoClient = MongoDB.MongoClient,
    NRP         = require('node-redis-pubsub');

fixtures = {};

function handleCompany (collection, company) {
    return _.map(collection, function (doc) {
        doc.company = company;
        return doc;
    });
}

module.exports = function (callback) {

    var mongo = conf.db.mongo,
        redis = conf.db.redis;

    var credentials = mongo.user ? [mongo.user, ':', mongo.pass, '@'].join('') : '';
    var url = ['mongodb://', credentials, mongo.host, ':', mongo.port, '/', mongo.db].join('');

    // var nrp = new NRP(redis, { scope: redis.scope });

    MongoClient.connectAsync(url).then(function (db) {
        console.log('Connected to mongo');
        var dropCollections = [
            'companies',
            'routes',
            'deliveries',
            'positions',
            'users_history',
            'routes_history',
            'deliveries_history',
            'positions_history'
        ];

        return Promise.all([
            // drop all collections except user collection
            Promise.each(dropCollections, function (collection) {
                return db.collection(collection).drop();
            }),
            // remove all non system users
            db.collection('users').removeAsync({
                status: { $ne: 'hidden' },
                username: { $nin: ['root', 'public'] }
            }, { multi: true })
        ]).then(function () {
            var token;
            // get apikey for root user
            return getToken(conf.rootUser, conf.rootPassword);
        }).then(function (_token) {
            token = _token;
            //create company
            return postFixture('companies/register', {
                name: 'test',
                admin: {
                    username: 'testroot',
                    profile: { email: 'testroot@test.com' }
                }
            }, token);
        }).then(function () {
            //activate company
            // TODO: switch to nrp
            // return new Promise(function (resolve, reject) {
            //     nrp.on('company:register', function () {
            //         console.log('nrp', arguments);
            //         return resolve();
            //     });                
            // });
            return db.collection('companies')
                .updateAsync({ name: 'test' }, { $set: { status: 'active' } })
                .then(function () {
                    return db.collection('companies')
                        .find({ name: 'test' })
                        .toArrayAsync();
                });
        }).then(function (company) {
            var companyId = company[0]._id;
            var usersFixture      = handleCompany(require('./fixtures/users.json'), companyId),
                deliveriesFixture = handleCompany(require('./fixtures/deliveries.json'), companyId),
                routesFixture     = _.map(
                    require('./fixtures/routes.json'),
                    function (route) {
                        route.company   = companyId;
                        route.startDate = new Date(route.startDate);
                        route.endDate   = new Date(route.endDate);
                        return route;
                    }
                );

            return Promise.props({
                deliveries: postFixture('deliveries', deliveriesFixture, token),
                users: postFixture('users', usersFixture, token)
                    .then(function (users) {
                        return _.map(users, function (user, idx) {
                            user.company  = 'test';
                            user.password = usersFixture[idx].password;    
                            return user;
                        });
                    }),
                    // .then(function (users) {
                    //     return db.collection('users').updateAsync({ username: 'online'}, { $set: {'stats.online': true}})
                    //         .then(function () {
                    //             return users;                                
                    //         });
                    // }),
                routes: postFixture('routes', routesFixture, token),
            });
        }).then(function (results) {
            fixtures.users      = results.users;
            fixtures.routes     = results.routes;
            fixtures.deliveries = results.deliveries;
            return callback();
        }).catch(function (err) {
            return callback(err);
        }).finally(function () {
            db.close();
        });
    });
};