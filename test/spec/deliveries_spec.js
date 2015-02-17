require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    Promise    = require('bluebird'),
    expect     = chai.expect,
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler'),
    conf       = require('../config.test.json');

chai.should();
chai.use(sinonChai);

describe('deliveries', function () {

    it('should create new delivery', function (done) {
        var delivery = {
            "trackingNr": "BA1000",
            "startDate": "2014-09-24T22:00:00.000Z",
            "company": "mapilary",
            "priority": 1,
            "note": "pls call me 30 mins in advance",
            "routeStartOffset": 1000,
            "duration": 7200,
            // "deviceTokens": [],
            "courierRating": null,
            "state": "Created",
            "addresses": [
              {
                "type": "drop",
                "consignee": "John Smith",
                "phoneNr": "00421903475680",
                "email": "john@john.john",
                "city": "Bratislava",
                "street": "Palisady 10",
                "countryCode": "Slovakia",
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
                "city": "Bratislava",
                "street": "Kazanska 3",
                "countryCode": "Slovakia",
                "validFrom": "2014-09-25T06:00:04.168Z",
                "validTo": "2014-09-25T07:00:04.177Z",
                "coords": {
                  "latitude": 48.131589,
                  "longitude": 17.198913
                }
              }
            ]
        };
        api().deliveries.create([delivery], {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.should.include(_.omit(delivery, 'addresses'));
                _.omit(res.addresses[0], '_id', 'id').should.eql(delivery.addresses[0]);
                _.omit(res.addresses[1], '_id', 'id').should.eql(delivery.addresses[1]);
                done();
            }
        });
    });

    it('should update delivery', function (done) {
        var delivery = _.findWhere(fixtures.deliveries, {trackingNr: 'BA1000'});
        api().deliveries.update({
                id: delivery._id,
                props: {
                    // company: 'test',
                    note: 'new note'
                }
            }, {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                console.log(res);
                res.note.should.equal('new note');
                done();
            }
        });        
    });

    it('should return error on update non existing delivery', function (done) {
        api().deliveries.update({
                id: 'AABBCCDDEEFFAABBCCDDEEFF',
                props: {
                    note: 'new note'
                }
            }, {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                err.message.should.equal('Resource not found');
                done();
            }
        });        
    });

    it('should delete delivery', function (done) {
        var delivery = _.findWhere(fixtures.deliveries, {trackingNr: 'BA1001'});
        api().deliveries.delete({id: delivery._id}, {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.message.should.equal('delivery has been deleted');
                done();
            }
        });
    });

});
