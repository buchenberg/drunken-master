# Drunken Master

Drunken Master is an [Open API Specification](https://github.com/OAI/OpenAPI-Specification) (Swagger) based mock server. It incorporates OAS extensions to allow meta programming of mock data and supports hot rerouting of the server from the UI. The UI offers a swagger-ui and swagger-editor instance.


## Getting started

Clone or download this repository.

## Database

Drunken Master uses Apache [CouchDB](http://couchdb.apache.org/) to persist and version the OAS document. The easiest way to get a CouchDB instance up is by using [Docker](https://www.docker.com/). If you have Docker installed just run the following command. Make sure you edit the '/some/local/directory' part to match your system.

```
docker run -p 5984:5984 -d -v /some/local/directory:/usr/local/var/lib/couchdb --name drunken-master-db couchdb
``` 
At this point the CouchDB instance will be available on the Docker host at http://localhost:5985. You can view the CouchDB UI at http://localhost:5984/_utils/index.html.
## Server

Drunken Master uses the awesome Hapi.js server to serve up the mock routes and the static UI. Run the following command root directory to install server dependencies.

```
yarn
```

To start the server issue the following command.

```
yarn start
```

### Server Routes

The following routes are available on all instances of the Drunken Master server. They are baked right in and do not rely on OAS definitions.

#### GET /oas

This returns the OAS meta-document. The actual OpenAPI specification is in a child object called spec. The document also has an _id ('spec') and _rev (e.g. 142-a2b7348dae3d1e85fc60ae848ef60639) field.

#### GET /oas/json

This endpoint return a JSON version of the OpenAPI specification

#### GET /oas/yaml

Just like it says on the tin, this one serves a YAML representation of the OpenAPI specification.

#### PUT /oas

This will either create a new spec or add a revision to supercede the existing spec. In CouchDB data is immutable nothing is every really updated.

#### PUT /server

This call will initiate a reparsing of the OAS and a dynamic rerouting of the Hapi server. 
## Client

Drunken Master comes with a React based web UI. If you make any changes to the modules/ui code run the following at the server root to build and and deploy the bundles to modules/public where it will be served.

```
yarn build:client
```

To run the client in develop mode on port 3000 issue the following command.

```
yarn serve:client
```

## Mocks

Drunken Master uses a meta programming model to define mocks where possible. The following OAS extentions are used to define the required mock responses.

### x-example

This extention is used in the response schema definitions at the property level to define static values.


Example:

```
definitions:
  Pet:
    required:
      - id
      - name
    properties:
      id:
        type: integer
        format: int64
      name:
        type: string
        x-example: Fido
      tag:
        type: string
```

With the above configuration you will get a 200 response body like the following:

```
{
  "id": -2124524682215424,
  "name": "Fido",
  "tag": "JxCtjRrQml"
}
```

Note that in the above example response the name value has returned our x-example value of "Fido". Both the id and the tag fields are just using the schema type value to produce random values. Let's tighten up that response.

### x-mock

The x-mock extension provides a meta programing interface to [Chance.js](http://chancejs.com), a mock data generator library via the following child elements.

#### function

The function field of the x-mock extension is used to name the Chance.js function to use. Here's an example:

```
definitions:
  Pet:
    required:
      - id
      - name
    properties:
      id:
        type: integer
        format: int64
        x-mock:
          function: natural
      name:
        type: string
        x-example: Fido
      tag:
        type: string
```

The Chance.js library has a function [natural](http://chancejs.com/#natural) that will produce a random unsigned integer like so.


```
{
  "id": 8896932646748160,
  "name": "Fido",
  "tag": "egCCrOuL"
}
``` 

This is a good thing because we don't want signed integers for the id field. However maybe we know that the id field should always be from 1 to 9999. Since Chance.js can take an object as configuration we can pass that into the "options" field.

#### options

Since the Chance.js [natural](http://chancejs.com/#natural) function can take a config object with both "min" and "max" values let's go ahead and pass that in.


```
definitions:
  Pet:
    required:
      - id
      - name
    properties:
      id:
        type: integer
        format: int64
        x-mock:
          function: natural
          options:
            min: 1
            max: 9999
      name:
        type: string
        x-example: Fido
      tag:
        type: string
```

That will give us the following response.

```
{
  "id": 2722,
  "name": "Fido",
  "tag": "utW"
}
```

In this case the response will always come back with "Fido" as the name and a random natural number between 1 and 9999.


