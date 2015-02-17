// var api = require('./clientpromise')({schema: 'schema.json', accessToken: '12345'});
// var tokenAuth = require('./auth/token');
var Promise = require('bluebird');
var e = require('./lib/errorTypes');
var basicAuth = require('./lib/auth/basic');
var requestHandler = require('./lib/reqHandlerPromised');
// var api = require('./index')({requestHandler: requestHandler});

var apiAsync = require('./lib/promisifier')(require('./index')({requestHandler: requestHandler}));

apiAsync.url('http://127.0.0.1/api');

// var apiPromise = Promise.promisifyAll(require('./index')());

// api.users.getUser.operation.apiObject.apiDeclaration.authorizations = {
// 	apiKey: {
// 		type: 'apiKey',
// 		passAs: 'header',
// 		keyname: 'Authorization'
// 	}
// };

// api.authentication.auth(basicAuth('finch@mapilary.com', 'finchisko'));
// api.authentication.auth(tokenAuth('1234'));

// console.log(basicAuth('finch@mapilary.com', 'finchisko'));

function callback (err, res) {
    if (err) {
        return console.error(err);
    }
    console.log(res);
}

// api.users.getUser({id: 'this'}, { 
//     headers: { Authorization: 'Bearer 12345' },
//     callback: callback
// });

// api.users.getUser({id: 'this'}, { headers: { Authorization: 'Bearer 12345' } })
//     .then(function (res) {
//         console.log(res);
//     })
//     .catch(function (res) {
//         console.error(res.response.body);
//     });



apiAsync.authentication.userLoginAsync([{userId: '', password: ''}])
    .then(function (res) {
        console.log(res);
    })
    .catch(function (err) {
        console.log(err instanceof e.Unauthorized);
        console.error(err);
    });

// // console.log(api.auth('apiKey', '12345'));
// // api.users.auth('Bearer 3gm/aJ7JDaQAZv3P0G9T14wr29VVoYq9VTMgcfqlGlU=');
// apiAsync.users.getUserAsync({id: 'this'}, { headers: { Authorization: 'Bearer 12345' } })
//     .then(function (res) {
//         console.log(res);
//     })
//     .catch(function (err) {
//         console.error(err);
//     });