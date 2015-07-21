require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    expect     = chai.expect,
    Promise    = require('bluebird'),
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler');

var should = chai.should();
chai.use(sinonChai);

describe('dispatching', function () {

    var accessToken, positionId;

    before(function (done) {
        var user = _.findWhere(fixtures.users, {username: 'admin'});
        getToken(user.profile.email, user.password)
        .then(function (token) {
            accessToken = token;
            var courier = _.findWhere(fixtures.users, {username: 'autodispatch'});
            var position = {
                coords: {
                    latitude:48.4189901,
                    longitude:17.0212386,
                    timestamp:1381878960618
                }
            };
            return postFixture('positions/' + courier._id, position, accessToken);
        }).then(function (pos) {
            positionId = pos._id;
            return done();
        }).catch(function (err) {
            return done(err);
        });
    });

    after(function (done) {
        done();
    });

    it('should find best courier', function (done) {
        api().dispatching.findAvailableCouriers(
            {
                pickupAddress: 'Parizska 23, Praha',
                dropAddress: 'Konevova 14, Praha',
                // onlineSince: '2015-01-07T15:45:00Z',
                deliveryDate: (new Date()).toJSON()
            }, {
                auth: { bearer: accessToken },
                callback: function (err, res) {
                    if (err) { return done(err); }
                    should.equal(res[0].courier.username, 'autodispatch');
                    should.exist(res[0].pickupTime);
                    should.exist(res[0].dropTime);
                    return done();
                }
        });
    });

    it('should create route for best courier based on delivery', function (done) {
        var delivery = {
            "trackingNr": "BA1000",
            "startDate": "2015-02-05T19:00:00.000Z",
            "company": "test",
            "priority": 1,
            "note": "pls call me 30 mins in advance",
            "addresses": [
              {
                "type": "drop",
                "consignee": "John Smith",
                "phoneNr": "00421903475680",
                "email": "john@john.john",
                "text": "Praha, Konevova 14, CZ",
                // "city": "Praha",
                // "street": "Konevova",
                // "housenumber": 14,
                // "countryCode": "CZ",
                "validFrom": "2014-09-25T14:00:45.702Z",
                "validTo": "2014-09-25T16:00:45.708Z",
                "coords": {
                  "latitude": 48.147183,
                  "longitude": 17.100051
                }
              },
              {
                "type": "pickup",
                "consignee": "Peter Smith",
                "phoneNr": "00421915694707",
                "email": "",
                "text": "Bratislava, Kazanska 3, SK",
                // "city": "Bratislava",
                // "street": "Kazanska",
                // "housenumber": 3,
                // "countryCode": "SK",
                "validFrom": "2014-09-25T06:00:04.168Z",
                "validTo": "2014-09-25T07:00:04.177Z",
                "coords": {
                  "latitude": 48.131589,
                  "longitude": 17.198913
                }
              }
            ]
          };

        api().dispatching.autoAssign(
            {
                delivery: delivery
            }, {
                headers: { Authorization: 'Bearer ' + accessToken },
                callback: function (err, res) {
                    if (err) { return done(err); }
                    // should.exist(res.startDate);
                    // should.exist(res.endDate);
                    // should.exist(res.courier);
                    // should.equal(res.state, 'Assigned');
                    should.equal(res.message, 'The delivery was successfully assigned.');
                    return done();
                }
        });
    });
});
