# Build Center Server

## Installation

Copy the sample configuration from `config.js.sample` to `config.js` and modify it.

Install dependencies with `npm install`.

The development environment will be used by default which returns error messages to the client and uses SQLite for storage.

Use the production environment by setting the `NODE_ENV` environment variable to `production`. This hides error messages from the client and uses MySQL for storage.

Finally start the server with `npm start`.

At this point, any interaction with the REST API requires a API key which must currently be added manually to the database. Refer to documentation under `test/manual`.

## Testing

There is a simple script under `test/manual` for testing the REST API.
