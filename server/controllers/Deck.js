// SOURCE: Based on code provided as part of a class assignment. Code has been modified.

const models = require('../models');

const { Deck } = models;

const makerPage = async (req, res) => res.render('app');

const createDeck = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Deck requires a name!' });
  }

  const deckData = {
    name: req.body.name,
    cards: [],
    owner: req.session.account._id,
  };

  try {
    const newDeck = new Deck(deckData);
    await newDeck.save();
    return res.status(201).json({ name: newDeck.name, cards: newDeck.cards });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Deck name already taken!' });
    }
    return res.status(500).json({ error: 'An error occured creating a deck.' });
  }
};

const getDeckNames = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Deck.find(query).select('name').lean().exec();

    return res.json({ decks: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving decks!' });
  }
};

const getCardsFromDeck = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Deck.find(query).select('name cards').lean().exec();

    if (docs.find((deck) => deck.name === req.query.deck)) {
      return res.json({ cards: docs.find((deck) => deck.name === req.query.deck).cards });
    }
    return res.status(500).json({ error: 'No deck selected!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving cards!' });
  }
};

const addCard = async (req, res) => {
  if (!req.body.selectedDeckName || !req.body.cardName || !req.body.cardCount) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  console.log(req.body.selectedDeckName);
  console.log(req.body.cardName);

  try {
    const query = { owner: req.session.account._id };

    // Tutorial Used: https://www.geeksforgeeks.org/mongoose-findoneandupdate-function/
    const docs = await Deck.findOneAndUpdate(
      { name: req.body.selectedDeckName },
      { $push: { cards: req.body.cardName } },
    ).exec();

    return res.status(201).json({ name: req.body.selectedDeckName, cardsAdded: req.body.cardName });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured editing a deck.' });
  }
};

const removeCard = async (req, res) => {
  if (!req.body.selectedDeckName || !req.body.cardName) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  console.log(req.body.selectedDeckName);
  console.log(req.body.cardName);

  try {
    const query = { owner: req.session.account._id };

    // Tutorial Used: https://www.geeksforgeeks.org/mongoose-remove-function/
    const docs = await Deck.remove(
      { name: req.body.selectedDeckName },
      { $pull: { cards: req.body.cardName } },
    ).exec();

    return res.status(201).json({ name: req.body.selectedDeckName, cardsRemoved: req.body.cardName });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured editing a deck.' });
  }
};

module.exports = {
  makerPage,
  createDeck,
  getDeckNames,
  getCardsFromDeck,
  addCard,
  removeCard,
};
