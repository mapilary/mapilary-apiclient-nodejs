# Implementations

This module requires schema to be downloaded in advance:

`npm install -g fetch-swagger-schema`
`fetch-swagger-schema <url to a swagger api docs> <destination>`

the generated schema json file will be at <destination>

## Cli client

```
node cli.js -e http://localhost:8888/api-docs -q users.getUser[{id:this}] -t 12345
```