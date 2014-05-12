var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = require('../config/local');

mongoose.connect(options.dbUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var modelSchema = new Schema({
    email:  String,
    password: String,
    created: { type: Date, default: Date.now },
    deleted: Boolean
});
var model = mongoose.model('User', modelSchema);
module.exports = model;
