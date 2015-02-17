require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    expect     = chai.expect,
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler'),
    conf       = require('../config.test.json');

chai.should();
chai.use(sinonChai);

describe('users', function () {

    it('should get user', function (done) {
        var user = _.findWhere(fixtures.users, {username: 'online'});
        api().users.getById(user._id, {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
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
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.username.should.equal('akim');
                res.company.should.equal('test');
                new Date(res.registrationDate).getTime().should.equal(registered.getTime());
                res.profile.should.include(courier.profile);
                res.roles.should.eql(['courier']);
                return done();
            }
        });
    });

    it('should delete user', function (done) {
        var user = _.findWhere(fixtures.users, {username: 'delete'});
        api().users.delete({ id: user._id }, {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.message.should.equal('user has been deleted');
                done();
            }
        });
    });    

    it('should only return users with role courier', function (done) {
        var spy = sinon.spy(reqHandler);

        api({ requestHandler: spy }).users.get({ roles: 'courier' }, { 
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                spy.should.have.been.calledOnce;
                // console.log(res);
                expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/users?roles=courier');
                return done();
            }
        });
    });

    it('should return online users only', function (done) {
        var spy = sinon.spy(reqHandler);

        api({ requestHandler: spy }).users.findOnline({}, { 
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                if (err) { 
                    console.error(err.message);
                    return done(err);
                }
                res.should.have.length(1);
                spy.should.have.been.calledOnce;
                expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/users/findOnline');
                return done();
            }
        });
    });

});