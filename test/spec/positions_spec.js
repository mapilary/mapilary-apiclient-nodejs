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

        //1410932792207, 17.54, 16.6, 100
        var coords = {
            accuracy: 100,
            latitude: 17.54,
            longitude: 16.6,
            timestamp: 1410932792207
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

    it('should retrieve courier positions', function (done) {
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
                    positions[0].company.should.equal(courier.company);
                    positions[0].coords.accuracy.should.equal(100);
                    positions[0].coords.latitude.should.equal(17.54);
                    positions[0].coords.longitude.should.equal(16.6);
                    return done();
                }
            });
    });

    it('should retrieve last positions of all couriers', function (done) {
        var spy = sinon.spy(reqHandler);
        var courier = _.findWhere(fixtures.users, {username: 'online'});

        api({ requestHandler: spy })
            .positions.getLastPositions({}, {
                auth: { bearer: accessToken },
                callback: function (err, positions) {
                    if (err) { return done(err); }
                    expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/positions/lastPositions');
                    positions.should.be.a('array');
                    positions.should.have.length(2);

                    var courier = _.findWhere(fixtures.users, { username: 'online' }),
                        position = _.findWhere(positions, { courier: courier._id });

                    position.company.should.equal(courier.company);
                    position.coords.accuracy.should.equal(100);
                    position.coords.latitude.should.equal(17.54);
                    position.coords.longitude.should.equal(16.6);

                    courier = _.findWhere(fixtures.users, { username: 'autodispatch' });
                    position = _.findWhere(positions, { courier: courier._id });

                    position.company.should.equal(courier.company);
                    position.coords.accuracy.should.equal(50);
                    position.coords.latitude.should.equal(48.4189901);
                    position.coords.longitude.should.equal(17.0212386);

                    return done();
                }
            });
    });

});
