// SOURCE: Based on code provided as part of a class assignment. Code has been modified.

const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getDecks', mid.requiresLogin, controllers.Deck.getDeckNames);
  app.get('/getCards', mid.requiresLogin, controllers.Deck.getCardsFromDeck);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/maker', mid.requiresLogin, controllers.Deck.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Deck.createDeck);

  app.post('/addCard', mid.requiresLogin, controllers.Deck.addCard);
  app.post('/removeCard', mid.requiresLogin, controllers.Deck.removeCard);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
