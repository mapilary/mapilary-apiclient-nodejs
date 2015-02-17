require('../common.js');
var should = require('chai').should(),
    e      = require('../../lib/errorTypes'),
    conf   = require('../config.test.json');

describe('basic tests', function () {

    it('should have resources', function () {
        var _api = api();
        _api.should.have.property('users');
        _api.should.have.property('deliveries');
        _api.should.have.property('routes');
        _api.should.have.property('companies');
        _api.should.have.property('positions');
        _api.should.have.property('geocode');
        _api.should.have.property('authentication');
    });

    it('should return error when getting non valid user', function (done) {
        api()
            .users.getById({id: 'xxxxxxxxxxxxxxxxxxxxxxxx'}, { 
                headers: { Authorization: 'Bearer ' + conf.accessToken },
                callback: function (err, user) {
                    if (user) {
                        return done(new Error('unexpected success'));
                    }
                    err.message.should.equal('User not found');
                    err.should.be.an.instanceof(e.ResourceNotFound);
                    done();                    
                }
            });
    });

    it('should return courier', function (done) {
        api()
            .users.getById({id: 'this'}, { 
                headers: { Authorization: 'Bearer ' + conf.accessToken },
                callback: function (err, courier) {
                    // console.log(err, courier);
                    if (err) { return done(err); }
                    courier.should.have.property('username');
                    done();                    
                }
            });
    });
});