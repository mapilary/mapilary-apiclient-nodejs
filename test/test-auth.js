var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
var should = chai.should();
var e = require('../lib/errorTypes');
var client = require('../lib/client');
var conf = require('./config.test.json');
chai.should();
chai.use(sinonChai);

function apiAuth(api) {
    api.users.getUser.operation.apiObject.apiDeclaration.authorizations = {
        apiKey: {
            type: 'apiKey',
            passAs: 'query',
            keyname: 'Authorization'
        }
    };
    return api;
}

describe('mapilary-apiclient auth tests', function() {

    var accessToken = conf.accessToken

    it('should not obtain access_token', function(done) {
        var api = client();
        api.authentication.userLogin(null, {
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
        var api = client();
        api.authentication.userLogin(null, {
            auth: {
                user: conf.userId,
                pass: conf.password
            },
            callback: function (err, user) {
                if (err) {
                    return done(err);
                }
                return done();
            }
        });
    });

    it('should not authorize user on request level', function(done) {
        var requestHandler = sinon.spy(require('../lib/reqHandler'));
        // var api = apiAuth(client({ requestHandler: requestHandler }));
        var api = client();
        // api.auth(accessToken);
        api.users.getUser({ id: 'this' }, {
            callback: function (err, user) {
                if (err) {
                    err.message.should.contain('Authorization via bearer token required');
                    err.should.be.an.instanceof(e.Unauthorized);
                    // err.message.be.an.instanceof(e.Unauthorized);
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
        var requestHandler = sinon.spy(require('../lib/reqHandler'));
        var api = client();
        api.users.getUser({ id: 'this' }, {
            auth: {
                bearer: accessToken
            },
            callback: function (err, user) {
                if (err) {
                    return done(err);
                }
                return done();
            }
        });
    });
});