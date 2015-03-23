var fs        = require('fs'),
    path      = require('path'),
    generator = require('swagger-client-generator');

module.exports = function (opts) {
    opts = opts || {};
    var handler = opts.requestHandler;
    if (!handler) {
         if (!!opts.promise) {
            handler = require('./reqHandlerPromised')(opts);
         } else {
            handler = require('./reqHandler')(opts);
         }         
    } else {
        console.log('[INFO]: Using provided request handler.');
    }

    var schemaJSON, schema = opts.schema || 'schema.json';

    if (fs.existsSync(schema)) {
        schemaJSON = fs.readFileSync(path.resolve(schema));
    } else if (fs.existsSync(path.join(__dirname, schema))) {
        schemaJSON = fs.readFileSync(path.resolve(__dirname, schema));
    } else if (fs.existsSync(path.join(__dirname, '..', schema))) {
        schemaJSON = fs.readFileSync(path.resolve(__dirname, '..', schema));
    } else {
        throw new Error('Schema not found');
    }

    // console.log(schemaJSON.apis[2].apiDeclaration.authorizations);
    var api = generator(JSON.parse(schemaJSON), handler);

    if (opts.accessToken) {
    	api.auth(opts.accessToken);
    }
    return api;
}