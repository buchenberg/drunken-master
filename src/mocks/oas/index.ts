import petstore from './petstore.json';
import uberApi from './uber.json'

export const specs = [
    {
        "title": "Petstore API",
        "docpath": "/docs/petstore",
        "oas": petstore
    },
    {
        "title": "Uber API",
        "docpath": "/docs/uber",
        "oas": uberApi
    }
]