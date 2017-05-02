var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    PetModel = require('./db/db'),
    app = express();


app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get('/test', function(req, res) {
  res.send('Test route is active');
});

app.post('/api/record', function(req, res) {
  res.send('Route not active yet');
});

app.get('/api/pets', function(req, res) {
  return PetModel.find(function(err, pets) {
    if(!err) {
      return res.send(pets);
    } else {
      res.statusCode = 500;
      return res.send({ error: 'Server error' });
    }
  });
});

app.get('/api/pet/:id', function(req, res) {
  res.send('Pet route');
});

app.get('/api/pet/:id/records', function(req, res) {
  res.send('Pet records route');
});

app.listen(1337, () => console.log('Server listening on port 1337'));
