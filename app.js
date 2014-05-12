// TODO: @COSE save storyboard data into database
// TODO: @COSE save chat data into database
// TODO: @COSE load storyboard data and chat data after loading storyboard
// TODO: @COSE load storyboard from file/ textarea.
// TODO: @COSE force entering of username on storyboard entering if not logged in. use that username in chat
// TODO: @COSE make invite friend popup with text + link
// TODO: @COSE add password protect popup ( maybe )
// TODO: @COSE append svg / json ( maybe )

// GLOBAL VARIABLES
var express = require('express');
var app = express();
var options = require(__dirname + '/config/local');

// GLOBAL APP CONFIGURATIONS
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'secret123superuberlove' }));
app.use(express.static(__dirname + '/public'));

app.configure('development', function () { app.locals.pretty = true; });

app.use(function(req, res, next){
    if(req.session.user)
        res.locals.user = req.session.user;
    next();
});
// GENERAL
var storyboard = require('./storyboard');
var site = require('./site');
var user = require('./user');

// HANDLE REQUESTS
app.all('/', site.index);
// STORYBOARD REQUESTS
app.all('/session/start', storyboard.start);

app.get('/session/join', storyboard.join);
app.post('/session/join', storyboard.joinPost);

app.get('/session/load', storyboard.load);

app.get('/session/id/:id', storyboard.session);

app.all('/session/chatUsername/:id', storyboard.chatUsername);

// USER REQUESTS
app.post('/login', user.login);

app.get('/logout', user.logout);

app.get('/register', user.registerForm);
app.post('/register', user.registerSave);


app.use(function(err, req, res, next){
    if(err){
        res.status(500);
        res.render('error', {error: err});
    }
});
app.use(function(req, res, next){
    res.status(404);
    res.render('error', {error: 'Sorry cannot find that!'});
});
/*var requiresAuth = ['/', '/start'];
app.get('*', function(req, res){
//check if auth is required
if(requiresAuth.indexOf(req.url) != -1){
if(req.cookies.user == undefined || req.cookies.pass == undefined){
user.login(req, res);
}
}
});*/

// HANDLE CONNECTIONS
var server = app.listen(options.port);

console.log('CoSe started on port '  + options.port);

var io = require('socket.io').listen(server);
io.sockets.on( 'connection', function( socket ){
    socket.on( 'setChatUsername', function( username ) {
        socket.set( 'chatUsername', username );
    });

    socket.on( 'setSessionId', function( sessionId ) {
        socket.join( sessionId );
        storyboard.loadSessionData( sessionId, false, function( err, storyboard ) {
            if( err )
                console.log( err );
            else {
                socket.emit( 'canvasFirstLoad', storyboard.data );
            }
        } );
        storyboard.loadChatData( sessionId, function( err, chatData){
            if( err )
                console.log( err );
            else {
                socket.emit( 'chatFirstLoad', chatData)
            }
        });
    });
    
    socket.on( 'chatMessage', function( data ) {
        var message = data.message;
        var sessionId = data.sessionId;
        
        socket.get( 'chatUsername', function ( error, username ) {
            var data = {
                'message': message,
                'chatUsername': username
            };
            storyboard.saveChatData(sessionId, username, message, function(err){
                if(err){
                    return console.log('Error on saving chat data');
                }
                socket.broadcast.to( sessionId ).emit( 'chatMessage', data );
            });
        });
    });

    socket.on('canvasJSON', function ( data ) {
        var message = data.message;
        var sessionId = data.sessionId;
        
        storyboard.saveData(sessionId, message, function(err){
            if(err){
                return console.log('Error on saving canvas data');
            }
            socket.broadcast.to( sessionId ).emit( 'canvasJSON', message );
        });
    });
});