require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    expect     = chai.expect,
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler')(),
    conf       = require('../config.json');

chai.should();
chai.use(sinonChai);

describe('users', function () {

    var accessToken;

    before(function (done) {
        var user = _.findWhere(fixtures.users, {username: 'admin'});
        getToken(user.profile.email, user.password)
        .then(function (token) {
            accessToken = token;
            return done();
        })
        .catch(function (err) {
            return done(err);
        });
    });

    it('should get user', function (done) {
        var user = _.findWhere(fixtures.users, {username: 'online'});
        api().users.getById(user._id, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res._id.toString().should.equal(user._id.toString());
                done();
            }
        });
    });

    it('should create new courier', function (done) {
        var registered = new Date();
        var courier = {
            "username": "akim",
            "password": "shdgid",
            "company": "test",
            "registrationDate": registered,
            "profile": {
              "titleBefore": "",
              "name": "Alvarado",
              "surname": "Kim",
              "titleAfter": "",
              "age": 24,
              "phoneNr": "+1 (901) 429-2670",
              "email": buildEmail("alvaradokim", fixtures.company)
            },
            "roles": ["courier"]
        };

        api().users.create([courier], {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.should.be.instanceof(Array);
                res.should.have.length(1);
                var user = res[0];
                user.username.should.equal('akim');
                // user.company.should.equal('test'); TODO: enable when companies will be string again
                new Date(user.registrationDate).getTime().should.equal(registered.getTime());
                user.profile.should.include(courier.profile);
                user.roles.should.eql(['courier']);
                return done();
            }
        });
    });

    it('should delete user', function (done) {
        var user = _.findWhere(fixtures.users, {username: 'delete'});
        api({simple: false, resolveWithFullResponse: true}).users.delete({ id: user._id }, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.statusCode.should.equal(204);
                done();
            }
        });
    });

    it('should only return users with role courier', function (done) {
        var spy = sinon.spy(reqHandler);

        api({ requestHandler: spy }).users.get({ roles: 'courier' }, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                spy.should.have.been.calledOnce;
                expect(spy.getCall(0).args[1].url).to.equal(config.url + '/users?roles=courier');
                return done();
            }
        });
    });

    it('should return online users only', function (done) {
        var spy = sinon.spy(reqHandler);

        api({ requestHandler: spy }).users.get({ online: true }, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) {  return done(err); }
                res.should.have.length(2);
                res[0].username.should.equal('online');
                spy.should.have.been.calledOnce;
                expect(spy.getCall(0).args[1].url).to.equal(config.url + '/users?online=true');
                return done();
            }
        });
    });

    it('should set user offline', function (done) {
        var reqHandler = require('../../lib/reqHandlerPromised')();
        var user = _.findWhere(fixtures.users, {username: 'online'});
        var spy = sinon.spy(reqHandler);

        getToken(conf.rootUser, conf.rootPassword)
        .then(function (accessToken) {
            return api({ requestHandler: spy }).users.setOnline(
                { id: user._id, props: { online: false } },
                { auth: { bearer: accessToken } }
            );
        })
        .then(function () {
            return api({ requestHandler: reqHandler }).users.getById(
                user._id,
                { auth: { bearer: accessToken } }
            );
        })
        .then(function (user) {
            spy.should.have.been.calledOnce;
            expect(spy.getCall(0).args[1].url).to.equal(config.url + '/users/' + user._id + '/online');
            user.online.should.equal(false);
            return done();
        })
        .catch(function (err) {
            return done(err);
        });
    });

    it('should set user online', function (done) {
        var reqHandler = require('../../lib/reqHandlerPromised')();
        var user = _.findWhere(fixtures.users, {username: 'online'});
        var spy = sinon.spy(reqHandler);

        getToken(conf.rootUser, conf.rootPassword)
        .then(function (accessToken) {
            return api({ requestHandler: spy }).users.setOnline({
                id: user._id,
                props: { online: true } },
                { auth: { bearer: accessToken } }
            );
        })
        .then(function () {
            return api({ requestHandler: reqHandler }).users.getById(
                user._id,
                { auth: { bearer: accessToken } }
            );
        })
        .then(function (user) {
            spy.should.have.been.calledOnce;
            expect(spy.getCall(0).args[1].url).to.equal(config.url + '/users/' + user._id + '/online');
            user.online.should.equal(true);
            return done();
        })
        .catch(function (err) {
            return done(err);
        });
    });
});
