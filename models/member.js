const mongoose = require("mongoose");

const member = new mongoose.Schema({
  messengerId: String,
  name: String,
  phNo: String,
  address: String,
});

module.exports = mongoose.model("member", member);
