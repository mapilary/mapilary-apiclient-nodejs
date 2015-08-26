require('../common.js');
var _          = require('underscore'),
    Promise    = require('bluebird');
    chai       = require('chai'),
    sinon      = require('sinon'),
    request    = require('request'),
    expect     = chai.expect;

chai.should();
Promise.promisifyAll(request);

describe('permissions', function () {

    it('should be allowed to call triggerDispatches', function (done) {
        request.postAsync(config.url + '/triggerDispatches')
        .spread(function(response, body) {
            if (response.statusCode !== 200) {
                throw new Error(JSON.parse(body).message);
            }
        })
        .then(function (res) {
            return done();
        })
        .catch(function (err) {
            return done(err);
        });
    });

    it('should be allowed to set courier status', function (done) {
        var user = _.findWhere(fixtures.users, {username: 'online'});

        api({ promise: true }).users.setOnline({
            id: user._id,
            props: { online: true } }
        )
        .then(function () {
            return done();
        })
        .catch(function (err) {
            return done(err);
        });
    });
});
