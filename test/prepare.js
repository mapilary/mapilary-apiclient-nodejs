require('./common');

var _       = require('underscore'),
    client  = api({ promise: true }),
    Promise = require('bluebird');
    conf    = Object.freeze(require('./config.json')),

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

module.exports = function () {

    var token, companyName = fixtures.company;

    // get apikey for root user
    return getToken(conf.users.root.username, conf.users.root.password)
    .then(function (token) {
        console.log('Creating company %s ...', companyName);

        return postFixture('companies/register', {
            name: companyName,
            admin: {
                username: conf.users.admin.username,
                password: conf.users.admin.password,
                profile: { email: buildEmail(conf.users.admin.username, companyName) }
            }
        }, token)
        .then(function () {
            return client.users.get(
                { username: conf.users.admin.username, company: companyName },
                { auth: { bearer: token } }
            );
        })
        .then(function (admins) {
            var admin = admins[0];
            console.log('Activate company admin user...');
            return client.users.update({
                id: admin._id,
                props: {
                    status: 'active'
                }
            }, { auth: { bearer: token } })
            .then(function () {
                return admin;
            });
        });
    })
    .then(function (admin) {
        console.log('Obtaining access token for admin user...');
        return getToken([admin.username, admin.company].join('#'), conf.users.admin.password);
    })
    .then(function (_token) {
        token = _token;
        console.log('Creating users...');
        var fixture = buildUsers(require('./fixtures/users.json'), companyName);
        return postFixture('users', fixture, token)
        .then(function (users) {
            fixtures.users = _.map(users, function (user, idx) {
                user.password = fixture[idx].password;
                return user;
            });
        });
    })
    .then(function () {
        console.log('Creating deliveries...');
        var fixture = handleCompany(require('./fixtures/deliveries.json'), companyName);
        return postFixture('deliveries', fixture, token)
        .then(function (deliveries) {
            fixtures.deliveries = deliveries;
        });
    })
    .then(function () {
        console.log('Creating routes...');
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
    });
};
