require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    e          = require('../../lib/errorTypes'),
    reqHandler = require('../../lib/reqHandler');

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
                    err.message.should.contain('Invalid or missing "Authorization" header.');
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
            callback: function (err, token) {
                if (err) { return done(err); }
                token.access_token.should.be.defined;
                token.token_type.should.equal('Bearer');
                token.expires_in.should.be.defined;
                token.expires_in.should.be.Number;
                return done();
            }
        });
    });

    it('should not authorize user on request level', function(done) {
        api().users.get({ id: 'nobody' }, {
            callback: function (err, user) {
                if (err) {
                    err.should.be.an.instanceof(e.AccessDenied);
                    err.message.should.contain('No user on request!');
                    return done();
                }
                return done(new Error('unexpected success'));
            }
        });
    });

    it('should authorize user on request level', function(done) {
        var user = _.findWhere(fixtures.users, {username: 'courier'});
        getToken(user.username + '#' + user.company, user.password).then(function (token) {
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
