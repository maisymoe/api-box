# api-box

An API to display a message in a box

## Usage

1. Install dependencies:

```
pnpm i
```

2. Build the project:

```
pnpm build
```

3. Start the server:

```
pnpm start
```

## Configuration

You can configure api-box in several ways.

### Changing the port

The default port is `3000`.

One can configure the port api-box runs on by (in order of priority):
* Setting the `AB_PORT` environment variable to the desired port
* Passing the desired port as the first argument

### Changing the character limit

The default limit is `500`.

One can configure the character limit by (in order of priority):
* Setting the `AB_CHAR_LIMIT` environment variable to the desired limit
* Passing the desired limit as the second argument

### Censoring profanity

By default, api-box will censor any profanity.

One can configure this by (in order of priority):
* Setting the `AB_CENSOR` environment variable to `true` or `false` respectively
* Passing `true` or `false` as the third argument

### Strict mode

api-box also supports a "strict mode" for profanity filtering, which will deny any requests containing profanity rather than just filtering them.

This is disabled by default.

One can configure this by (in order of priority):
* Setting the `AB_CENSOR_STRICT` environment variable to `true` or `false` respectively
* Passing `true` or `false` as the fourth argument