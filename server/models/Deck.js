// SOURCE: Based on code provided as part of a class assignment. Code has been modified.

const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const CardSchema = new mongoose.Schema({
  cardName: {
    type: String,
    required: true,
    trim: true,
  },
  cardImage: {
    type: String,
    required: true,
    default: '',
  },
  cardCount: {
    type: Number,
    required: true,
    min: 1,
  },
});

const DeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  maindeck: {
    type: [CardSchema],
    required: false,
  },
  sideboard: {
    type: [CardSchema],
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
  maindeck: doc.maindeck,
});

const DeckModel = mongoose.model('Deck', DeckSchema);
module.exports = DeckModel;
