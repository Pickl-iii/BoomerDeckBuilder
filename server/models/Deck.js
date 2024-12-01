// SOURCE: Based on code provided as part of a class assignment. Code has been modified.

const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const DeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    set: setName,
  },
  cards: {
    type: [String],
    required: false,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

DeckSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  cards: doc.cards,
});

const DeckModel = mongoose.model('Deck', DeckSchema);
module.exports = DeckModel;
