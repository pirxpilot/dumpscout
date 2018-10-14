[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][gemnasium-image]][gemnasium-url]

# dumpscout

Dump/backup conversations from helpscout.com to mongo DB

## Install

```sh
$ npm install --global dumpscout
```

## Usage

Helpscout API OAuth 2.0 authorization - see [docs][oauth2] for details.

```
dumpscout [options]

Options:
  --client_id      [required]
  --client_secret  [required]
  --database       [default: "mongodb://localhost:27017/helpscout"]

```


## License

MIT © [Damian Krzeminski](https://code42day.com)

[npm-image]: https://img.shields.io/npm/v/dumpscout.svg
[npm-url]: https://npmjs.org/package/dumpscout

[travis-url]: https://travis-ci.org/code42day/dumpscout
[travis-image]: https://img.shields.io/travis/code42day/dumpscout.svg

[gemnasium-image]: https://img.shields.io/gemnasium/code42day/dumpscout.svg
[gemnasium-url]: https://gemnasium.com/code42day/dumpscout

[oauth2]: https://developer.helpscout.com/mailbox-api/overview/authentication/#client-credentials-flow
