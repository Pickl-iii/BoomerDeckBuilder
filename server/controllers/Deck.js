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

  try {
    const query = { owner: req.session.account._id };
    const docs = await Deck.find(query).select('name cards').lean().exec();

    const url = `https://api.scryfall.com/cards/search?q=${req.body.cardName}+legal%3Aoldschool+is%3Afirstprinting`;

    const response = await fetch(url, {
      method: 'GET',
    });

    const result = await response.json();

    /*
    let deckList = await Deck.exists({ name: req.body.selectedDeckName });
    let duplicateCard = await deckList.exists({ cardName: req.body.cardName });
    console.log(duplicateCard);
    */

    const deckExists = docs.find((deck) => deck.name === req.body.selectedDeckName);

    if (deckExists) {
      if (deckExists.cards.find((card) => card.cardName === req.body.cardName)) {
        // Check if card is already in list; if so, update count to new number.
        Deck.findOneAndUpdate(
          { name: req.body.selectedDeckName },
          {
            $set: {
              cards: {
                cardName: result.data[0].name,
                cardImage: result.data[0].image_uris.normal,
                cardCount: req.body.cardCount,
              },
            },
          },
        ).exec();

        return res.status(201).json({
          name: req.body.selectedDeckName,
          cardsAdded: req.body.cardName,
        });
      }
      // Tutorial Used: https://www.geeksforgeeks.org/mongoose-findoneandupdate-function/
      Deck.findOneAndUpdate(
        { name: req.body.selectedDeckName },
        {
          $push: {
            cards: {
              cardName: result.data[0].name,
              cardImage: result.data[0].image_uris.normal,
              cardCount: req.body.cardCount,
            },
          },
        },
      ).exec();

      return res.status(201).json({
        name: req.body.selectedDeckName,
        cardsAdded: req.body.cardName,
      });
    }
    return res.status(500).json({ error: 'An error occured editing a deck. No deck located.' });
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
    // const query = { owner: req.session.account._id };

    // Tutorial Used: https://www.geeksforgeeks.org/mongoose-remove-function/
    await Deck.findOneAndUpdate(
      { name: req.body.selectedDeckName },
      {
        $pull: {
          cards: {
            cardName: req.body.cardName,
          },
        },
      },
    ).exec();

    return res.status(201).json({
      name: req.body.selectedDeckName,
      cardsRemoved: req.body.cardName,
    });
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
