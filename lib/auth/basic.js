var btoa = require('btoa');

module.exports = function basicAuth (userId, password) {
    var tok = userId + ':' + password;
    var hash = btoa(tok);
    return 'Basic ' + hash;
};