const mongoose = require("mongoose");

const order = new mongoose.Schema({
  movieId: String,
  moviePrice: Number,
  movieName: String,
  memberId: String,
  name: String,
  address: String,
  phNo: String,
  qty: Number,
  finished: {
    default: false,
    type: Boolean,
  },
  orderDate: {
    default: Date.now,
    type: Date,
  },
});

module.exports = mongoose.model("order", order);
