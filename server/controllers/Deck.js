// SOURCE: Based on code provided as part of a class assignment. Code has been heavily modified.

const models = require('../models');

const { Deck } = models;

const builderPage = async (req, res) => res.render('app');

// Attempt to create a new deck in database
const createDeck = async (req, res) => {
  if (!req.body.selectedDeckName) {
    return res.status(400).json({ error: 'ERROR: Deck requires a name!' });
  }

  const deckData = {
    name: req.body.selectedDeckName,
    cards: [],
    owner: req.session.account._id,
  };

  try {
    const newDeck = new Deck(deckData);
    await newDeck.save();
    return res.status(201).json({ name: newDeck.name, cards: newDeck.cards });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'SERVER ERROR: Something went wrong creating a new deck!' });
  }
};

// Attempt to retrieve deck and card data from database
const getDeckData = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Deck.find(query).select('name cards').lean().exec();
    return res.json({ decks: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'SERVER ERROR: Something went wrong retrieving deck data!' });
  }
};

// Attempt to add a given card to the current deck
const addCard = async (req, res) => {
  // Check that all fields are valid
  if (!(req.body.cardId || req.body.cardName)
      || !req.body.selectedDeckName || !req.body.cardCount) {
    return res.status(400).json({ error: 'ERROR: All fields are required!' });
  }

  try {
    const query = { owner: req.session.account._id };
    const docs = await Deck.find(query).select('name cards').lean().exec();

    // Confirm requested deck exists on account
    const decklist = docs.find((deck) => deck.name === req.body.selectedDeckName);

    if (decklist) {
      // Make a Scryfall API call to get legal cards
      let url = 'https://api.scryfall.com/cards/';

      if (req.body.cardId) {
        url += `${req.body.cardId}`;
      } else { url += `search?q=${req.body.cardName}+legal%3Aoldschool+is%3Afirstprinting`; }

      const response = await fetch(url, {
        method: 'GET',
      });

      const result = await response.json();
      const scryfallCard = {};

      // If multiple cards are returned, return with status 300.
      if (result.object === 'list'
        && result.total_cards !== 1) {
        return res.status(300).json({
          cardOptions: result.data,
          deckName: req.body.selectedDeckName,
          cardCount: req.body.cardCount,
        });
      }

      // If no card found on scryfall, return with error / easter egg
      if (result.object === 'error') {
        url = `https://api.scryfall.com/cards/search?q=${req.body.cardName}`;
        const eggResponse = await fetch(url, {
          method: 'GET',
        });
        const eggResult = await eggResponse.json();
        if (eggResult.object !== 'error') {
          return res.status(418).json({ error: 'TIME-TRAVEL ERROR: The year is 1995...' });
        }

        return res.status(500).json({ error: 'ERROR: The requested card does not exist.' });
      }

      // Otherwise format the data (sometimes scryfall sends object, sometimes array)
      if (result.object === 'card') {
        scryfallCard.cardName = result.name;
        scryfallCard.cardImage = result.image_uris.normal;
      } else {
        scryfallCard.cardName = result.data[0].name;
        scryfallCard.cardImage = result.data[0].image_uris.normal;
      }

      // Check if the card already exists in the list
      const duplicateCard = decklist.cards.find((card) => card.cardName === scryfallCard.cardName);

      if (duplicateCard) {
        // If duplicate, update count to new number.
        console.log('DUPLICATE CARD DETECTED!');
        /*
        Deck.findOneAndUpdate(
          { name: req.body.selectedDeckName },
          {
            cards: {
              cardName: scryfallCard.cardName,
              cardImage: scryfallCard.cardImage,
              $set: { cardCount: req.body.cardCount, },
            },
          },
        ).exec();

        return res.status(201).json({
          name: req.body.selectedDeckName,
          cardsAdded: req.body.cardName,
        });
        */
      }

      Deck.findOneAndUpdate(
        { name: req.body.selectedDeckName },
        {
          $push: {
            cards: {
              cardName: scryfallCard.cardName,
              cardImage: scryfallCard.cardImage,
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
    return res.status(500).json({ error: 'SERVER ERROR: Something went wrong locating deck!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'SERVER ERROR: Something went wrong editing a deck!' });
  }
};

// Attempts to remove a given card from curretn deck
const removeCard = async (req, res) => {
  if (!req.body.selectedDeckName || !req.body.cardName) {
    return res.status(400).json({ error: 'ERROR: All fields are required!' });
  }

  try {
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
    return res.status(500).json({ error: 'SERVER ERROR: Something went wrong editing a deck!' });
  }
};

module.exports = {
  builderPage,
  createDeck,
  getDeckData,
  addCard,
  removeCard,
};
