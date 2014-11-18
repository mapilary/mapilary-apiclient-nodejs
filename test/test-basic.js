var should = require('chai').should();
var e = require('../lib/errorTypes');
var client = require('../lib/client');
var conf = require('./config.test.json');

describe('mapilary-apiclient basic tests', function () {

    var url = 'http://localhost:8888';
    var accessToken = conf.accessToken;

    it('should have resources', function () {
        var api = client();
        api.should.have.property('users');
        api.should.have.property('deliveries');
        api.should.have.property('routes');
        api.should.have.property('companies');
        api.should.have.property('positions');
        api.should.have.property('geocode');
        api.should.have.property('authentication');
    });

    it('should return error when getting non valid user', function (done) {
        client()
            .users.getUser({id: 'xxxxxxxxxxxxxxxxxxxxxxxx'}, { 
                headers: { Authorization: 'Bearer ' + accessToken },
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
        client({ url: url })
            .users.getUser({id: 'this'}, { 
                headers: { Authorization: 'Bearer ' + accessToken },
                callback: function (err, courier) {
                    // console.log(err, courier);
                    if (err) {
                        return done(err);
                    }
                    courier.should.have.property('username');
                    done();                    
                }
            });
    });
});