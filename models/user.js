const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

//this action will add fields of username, hashed password and salt
UserSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', UserSchema);

module.exports = { User, UserSchema };
