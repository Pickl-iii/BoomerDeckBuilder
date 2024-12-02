const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const DomoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    set: setName,
  },
  age: {
    type: Number,
    min: 0,
    required: true,
  },
  job: {
    type: String,
    required: true,
    default: 'Unemployed',
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

DomoSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  age: doc.age,
  job: doc.job,
});

const DomoModel = mongoose.model('Domo', DomoSchema);
module.exports = DomoModel;
