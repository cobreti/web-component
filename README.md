# Web-Components

Library containing utilities to help use and develop web-components.

### Web component Loader

class providing functionalities to load and insert web-component to the DOM.

Example:

```
private _webComponentLoader: WebComponentLoader = new WebComponentLoader();

    async init() {
        await this._webComponentLoader.loadWebComponentsWithDirectoryUrl(`/web-components.${import.meta.env.MODE}.json`);
    }
```

web-components.development.json being

```
[
    {
        "name": "vanilla web component",
        "url": "http://localhost:8002/index.es.js"
    }
]
```

### HTMLElementWithApi

Utility class to inherit from when building a web-component that
provides an API.
The API is accessible using element.webComponentApi

Example:

```
export default class AddressFormComponent extends HTMLElementWithApi<AddressFormApi> {

    constructor() {
        super( () => new AddressFormApi() );
    }
}
```