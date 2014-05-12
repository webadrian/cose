var storyboardsModel = require(__dirname + '/models/storyboards');
var chatModel = require(__dirname + '/models/chats');

exports.start = function(req, res, next){
    //generate entry on storyboard.
    var storyboard = new storyboardsModel();
    var params = {};
    
    if(req.session.user){
        storyboard.authorEmail = req.session.user.email;
    }
    
    if(req.body.data && req.body.data.json)
        storyboard.data = req.body.data.json;
    
    storyboard.save(function(err){
        if(err)
            return next(new Error('Unable to create storyboard'));
        res.redirect('/session/chatUsername/' + storyboard._id);
    });
};

exports.session = function(req, res, next){
    var id = req.params.id;
    if(!id){
        return next(new Error('Unable to determine session id'));
    }
    if(!req.session.chatUsername){
        return res.redirect('/session/chatUsername/' + id);
    }
    loadSession(id, false, function(err, storyboard){
        if(err)
            return next(new Error(err));
        res.render('storyboard', {storyboard: storyboard, chatUsername: req.session.chatUsername});
    });
}
exports.join = function(req, res){
    res.render('storyboard/join', { title: 'Join a storyboard' });
}

exports.load = function(req, res){
    res.render('storyboard/load', { title: 'Load a storyboard' });
}

exports.chatUsername = function(req, res, next){
    var sessionId = req.params.id;
    var callback = function(){
        res.redirect('/session/id/' + sessionId);
    }
    if(req.session.user){
        req.session.chatUsername = req.session.user.email;
        return callback();
    }
    else{
        if(req.body.data){
            var data = req.body.data;
            var chatUsername = data.chatUsername;
            if(!chatUsername){
                return next(new Error('Please enter required field'));
            }
            else{
                req.session.chatUsername = chatUsername;
                return callback();
            }
        }
        else{
            res.render('storyboard/chatUsername');
        }
    }
    
}
exports.joinPost = function(req, res, next){
    var data = req.body.data;
    var id = data.id;
    var password = data.password;
    var chatUsername = data.chatUsername;
    if(!id || !chatUsername){
        return next(new Error('Please fill in required fields'));
    }
    
    loadSession(id, password, function(err, storyboard){
        if(err){
            return next(new Error(err));
        }
        req.session.chatUsername = chatUsername;
        res.redirect('/session/id/' + storyboard._id);
    });
    
}
exports.saveData = function(sessionId, data, callback){
    if(!sessionId){
        return callback('Unable to determine sessionId');
    }
    storyboardsModel.findByIdAndUpdate(sessionId, { data: JSON.stringify(data), updated: Date.now() } , function(err, storyboard){
        if(err)
            return callback(err);
        callback();
    });
}
exports.saveChatData = function(sessionId, username, data, callback){
    if(!sessionId || !username){
        return callback('Unable to determine sessionId or username');
    }
    var chat = new chatModel();
    chat.sessionId = sessionId;
    chat.username = username;
    chat.message = data;
    
    chat.save(function(err){
        if(err)
            return callback('Unable to save chat data');
        callback();
    });
}
exports.loadSessionData = function(id, password, callback){
    loadSession(id, password, function(err, storyboard){
        if(err){
            return callback(err);
        }
        callback(null, storyboard);
    });
}
exports.loadChatData = function(id, callback){
    var data = [];
    if(!id){
        return callback('Unable to load chat data');
    }
    chatModel.find({ sessionId: id}, false, { sort: { created: 1 }}, function(err, items){
        items.forEach(function(item){
            data.push({
                username: item.username,
                message: item.message
            });
        });
        callback(null, data);
    });
}
exports.loadSessions = function(id, callback){
    var data = [];
    if(!id){
        return callback('Unable to load data');
    }
    storyboardsModel.find({ authorEmail: id}, false, { sort: { created: -1 }}, function(err, items){
        callback(null, items);
    });
}

var loadSession = function(id, password, callback){
    storyboardsModel.findById(id, function(err, storyboard){
        if(err){
            return callback(err);
        }
        if(password){
            if(storyboard.passwordProtected && storyboard.passwordProtected != password){
                return callback(new Error('Password mismatch'));
            }
        }
        callback(null, storyboard);
    });
}