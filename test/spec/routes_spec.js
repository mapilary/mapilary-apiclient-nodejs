require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    Promise    = require('bluebird'),
    expect     = chai.expect,
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler'),
    conf       = require('../config.test.json');

var should = chai.should();
chai.use(sinonChai);

describe('routes', function () {

    it('should find route by id', function (done) {
        var route = _.findWhere(fixtures.routes, {note: 'update'});
        api().routes.getById({id: route._id}, {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res._id.should.equal(route._id);
                done();
            }
        });
    });

    it('should not find route by id', function (done) {
        var route = _.findWhere(fixtures.routes, {note: 'update'});
        api().routes.getById({id: 'AABBCCDDEEFFAABBCCDDEEFF'}, {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                err.message.should.equal('route AABBCCDDEEFFAABBCCDDEEFF not found');
                if (res) { done(new Error('route was found')); }
                done();
            }
        });
    });
    it('should create new route', function (done) {
        var route = {
            "name": "my route",
            "company": "test",
            "startDate": "2015-01-25T08:30:00.000Z",
            "endDate": "2015-01-25T10:00:00.000Z",
            "note": "Dolor nulla ad sit nisi irure reprehenderit.",
            "state": "Created",
            "deliveries": [{
                "trackingNr": "BA1000",
                "startDate": "2014-09-24T22:00:00.000Z",
                "company": "test",
                "priority": 1,
                "note": "pls call me 30 mins in advance",
                "routeStartOffset": -0.5648803710933237,
                "duration": 7200,
                "courierRating": null,
                "state": "Created",
                "addresses": [{
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
                }]
            }]
        };
        api().routes.create([route], {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                console.log(res);
                if (err) { return done(err); }
                res.should.include(_.omit(route, 'deliveries'));
                var delivery = res.deliveries[0];
                delivery.trackingNr.should.equal('BA1000');
                delivery.startDate.should.equal('2014-09-24T22:00:00.000Z');
                delivery.company.should.equal('test');
                delivery.priority.should.equal(1);
                delivery.priority.should.equal(1);
                delivery.note.should.equal('pls call me 30 mins in advance');
                delivery.routeStartOffset.should.equal(-0.5648803710933237);
                delivery.duration.should.equal(7200);
                should.not.exist(delivery.courierRating);
                delivery.state.should.equal('Assigned');
                delivery.addresses[0].should.include(_.omit(route.deliveries[0].addresses[0], 'coords'));
                delivery.addresses[0].coords.should.eql(route.deliveries[0].addresses[0].coords);
                done();
            }
        });
    });

    it('should delete route', function (done) {
        var route = _.findWhere(fixtures.routes, {note: 'delete'});
        // console.log(route);
        api().routes.delete({id: route._id}, {
            headers: { Authorization: 'Bearer ' + conf.accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.message.should.equal('route has been deleted');
                done();
            }
        });
    });

    it('should update route', function (done) {
        var route = _.findWhere(fixtures.routes, {note: 'update'});
        // console.log(route);
        api().routes.update({
                id: route._id,
                props: {
                    deliveries: [],
                    // etr: {},
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

    it('should return all routes', function (done) {
        api().routes.get({},
            {
                headers: { Authorization: 'Bearer ' + conf.accessToken },
                callback: function (err, res) {
                    if (err) { return done(err); }
                    res.should.have.length(5);
                    done();                 
                }
            });
    });

    it('should return routes between two dates', function (done) {
        var spy = sinon.spy(reqHandler);
        api({ requestHandler: spy })
            .routes.get({
                // embed: 'deliveries',
                startDate: '{gte}2015-01-07T00:00:00Z',
                endDate: '{lte}2015-01-08T00:00:00Z'
            }, {
                headers: { Authorization: 'Bearer ' + conf.accessToken },
                callback: function (err, res) {
                    if (err) { return done(err); }
                    spy.should.have.been.calledOnce;
                    // expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/routes?startDate=%7Bgte%7D2015-01-07T16%3A00%3A00Z&endDate=%7Blte%7D2015-01-08T00%3A00%3A00Z&embed=deliveries');
                    res.should.have.length(2);
                    // console.log(res);
                    done();                 
                }
            });
    });
});
