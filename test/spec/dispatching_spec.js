require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    Promise    = require('bluebird'),
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler'),
    conf       = require('../config.test.json');

var should = chai.should();
chai.use(sinonChai);

describe('dispatching', function () {
    before(function (done) {
        Promise.using(mongo(), function (db) {
            return Promise.all([
                db.collection('positions').dropAsync().catch(function () {return false}),
                db.collection('users').findOneAsync({ username: 'online' })
            ]);
        }).then(function (result) {
            var courier = result[1];
            var position = {
                coords: {
                    latitude:48.4189901,
                    longitude:17.0212386,
                    timestamp:1381878960618
                }
            };
            return postFixture('positions/' + courier._id, position, conf.accessToken);
        }).then(function () {
            done();
        }).catch(function (err) {
            console.log(err);
            done(err);
        });
    });

    after(function (done) {
        done();
    });

    // it('should find best courier', function (done) {
    //     api().dispatching.findAvailableCouriers(
    //         {
    //             pickupAddress: 'Parizska 23, Praha',
    //             dropAddress: 'Konevova 14, Praha',
    //             // onlineSince: '2015-01-07T15:45:00Z',
    //             // courierId: '',
    //             deliveryDate: (new Date()).toJSON()
    //         }, {            
    //             headers: { Authorization: 'Bearer ' + conf.accessToken },
    //             callback: function (err, res) {
    //                 if (err) { return done(err); }
    //                 should.equal(res[0].courier.fullName, 'online Sheen Charlie');
    //                 should.exist(res[0].pickupTime);
    //                 should.exist(res[0].dropTime);
    //                 return done();
    //             }
    //     });
    // });

    // it('should create route for best courier based on delivery', function (done) {
    //     var delivery = {
    //         "trackingNr": "BA1000",
    //         "startDate": "2015-02-05T19:00:00.000Z",
    //         "company": "test",
    //         "priority": 1,
    //         "note": "pls call me 30 mins in advance",
    //         "addresses": [
    //           {
    //             "type": "drop",
    //             "consignee": "John Smith",
    //             "phoneNr": "00421903475680",
    //             "email": "john@john.john",
    //             "city": "Praha",
    //             "street": "Konevova",
    //             "housenumber": 14,
    //             "countryCode": "CZ",
    //             "validFrom": "2014-09-25T14:00:45.702Z",
    //             "validTo": "2014-09-25T16:00:45.708Z",
    //             "coords": {
    //               "latitude": 48.147183,
    //               "longitude": 17.100051
    //             }
    //           },
    //           {
    //             "type": "pickup",
    //             "consignee": "Peter Smith",
    //             "phoneNr": "00421915694707",
    //             "email": "",
    //             "city": "Bratislava",
    //             "street": "Kazanska",
    //             "housenumber": 3,
    //             "countryCode": "SK",
    //             "validFrom": "2014-09-25T06:00:04.168Z",
    //             "validTo": "2014-09-25T07:00:04.177Z",
    //             "coords": {
    //               "latitude": 48.131589,
    //               "longitude": 17.198913
    //             }
    //           }
    //         ]
    //       };

    //     api().dispatching.autoAssignDelivery(
    //         {
    //             delivery: delivery
    //         }, {            
    //             headers: { Authorization: 'Bearer ' + conf.accessToken },
    //             callback: function (err, res) {
    //                 if (err) { return done(err); }
    //                 console.log(res);
    //                 should.exist(res.startDate);
    //                 should.exist(res.endDate);
    //                 should.exist(res.courier);
    //                 should.equal(res.state, 'Assigned');
    //                 return done();
    //             }
    //     });
    // });


    it('should create route for best courier', function (done) {

        api().dispatching.autoAssign(
            {
                pickupAddress: 'Parizska 23, Praha',
                dropAddress: 'Konevova 14, Praha',
                // onlineSince: '2015-01-07T15:45:00Z',
                // courierId: '',
                deliveryDate: (new Date()).toJSON()
            }, {            
                headers: { Authorization: 'Bearer ' + conf.accessToken },
                callback: function (err, res) {
                    if (err) { return done(err); }
                    console.log(res);
                    should.exist(res.startDate);
                    should.exist(res.endDate);
                    should.exist(res.courier);
                    should.equal(res.state, 'Assigned');
                    return done();
                }
        });
    });
});