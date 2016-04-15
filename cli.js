#!/usr/bin/env node

var _       = require('underscore'),
    program = require('commander'),
    errors  = [],
    schema;

program
  .version(require('./package.json').version)
  .option('-e --url [url]', 'url of api-docs endpoint eg. https://api.mapilary.com/v1')
  .option('-q, --query [query]', 'query eg. users.getById[\'{"id": "this"}\']')
  .option('-u, --user [string]', 'username#company or username@company.com')
  .option('-p, --pass [string]', 'password')
  .option('--noauth', 'skip authenication')
  .option('list', 'list all available methods')
  .option('info', 'info about method eg. users.getById')
  .parse(process.argv);

if (program.list) {
    schema = require('./schema.json');
    _.each(schema.apis, function (api) {
        console.log(api.path.substring(1));
        _.each(api.apiDeclaration.apis, function (api) {
            _.each(api.operations, function (operation) {
                console.log('    .' + operation.nickname);
            });
        });
    });
    process.exit(0);
}

if (program.info) {
    schema = require('./schema.json');
    if (program.args.length === 0) {
        console.error('Missing method name');
        program.help();
    }
    var method = program.args[0].split('.');
    var found = _.some(schema.apis, function (api) {
        if  (api.path.substring(1) === method[0]) {
            return _.some(api.apiDeclaration.apis, function (api) {
                return _.some(api.operations, function (operation) {
                    if (operation.nickname === method[1]) {
                        console.log(operation);
                        return true;
                    }
                });
            });
        }
    });
    if (!found) {
        console.error('Method not found: %s', program.args[0]);
        process.exit(1);
    }
    process.exit(0);
}

if (!program.url) {
    errors.push('Missing url');
}

if (!program.query) {
    errors.push('Missing query');
}

if (!program.noauth) {
    if (!program.user) {
      errors.push('Missing user');
    }

    if (!program.pass) {
      errors.push('Missing password');
    }
}

if (errors.length > 0) {
    console.error(errors.join('\n'));
    program.help();
}

var client = require('./lib/client')({ promise: true });
var query = program.query.match(/(.*)(?:\[(.*)\])$/);
if (!query || query.length !== 3) {
    console.error('Wrong format of query. Must be domain.action[params]');
    process.exit(1);
}

var domain = query[1].split('.');
if (!domain || domain.length !== 2) {
    console.error('Wrong format of query. Must be domain.action[params]');
    process.exit(1);
}

if (!client[domain[0]]) {
    console.error('Unknown domain: %s', domain[0]);
    process.exit(1);
}
if (!client[domain[0]][domain[1]]) {
    console.error('Wrong format of action: %s.%s', domain[0], domain[1]);
    process.exit(1);
}

try {
    var args = JSON.parse(query[2]);
} catch (err) {
    console.error('Error parsing query: %s is not valid json.', query[2]);
    process.exit(1);
}

client.url(program.url);

if (program.noauth) {
    return client[domain[0]][domain[1]](args)
    .then(function (obj) {
        console.log(JSON.stringify(obj, null, 2));
    })
    .catch(function (err) {
        console.error('Error occured', err);
    });
}

client.authentication.login(null, {
    auth: {
        user: program.user,
        pass: program.pass
    }
})
.then(function (token) {
    console.log('Granted access_token: %s', token.access_token);
    console.log('Invoking query: %s.%s with: %s', domain[0], domain[1], JSON.stringify(args));
    return client[domain[0]][domain[1]](args, { auth: { bearer: token.access_token } });
})
.then(function (obj) {
    console.log(JSON.stringify(obj, null, 2));
})
.catch(function (err) {
    console.error('Error occured', err);
});
