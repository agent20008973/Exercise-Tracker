const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const userSchema = new Schema({
 username: {type: String, unique: true},

});
const exerciseSchema = new Schema({
  id: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: Date
})
var User = mongoose.model("User", userSchema);
var Excercise = mongoose.model("Excercise", exerciseSchema);
module.exports = {User, Excercise}