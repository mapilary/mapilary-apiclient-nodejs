#!/bin/sh

var _ = require('underscore');

var program = require('commander')
  .version(require('./package.json').version)
  .option('-e --url [url]', 'url of api-docs endpoint eg. https://api.mapilary.com/dev/api-docs')
  .option('-q, --query [query]', 'query eg. users.getUser[{id:this}]')
  .option('-t, --token [string]', 'API access token')
  .parse(process.argv);

if (!program.url || !program.query || !program.token) {
	program.help();
}

var query = program.query.split('.');
var route = query[0];
var action = query[1].match(/(.*)(?:\[(.*)\])$/);
var params = action[2] || '{}';

if (!action) {
	throw new Error ('Wrong format of query. Must be route.action[params]');
}

_.forEach(params.match(/(\w+)/g), function (word) {
	params = params.replace(word, '"' + word + '"');
});

params = JSON.parse(params);
action = action[1];

var client = require('./lib/client')({
	url: program.url,
	accessToken: program.token
});

console.log('Invoking %s.%s with: %s\n', route, action, JSON.stringify(params));

client[route][action](params, { headers: { Authorization: 'Bearer ' + program.token } })
	.then(function (obj) {
		console.log(JSON.parse(obj, 1));
	})
	.catch(function (res) {
		console.log({ status: res.statusCode, response: res.response.body });
	});