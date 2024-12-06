// SOURCE: Based on code provided as part of a class assignment. Code has been lightly modified.

// SHow error message
const handleError = (message) => {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('userMessage').classList.remove('hidden');
};

// Create a list of cards that match previous search query and allow
// user to click one to send a more specific /addCard request.
// (This probably shouldn't be in helper but oh well ¯\_(ツ)_/¯ )
const handleCardOptions = (result, handler) => {
  document.getElementById('optionsMessage').classList.remove('hidden');
  const list = document.getElementById("optionsList");

  const options = result.cardOptions;
  const selectedDeckName = result.deckName;
  const cardCount = result.cardCount;

  // TUTORIAL: https://www.geeksforgeeks.org/how-to-creating-html-list-from-javascript-array/
  options.forEach((option) => {
      let li = document.createElement('li');
      let cardId = option.id
      li.innerHTML = `<a> ${option.name} </a>`;
      li.onclick = () => {
        sendPost('/addCard', {selectedDeckName, cardId, cardCount}, handler);
      }
      list.appendChild(li);
  })
};

// Sends a post request (obviously)
const sendPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById('userMessage').classList.add('hidden');

  if(result.redirect) {
    window.location = result.redirect;
  }

  if(result.error) {
    handleError(result.error);
  }

  if(result.cardOptions) {
    handleCardOptions(result, handler);
  } else {
    if(handler) {
      hideOptions();
      handler(result);
    }
  }
};

// Hides error message
const hideError = () => {
  document.getElementById('userMessage').classList.add('hidden');
};

// Hides card options (if field exists)
const hideOptions = () => {
  if(document.getElementById('optionsMessage')) {
    document.getElementById('optionsMessage').classList.add('hidden');
    document.getElementById('optionsList').innerHTML = '';
  }
};

module.exports = {
  handleError,
  handleCardOptions,
  sendPost,
  hideError,
  hideOptions,
};