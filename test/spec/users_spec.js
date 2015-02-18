require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    expect     = chai.expect,
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler')(),
    conf       = require('../config.test.json');

chai.should();
chai.use(sinonChai);

describe('users', function () {

    var accessToken;

    before(function (done) {
        getToken('admin@test.com', 'admin')
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
            headers: { Authorization: 'Bearer ' + accessToken },
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
              "email": "alvaradokim@test.com"
            },
            "roles": ["courier"]
        };

        api().users.create([courier], { 
            headers: { Authorization: 'Bearer ' + accessToken },
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
            headers: { Authorization: 'Bearer ' + accessToken },
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
            headers: { Authorization: 'Bearer ' + accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                spy.should.have.been.calledOnce;
                expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/users?roles=courier');
                return done();
            }
        });
    });

    it('should return online users only', function (done) {
        var spy = sinon.spy(reqHandler);

        api({ requestHandler: spy }).users.get({ online: true }, { 
            headers: { Authorization: 'Bearer ' + accessToken },
            callback: function (err, res) {
                if (err) {  return done(err); }
                res.should.have.length(2);
                res[0].username.should.equal('online');
                spy.should.have.been.calledOnce;
                expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/users?online=true');
                return done();
            }
        });
    });

});