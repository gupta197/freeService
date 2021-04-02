//Import the mongoose module
const mongoose = require('mongoose');
const seeder = require('mongoose-seed');
//Set up default mongoose connection
// const mongoDB = 'mongodb://' + process.env.DB_HOST +':'+ process.env.DB_PORT  + '/' + process.env.DB_NAME;
const mongoDB = 'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME;
mongoose.Promise = global.Promise;

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(mongoDB, { useNewUrlParser: true })

var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
module.exports = db