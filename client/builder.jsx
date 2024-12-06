// SOURCE: Based on code provided as part of a class assignment. Code has been heavily modified.

const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// LOCAL VARIABLE: TRACKS LOCALLY SELECTED DECK BEING EDITED
let selectedDeckName = "[No Deck Selected]";

// Sends a POST request for creating a new deck
const handleNewDeck = (e, onDeckAdded) => {
    e.preventDefault();
    helper.hideError();
    helper.hideOptions();

    const name = e.target.querySelector('#deckName').value;

    if(!name) {
        helper.handleError('ERROR: Deck name is required!');
        return false;
    }

    selectedDeckName = name;
    helper.sendPost(e.target.action, {selectedDeckName}, onDeckAdded);
    return false;
};

// Sets current selected deck
const handleSelectDeck = (e, onDeckSelected) => {
    e.preventDefault();
    helper.hideError();
    helper.hideOptions();

    const name = e.target.querySelector('#existingDeck').value;

    // TO-DO: Figure out how to fire props.triggerReload from here.
    // helper.runHandler(onDeckSelected);

    selectedDeckName = name;
    return false;
};

// Sends a POST request for adding a card to the current deck
const handleAddCard = (e, onCardAdded) => {
    e.preventDefault();
    helper.hideError();
    helper.hideOptions();

    const cardName = e.target.querySelector('#cardName').value;
    const cardCount = e.target.querySelector('#cardCount').value;

    if(!cardName || !cardCount) {
        helper.handleError('ERROR: All fields are required!');
        return false;
    }

    if (selectedDeckName === "[No Deck Selected]" || selectedDeckName === "") {
        helper.handleError('ERROR: No deck selected!');
        return false;
    }

    helper.sendPost(e.target.action, {selectedDeckName, cardName, cardCount}, onCardAdded);
    return false;
};

// Sends a POST request for removing a card from the current deck
const handleRemoveCard = (e, onCardRemoved) => {
    e.preventDefault();
    helper.hideError();
    helper.hideOptions();

    const cardName = e.target.parentElement.querySelector('#cardName').innerHTML;

    if(!cardName) {
        helper.handleError('ERROR: Something went wrong removing a card!');
        return false;
    }

    helper.sendPost(e.target.action, {selectedDeckName, cardName}, onCardRemoved);
    
    return false;
};

// Renders textbox and button to create a new deck
const DeckForm = (props) => {
    return(
        <form id="deckForm"
            onSubmit={(e) => handleNewDeck(e, props.triggerReload)}
            name="deckForm"
            action="/builder"
            method="POST"
            className="deckForm"
        >
            <label htmlFor="name">Make a brand new Deck: </label>
            <input id="deckName" type="text" name="name" placeholder="Your New Deck's Name" />
            <input className="makeDeckSubmit" type="submit" value="Create!" />
        </form>
    );
};

// Renders dropdown and button to select existing deck
const DeckDropdown = (props) => {
    const [decks, setDecks] = useState(props.decks);

    useEffect(() => {
        const loadDecksFromServer = async () => {
            const response = await fetch('/getDeckData');
            const data = await response.json();
            setDecks(data.decks);
        };
        loadDecksFromServer();
    }, [props.reloadDecks]);

    let deckNodes;

    // Populate drop down if decks exist
    if(decks.length > 0) {
        deckNodes = decks.map(deck => {
            return (
                <option value={deck.name}>
                    {deck.name}
                </option>
            );
        });
    } else {
        deckNodes = (
            <option value="[No Deck Selected]">
                No Decks Exist!
            </option>
        );
    };
    
    return (
        <form id="selectForm"
            onSubmit={(e) => handleSelectDeck(e, props.triggerReload)}
            name="selectForm"
            action="/builder"
            method="GET"
            className="selectForm"
        >
            <label for="existingDeck">or select an existing Deck: </label>
            <select name="existingDeck" id="existingDeck">
                {deckNodes}
            </select> 
            <input className="selectDeckSubmit" type="submit" value="Edit" />
        </form>
    );
};

// Renders fields and buttons to add a card
const AddCardForm = (props) => {
    return(
        <form id="addCardForm"
            onSubmit={(e) => handleAddCard(e, props.triggerReload)}
            name="addCardForm"
            action="/addCard"
            method="POST"
            className="addCardForm"
        >
            <label htmlFor="cardName">Add a Card: </label>
            <input id="cardName" type="text" name="cardName" placeholder="Card Name" />
            <label htmlFor="cardCount">Copies: </label>
            <input id="cardCount" type="number" name="cardCount" defaultValue="1" min="1"/>
            <input className="addCardSubmit" type="submit" value="Add" />
        </form>
    );
};

// Renders decklist data 
const DeckList = (props) => {
    const [decks, setDecks] = useState(props.decks);

    useEffect(() => {
        const loadDecksFromServer = async () => {
            const response = await fetch('/getDeckData');
            const data = await response.json();
            setDecks(data.decks);
        };
        loadDecksFromServer();
    }, [props.reloadDecks]);

    
    if (selectedDeckName === "[No Deck Selected]" || selectedDeckName === "") {
        return ( 
            <div className="deckList">
                <p>No deck selected yet! Start by creating one or editing an existing deck.</p>
            </div>
        );
    }
    
    // Try/Catch used in case currentDeck.cards is undefined. 
    // Probably a better way to do this but it's late and I'm tired...
    try {
        const currentDeck = decks.find((deck) => deck.name == selectedDeckName);
        const cardArray = currentDeck.cards;
     
        // Create individual card displays as list items
        const cardNodes = cardArray.map(currentCard => {
            return (
                <li class="cardDisplay">
                    <p id="cardInfoDisplay">{currentCard.cardCount}x  |  <strong id="cardName">{currentCard.cardName}</strong></p>
                    <img id="cardImageDisplay" src={currentCard.cardImage} alt="Card Image" width="180px"></img>

                    <form id="removeCardForm"
                    onSubmit={(e) => handleRemoveCard(e, props.triggerReload)}
                    name="removeCardForm"
                    action="/removeCard"
                    method="POST"
                    className="removeCardForm"
                    >
                        <button id="cardMoveButton" disabled>Move to Side</button>
                        <input id="cardRemoveButton" className="removeCardSubmit" type="submit" value="Remove" />
                    </form>
                </li>
            );
        });
        
        return ( 
            <div className="deckList">
                <ul id="cardsList">
                    {cardNodes}
                </ul> 
            </div>
        );
    } catch(err) {
        return ( 
            <div className="deckList">
                <p>There are currently no cards in this deck. Start by adding some!</p>
            </div>
        );
    }
};

const App = () => {
    const [reloadDecks, setReloadDecks] = useState(false);

    return (
        <div>
            <div id="makeDeck">
                <DeckForm triggerReload={() => setReloadDecks(!reloadDecks)} />
            </div>
            <div if="decks">
                <DeckDropdown decks={[]} reloadDecks={reloadDecks} />
            </div>
            <hr></hr>
            <h3>{selectedDeckName}</h3>
            <fieldset>
                <legend>Editor</legend>
                <div id="addCard">
                    <AddCardForm triggerReload={() => setReloadDecks(!reloadDecks)} />
                </div>
            </fieldset>
            <div id="userMessage" class='hidden'>
                <p><strong id="errorMessage"></strong></p>
            </div>
            <div id="optionsMessage" class='hidden'>
                <p><em>Did you mean:</em></p>
                <ul id="optionsList"></ul>
            </div>
            <fieldset>
                <legend>Maindeck</legend>
                <pre>
                    <div if="cards">
                        <DeckList decks={[]} reloadDecks={reloadDecks}/>
                    </div>
                </pre>
            </fieldset>
            <fieldset>
                <legend>Sideboard</legend>
                <p><i>Currently Unavaliable.</i></p>
            </fieldset>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App />);
};

window.onload = init;