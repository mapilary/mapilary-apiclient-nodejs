require('../common.js');
var NRP        = require('node-redis-pubsub'),
    chai       = require('chai'),
    expect     = chai.expect,
    sinon      = require('sinon'),
    sinonChai  = require('sinon-chai'),
    reqHandler = require('../../lib/reqHandler')(),
    config     = require('../config.json');

chai.should();
chai.use(sinonChai);

describe('companies', function () {

    var nrp;

    before(function (done) {
        nrp = new NRP(config.db.redis);
        done();
    });

    it('should register new company', function (done) {
        var company = {
            name: 'company' + new Date().getTime(),
            admin: {
                username: 'admin'
            }
        };

        nrp.on('company:' + company.name + ':register', function (res) {
            // console.log(res);
            res.data.company.name.should.equal(company.name);
            res.data.company.status.should.equal('created');
            return done();
        });

        api().companies.register(company, { 
            // auth: { bearer: accessToken },
            callback: function (err, res) {
                if (err) { return done(err); }
                res.message.should.equal('Company has been created. Check your email for how to active your account');
            }
        });
    });

});