# Implementations

This module requires schema to be downloaded in advance:

`npm install -g fetch-swagger-schema`

Fetch and save schema with: fetch-swagger-schema <url to a swagger api docs> <destination>
the generated schema json file will be at <destination>

`fetch-swagger-schema http://127.0.0.1:3000/api-docs schema.json`

## Cli client

```
node cli.js -e http://localhost:4444/api-docs -q users.getUser[{id:this}] -t 12345
```