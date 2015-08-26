## Installing module

```
npm install mapilary/mapilary-apiclient-nodejs
```

## Using module as library

This module should be used as library in your project, which is based on Mapilary API.

### Usage

1. First include module in your project:

```
var api = require('mapilary-apiclient')({ promise: true });
```

2. Set url of mapilary endpoint

```
api.url('https://api.mapilary.com/v1');
```

### Obtaining access token

```
var accessToken;
api.authentication.login(null, {
    auth: {
        user: 'username#company',
        pass: 'password'
    }
}).then(function (token) {
    accessToken = token.access_token;
});
```

### Example of calling API method

```
api.users.getById('this', { auth: { bearer: accessToken } })
.then(function (user) {
    if (!user) {
        throw new Error('Authentication error: Invalid access_token');
    }
    //user variable now contains user data
});
```

Remark: 'this' is special user id, which references to user with provided accessToken

## CLI client

List all available methods:

```
node cli.js list
```

Info about method:

Example:
```
node cli.js info users.getById
```

Examples:

```
node cli.js -e https://api.mapilary.com/v1 -q users.getById[{id:this}] -u username#company -p password
```

Get user(s) by username
```
node cli.js -e https://api.mapilary.com/v1 -q users.get[{username:username}] -u username#company -p password
```

In case you want to pass multiple parameters:
```
node cli.js -e http://localhost:4444 -q users.get[{username:username\,company:mycompany}] -u username#company -p password
```

## For developers

This module requires schema to be downloaded in advance:

`npm install -g fetch-swagger-schema`

Fetch and save schema with: fetch-swagger-schema <url to a swagger api docs> <destination>
the generated schema json file will be at <destination>

`fetch-swagger-schema http://127.0.0.1:3000/api-docs schema.json`
