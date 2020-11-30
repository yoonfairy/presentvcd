const mongoose = require("mongoose");

const rent = new mongoose.Schema({
  movieId: String,
  movieName: String,
  name: String,
  phNo: String,
  memberId: {
    type: String,
    default: null,
  },
  address: String,
  dueDate: Date,
  rentedDate: {
    type: Date,
    default: Date.now,
  },
  totalPrice: Number,
  qty: Number,
  finished: {
    default: false,
    type: Boolean
  }
});

module.exports = mongoose.model("rent", rent);


