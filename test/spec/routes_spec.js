require('../common.js');
var _          = require('underscore'),
    chai       = require('chai'),
    Promise    = require('bluebird'),
    expect     = chai.expect,
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler')(),
    e          = require('../../lib/errorTypes');

var should = chai.should();
chai.use(sinonChai);

describe('routes', function () {

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
    
    it('should find route by id', function (done) {
        var route = _.findWhere(fixtures.routes, {note: 'update'});
        api().routes.getById(route._id, {
            auth: { bearer: accessToken },
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
            auth: { bearer: accessToken },
            callback: function (err, res) {
                err.should.be.an.instanceof(e.ResourceNotFound);
                err.message.should.equal('Resource not found');
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
            "state": "Created"
        };
        api().routes.create([route], {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.should.be.instanceof(Array);
                res.should.have.length(1);
                res[0].should.include(_.omit(route, 'company'));
                done();
            }
        });
    });

    it('should delete route', function (done) {
        var route = _.findWhere(fixtures.routes, {note: 'delete'});
        api({simple: true, resolveWithFullResponse: true}).routes.delete({id: route._id}, {
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.statusCode.should.equal(204);
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
            auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                //console.log(res);
                res.note.should.equal('new note');
                done();
            }
        });
    });

    it('should return all routes', function (done) {
        api().routes.get({},
            {
                auth: { bearer: accessToken },
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
                embed: 'deliveries',
                startDate: '{gte}2015-01-07T00:00:00Z',
                endDate: '{lte}2015-01-08T00:00:00Z'
            }, {
                auth: { bearer: accessToken },
                callback: function (err, res) {
                    if (err) { return done(err); }
                    spy.should.have.been.calledOnce;
                    expect(spy.getCall(0).args[1].url).to.equal('http://localhost:8888/routes?startDate=%7Bgte%7D2015-01-07T00%3A00%3A00Z&endDate=%7Blte%7D2015-01-08T00%3A00%3A00Z&embed=deliveries');
                    res.should.have.length(2);
                    done();                 
                }
            });
    });
});
