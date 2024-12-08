// SOURCE: Based on code provided as part of a class assignment. Code has been modified.

const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getDeckData', mid.requiresLogin, controllers.Deck.getDeckData);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/changePassword', mid.requiresSecure, controllers.Account.changePassword);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/builder', mid.requiresLogin, controllers.Deck.builderPage);
  app.post('/builder', mid.requiresLogin, controllers.Deck.createDeck);

  app.post('/deleteDeck', mid.requiresLogin, controllers.Deck.deleteDeck);

  app.post('/addCard', mid.requiresLogin, controllers.Deck.addCard);
  app.post('/removeCard', mid.requiresLogin, controllers.Deck.removeCard);
  app.post('/swapCardLocation', mid.requiresLogin, controllers.Deck.swapCardLocation);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/*', mid.requiresSecure, controllers.Missing.missingPage);
};

module.exports = router;
