const mongoose = require("mongoose");

const code = new mongoose.Schema({
  code: String,
  activated: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("code", code);
