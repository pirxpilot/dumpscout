const dumpscout = require('./lib/dumpscout');

const argv = require('yargs')
  .usage('$0 [options]')
  .env('DUMPSCOUT')
  .config()
  .demand('client_id')
  .demand('client_secret')
  .default({
    database: 'mongodb://localhost:27017/helpscout'
  })
  .argv;

argv.db = require('mniam').db(argv.database);

dumpscout(argv, function(err) {
  if (err) {
    console.error('Error: %s', err);
  }
});
