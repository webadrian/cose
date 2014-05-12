var storyboard = require('./storyboard');
exports.index = function(req, res){
    var storyboards = [];
    var callback = function(){
        res.render('index', { title: 'Collaborative Storyboard Editor', storyboards: storyboards});
    }
    if(req.session.user){
        storyboard.loadSessions(req.session.user.email, function(err, items){
            if(!err){
                storyboards = items;
            }
            callback();
        });
    }
    else{
        callback();
    }
    
};
