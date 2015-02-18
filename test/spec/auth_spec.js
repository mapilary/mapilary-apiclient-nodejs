require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    e          = require('../../lib/errorTypes'),
    reqHandler = require('../../lib/reqHandler'),
    conf       = require('../config.test.json');

chai.should();
chai.use(sinonChai);

function apiAuth(api) {
    api.users.get.operation.apiObject.apiDeclaration.authorizations = {
        apiKey: {
            type: 'apiKey',
            passAs: 'query',
            keyname: 'Authorization'
        }
    };
    return api;
}

describe('authentication', function() {

    it('should not obtain access_token', function(done) {
        api().authentication.login(null, {
            callback: function (err, user) {
                if (err) {
                    err.message.should.contain('Authorization header is required');
                    err.should.be.an.instanceof(e.Unauthorized);
                    return done();
                }
                return done(new Error('unexpected success'));
            }
        });
    });

    it('should obtain access_token successfully', function(done) {
        var user = _.findWhere(fixtures.users, {username: 'courier'});
        var auth = {
            user: [user.username, user.company].join('#'),
            pass: user.password
        };
        api().authentication.login(null, {
            auth: auth,
            callback: function (err, user) {
                if (err) { return done(err); }
                return done();
            }
        });
    });

    it('should not authorize user on request level', function(done) {
        // var requestHandler = sinon.spy(reqHandler);
        // var api = apiAuth(client({ requestHandler: requestHandler }));
        // api.auth(accessToken);
        api().users.get({ id: 'this' }, {
            callback: function (err, user) {
                if (err) {
                    err.should.be.an.instanceof(e.AccessDenied);
                    err.message.should.contain('No user on request!');
                    // requestHandler.should.have.been.called;
                    // var call = requestHandler.getCall(0);
                    // console.log(call.args);
                    return done();
                }
                return done(new Error('unexpected success'));
            }
        });
    });

    it('should authorize user on request level', function(done) {
        getToken('courier#test', 'courier').then(function (token) {
            // console.log('token', token);
            api().users.getById({ id: 'this' }, {
                auth: { bearer: token },
                callback: function (err, user) {
                    if (err) { return done(err); }
                    user.username.should.equal('courier');
                    return done();
                }
            });
        });
    });
});