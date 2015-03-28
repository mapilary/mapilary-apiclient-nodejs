require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    expect     = chai.expect,
    sinon      = require('sinon'),
    expect     = chai.expect,
    reqHandler = require('../../lib/reqHandler')();

chai.should();

describe('positions', function () {

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

    it('should store courier position', function (done) {

        var courier = _.findWhere(fixtures.users, {username: 'online'});

        var coords = {
            latitude: 49,
            longitude: 17,
            timestamp: new Date().getTime()
        };

        api()
            .positions.create({
                courier: courier._id,
                position: {
                    timestamp: new Date().getTime(),
                    coords: coords
                }
            }, { 
                auth: { bearer: accessToken },
                callback: function (err, res) {
                    if (err) { return done(err); }
                    // expect(res).to.be.undefined;
                    return done();
                }
            });
    });

    it('should retrieve couriers position', function (done) {
        var spy = sinon.spy(reqHandler);
        var courier = _.findWhere(fixtures.users, {username: 'online'});

        api({ requestHandler: spy })
            .positions.get({ courier: courier._id }, { 
                auth: { bearer: accessToken },
                callback: function (err, positions) {
                    if (err) { return done(err); }
                    expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/positions?courier=' + courier._id);
                    positions.should.be.a('array');
                    positions.should.have.length(1);
                    done();
                }
            });
    });
});