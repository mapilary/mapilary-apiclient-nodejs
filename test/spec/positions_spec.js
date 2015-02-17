require('../common.js');
var _      = require('underscore'),
    chai   = require('chai'),
    expect = chai.expect,
    conf   = require('../config.test.json');

chai.should();

describe('positions', function () {

    it('should store courier position', function (done) {

        var courier = _.findWhere(fixtures.users, {username: 'online'});

        var coords = {
            latitude: 48.1519682,
            longitude: 17.1211948,
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
                headers: { Authorization: 'Bearer ' + conf.accessToken },
                callback: function (err, res) {
                    if (err) { return done(err); }
                    expect(res).to.be.undefined;
                    return done();
                }
            });
    });

    it('should retrieve couriers position', function (done) {
        api()
            .positions.get({}, { 
                headers: { Authorization: 'Bearer ' + conf.accessToken },
                callback: function (err, positions) {
                    if (err) { return done(err); }
                    positions.should.be.a('array');
                    done();
                }
            });
    });
});