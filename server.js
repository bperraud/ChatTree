const express      = require('express');
const path         = require('path');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const debug        = require('debug')('node-template:server');
const http         = require('http');
const bodyParser   = require('body-parser');
const pg           = require('pg');
const session      = require('express-session');
const pgSession    = require('connect-pg-simple')(session);
const db           = require('./server/db');
const fs           = require('fs');

const app = express();

/*let image_original = "./src/assets/images/users/default.jpg";
fs.readFile(image_original, function(err, original_data){
  //fs.writeFile('image_orig.jpg', original_data, function(err) {});
  let base64Image = original_data.toString('base64');
  console.log(base64Image);
  let decodedImage = new Buffer(base64Image, 'base64');
  //fs.writeFile('image_decoded.jpg', decodedImage, function(err) {});
});*/


// Get our API routes
const login = require('./server/routes/login');
const api   = require('./server/routes/api');

// Sessions
let sess = session({
  store:             new pgSession({
    pool:      db.pool, // Connection pool
    tableName: 'session' // Use another table-name than the default "session" one
  }),
  secret:            'super cat',
  resave:            false,
  saveUninitialized: true
});
app.use(sess);

require('./server/websocket/conversation.io').setSession(sess);

// Logger
app.use(logger('dev'));

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser());

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Add headers
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Set our api routes
app.use('/', login);
app.use('/api', api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err    = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // Render the error page
  res.status(err.status || 500);
  res.json({
    error: 'Server error'
  });
});

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Create WebSocket server.
 */
//const wss = require('./server/websocket/wss')(server);

/**
 * Create socket io server.
 */
const io = require('./server/websocket/io-server')(server);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, '0.0.0.0', () => console.log(`API running on localhost:${port}`));
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
