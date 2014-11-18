var should = require('chai').should();
var client = require('../lib/client');
var conf = require('./config.test.json');

describe('mapilary-apiclient positions', function () {

    var url = conf.url;
    var userId = '5446aa8ef24e3bff50eb3b1b';
    var company = 'mapilary';
    var accessToken = conf.accessToken;

    it('should store courier position', function (done) {

        var coords = {
            latitude: 27.12,
            longitude: 46.12,
            timestamp: 1415806555820
        };

        client({ url: url })
            .positions.createPosition({
                courier: userId,
                Position: {
                    courier: userId,
                    company: company,
                    timestamp: new Date().getTime(),
                    coords: coords
                }
            }, { 
                headers: { Authorization: 'Bearer ' + accessToken },
                callback: function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    return done();
                }
            });
    });

    it('should retrieve couriers position', function (done) {
        client({ url: url })
            .positions.getPositions({}, { 
                headers: { Authorization: 'Bearer ' + accessToken },
                callback: function (err, positions) {
                    if (err) {
                        return done(err);
                    }
                    positions.should.be.a('array');
                    done();
                }
            });
    });
});