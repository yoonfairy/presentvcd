const mongoose = require("mongoose");

const movie = new mongoose.Schema({
  movieId: {
    type: String,
    unique: true,
    required: true,
  },
  name: String,
  type: Array,
  poster: String,
  trailer: String,
  available: Number,
  price: Number,
  rentNumber: {
    default: 0,
    type: Number,
  },
  date: {
    default: Date.now,
    type: Date,
  },
  description: String,
});

module.exports = mongoose.model("movie", movie);
