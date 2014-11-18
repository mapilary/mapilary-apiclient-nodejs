var fs        = require('fs'),
    path      = require('path'),
    generator = require('swagger-client-generator');

module.exports = function (opts) {
    opts = opts || {};
    var handler = opts.requestHandler;
    if (!handler) {
         if (opts.promise) {
            console.log('Using handler: reqHandlerPromised');
            handler = require('./reqHandlerPromised');
         } else {
            console.log('Using handler: reqHandler');
            handler = require('./reqHandler');
         }         
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