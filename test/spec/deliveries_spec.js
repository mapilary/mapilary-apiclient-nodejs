require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    Promise    = require('bluebird'),
    expect     = chai.expect,
    e          = require('../../lib/errorTypes'),
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler');

chai.should();
chai.use(sinonChai);

describe('deliveries', function () {

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

    it('should get delivery by id', function (done) {
        var delivery = _.findWhere(fixtures.deliveries, {trackingNr: 'BA1000'});
        api().deliveries.getById(delivery._id, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.trackingNr.should.equal('BA1000');
                done();
            }
        });
    });

    it('should create new delivery', function (done) {
        var delivery = {
            "trackingNr": "NEWDELIVERY",
            "startDate": "2014-09-24T22:00:00.000Z",
            // "company": "mapilary",
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
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                // console.log(res);
                res[0].should.include(_.omit(delivery, 'addresses'));
                _.omit(res[0].addresses[0], '_id', 'id').should.eql(delivery.addresses[0]);
                _.omit(res[0].addresses[1], '_id', 'id').should.eql(delivery.addresses[1]);
                done();
            }
        });
    });

    it('should get delivery by trackingNr', function (done) {
        var reqHandler = require('../../lib/reqHandlerPromised')();
        var spy = sinon.spy(reqHandler);
        api({ requestHandler: spy }).deliveries.get({trackingNr: 'BA1000'}, {
            auth: { bearer: accessToken }
        })
        .then(function (res) {
            spy.should.have.been.calledOnce;
            expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/deliveries?trackingNr=BA1000');
            res[0].trackingNr.should.equal('BA1000');
            done();
        })
        .catch(function (err) {
            done(err);
        });
    });

    it('should get deliveries by route id', function (done) {
        var reqHandler = require('../../lib/reqHandlerPromised')();
        var spy = sinon.spy(reqHandler);

        var route = _.findWhere(fixtures.routes, {note: 'update'});

        var delivery = {
            "trackingNr": "DELIVERYWITHROUTE",
            "state": "Assigned",
            "route": route._id
        };

        api({ requestHandler: reqHandler }).deliveries.create([delivery], {
            auth: { bearer: accessToken }
        })
        .then(function () {
            return api({ requestHandler: spy }).deliveries.get({route: route._id}, {
                auth: { bearer: accessToken }
            });
        })
        .then(function (res) {
            spy.should.have.been.calledOnce;
            expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/deliveries?route=' + route._id);
            res[0].trackingNr.should.equal("DELIVERYWITHROUTE");
            res[0].route.should.equal(route._id);
            done();
        })
        .catch(function (err) {
            done(err);
        });
    });

    it('should update delivery', function (done) {
        var delivery = _.findWhere(fixtures.deliveries, {trackingNr: 'BA1000'});
        api().deliveries.update({
                id: delivery._id,
                props: {
                    note: 'new note'
                }
            }, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.note.should.equal('new note');
                done();
            }
        });
    });

    it('should replace delivery', function (done) {
        var delivery = _.findWhere(fixtures.deliveries, {trackingNr: 'BA1000'});
        api().deliveries.replace({
                id: delivery._id,
                props: {
                    trackingNr: 'KE1000',
                    courierRating: 5,
                    note: 'new note'
                }
            }, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.should.have.keys('_id', 'addresses', 'company', 'courierRating', 'deviceTokens', 'trackingNr', 'note', 'priority', 'state');
                res.addresses.should.be.empty();
                res.courierRating.should.equal(5);
                res.trackingNr.should.equal('KE1000');
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
            auth: { bearer: accessToken },
            callback: function (err, res) {
                // console.log(err, res.statusCode);
                err.should.be.an.instanceof(e.InvalidRequestError);
                err.message.should.equal('No delivery with given id exists!');
                done();
            }
        });
    });

    it('should return error when deleting non existing delivery', function (done) {
        api().deliveries.delete({id: 'AABBCCDDEEFFAABBCCDDEEFF'}, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) {
                    // console.log(res);
                    err.should.be.an.instanceof(e.ResourceNotFound);
                    err.message.should.equal('No delivery with given id exists!');
                    return done();
                }
                return done(new Error('unexpected success'));
            }
        });
    });

    it('should delete delivery', function (done) {
        var delivery = _.findWhere(fixtures.deliveries, {trackingNr: 'BA1001'});
        api({simple: false, resolveWithFullResponse: true }).deliveries.delete({id: delivery._id}, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.statusCode.should.equal(204);
                done();
            }
        });
    });

});
