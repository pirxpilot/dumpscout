const request = require('superagent');
const async = require('async');
const rateLimit = require('rate-limit');
const debug = require('debug')('dumpscout');

module.exports = dumpscout;

// let's do 1 per second to be nice to helpscout servers
// see: https://developer.helpscout.com/mailbox-api/overview/rate-limiting/
const queue = rateLimit.createQueue({ interval: 1001 });

function getBearerToken({ client_id, client_secret }, fn) {
  request
    .post('https://api.helpscout.net/v2/oauth2/token')
    .send({
      grant_type: 'client_credentials',
      client_id,
      client_secret
    })
    .end(function(err, res) {
      if (err) { return fn(err); }
      fn(null, res.body.access_token);
    });
}

function api(url, { accessToken, page }, fn) {
  request
    .get(url)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${accessToken}`)
    .query({
      page
    })
    .end(function(err, res) {
      fn(err, res.body);
    });
}

function slowApi() {
  var a = arguments;
  queue.add(function() {
    api.apply(null, a);
  });
}

function iterate(url, type, { accessToken }, fnOnItem, fn) {
  var page = 1;

  async.doUntil(function(fn) {
    slowApi(url, {
      accessToken,
      page
    }, function(err, r) {
      if (err) { return fn(err); }
      let { _links: { next }, _embedded } = r;
      if (!_embedded) {
        return fn(null, next);
      }
      debug('Next is %j', next);
      debug('Fetched %d items.', _embedded[type].length);
      page += 1;
      async.each(_embedded[type], fnOnItem, function(err) {
        fn(err, next);
      });
    });
  }, next => !next, fn);
}

function save(collection, item, fn) {
  item._id = item.id;
  delete item.id;
  collection.save(item, fn);
}

function fetchEmbedded(opts, type, item, fn) {
  let link = item._links[type];
  if (!link) {
    return async.nextTick(fn);
  }
  item._embedded = item._embedded || {};
  let fetched = item._embedded[type] = [];
  iterate(link.href, type, opts, function(thing, fn) {
    fetched.push(thing);
    fn();
  }, function(err) {
    fn(err, item);
  });
}

function dumpCollection(opts, name, embedded, fn) {
  const collection = opts.db.collection({ name });

  iterate(`https://api.helpscout.net/v2/${name}`, name,
    opts,
    function(item, fn) {
      let tasks = embedded.map(type => async.apply(fetchEmbedded, opts, type, item));
      tasks.push(async.apply(save, collection, item));

      async.series(tasks, fn);
    },
    function(err) {
      collection.close();
      console.error(`Finished ${name}...`);
      fn(err);
  });
}

function dumpscout(opts, fn) {

  async.waterfall([
    fn => getBearerToken(opts, fn),
    function(accessToken, fn) {
      opts.accessToken = accessToken;
      fn();
    },
    async.apply(dumpCollection, opts, 'customers', [ 'emails' ]),
    async.apply(dumpCollection, opts, 'conversations', [ 'threads' ])
  ], fn);

}
