var userModel = require(__dirname + '/models/users');
var crypto = require('crypto');

exports.login = function(req, res, next){
    var data = req.body.data;
    var email = data.email;
    var password = data.password;
    
    if(!email && !req.session.user){
        res.redirect('/');
        return;
    }
    getUser(email, password, function(err, user){
        if(err){
            return next(new Error(err));
        }
        else {
            if(!user){
                return next(new Error('Unable to retrieve user'));
            }
            req.session.user = user;
            res.cookie('email', user.email, { maxAge: 900000 });
            res.cookie('password', user.password, { maxAge: 900000 });
            
            res.redirect('/');
        }
    });
};
exports.logout = function(req, res){
    res.cookie('email', '', {maxAge: -1});
    res.cookie('password', '', {maxAge: -1});
    delete req.session.user;
    
    res.redirect('/');
};

exports.registerForm = function(req, res){
    res.render('users/register', { title: 'Register User' });
};
exports.registerSave = function(req, res, next){
    //do save
    var data = req.body.data;
    var email = data.email;
    var password = data.password;
    if(!email || !password){
        return next(new Error('Please fill in all fields'));
        return;
    }
    userModel.findOne({ email: email }, function(err, user){
        if(err || user){
            return next(new Error('User already exists'));
        }
        
        var user = new userModel({ email: email, password: md5(password)});
        user.save(function (err, model) {
            if (err){
                return next(new Error('Unable to save data'));
            }
            res.redirect('/');
        });
    });
};

var getUser = function(email, password, callback){
    if(!email || !password){
        return callback();
    }
    userModel.findOne({ email: email, password: md5(password) }, function(err, user){
        if(err){
            return callback(err);
        } 
        callback(null, user);
    });
    
}
var md5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}