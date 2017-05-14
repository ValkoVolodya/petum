var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    logger = require('morgan'),
    config = require('./lib/config'),
    pet = require('./handlers/pet'),
    user = require('./handlers/user'),
    record = require('./handlers/record'),
    log = require('./lib/log')(module),
    app = express();

app.use(logger('dev'));

app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));


app.get('/api/user/:id', user.view);
app.post('/api/user/create', user.create);

app.post('/api/pet/create', pet.create);
app.get('/api/pets', pet.list);
app.get('/api/pet/:id', pet.view);
app.get('/api/pet/:id/records', function(req, res) {
  res.send('Pet records route');
});

app.get('api/record/:id', record.view);
app.post('/api/record/create', record.create);


app.listen(
  config.get('port'),
  () => log.info('Server listening on port ' + config.get('port'))
);
