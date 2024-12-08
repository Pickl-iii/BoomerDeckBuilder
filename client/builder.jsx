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

    const name = e.target.value;

    onDeckSelected();

    selectedDeckName = name;
    return false;
};

// Deletes the current selected deck
const handleDeleteDeck = (e, onDeckDeleted) => {
    e.preventDefault();
    helper.hideError();
    helper.hideOptions();

    if(!selectedDeckName || selectedDeckName === "[No Deck Selected]") {
        helper.handleError('ERROR: Deck name not found!');
        return false;
    };

    helper.sendPost(e.target.action, {selectedDeckName});

    selectedDeckName = "[No Deck Selected]";

    // This is awful and i am sorry but also it just works
    e.target.parentElement.parentElement.querySelector('#existingDeck')
        .value = "[No Deck Selected]";

    // Can't be called in helper since selectedDeckName needs to be updated first
    onDeckDeleted();

    // NEED HELP FROM AUSTIN:
    //// Data is succesffuly deleted and page "refreshes", but deleted deck name still
    //// appears in dropdown until a different deck is selected.

    return false;
}

// Sends a POST request for adding a card to the current deck
const handleAddCard = (e, onCardAdded) => {
    e.preventDefault();
    helper.hideError();
    helper.hideOptions();

    const cardName = e.target.querySelector('#cardName').value;
    const cardCount = e.target.querySelector('#cardCount').value;
    const cardLocation = e.target.querySelector('#cardLocation').value;

    if(!cardName || !cardCount || !cardLocation) {
        helper.handleError('ERROR: All fields are required!');
        return false;
    }

    if (selectedDeckName === "[No Deck Selected]" || selectedDeckName === "") {
        helper.handleError('ERROR: No deck selected!');
        return false;
    }

    helper.sendPost(e.target.action, {selectedDeckName, cardName, cardCount, cardLocation}, onCardAdded);
    return false;
};

// Sends a POST request for removing a card from the current deck
const handleRemoveCard = (e, cardData, onCardRemoved) => {
    e.preventDefault();
    helper.hideError();
    helper.hideOptions();

    const cardName = cardData.cardName;
    const cardLocation = cardData.cardLocation;

    if(!cardName) {
        helper.handleError('ERROR: Something went wrong removing a card!');
        return false;
    }

    helper.sendPost(e.target.action, {selectedDeckName, cardName, cardLocation}, onCardRemoved);
    
    return false;
};

// Sends a POST request for swapping a card's location in the current deck
const handleSwapCardLocation = (e, cardData, onCardRemoved) => {
    e.preventDefault();
    helper.hideError();
    helper.hideOptions();

    const cardName = cardData.cardName;
    const cardLocation = cardData.cardLocation;

    if(!cardName) {
        helper.handleError('ERROR: Something went wrong moving a card!');
        return false;
    }

    helper.sendPost(e.target.action, {selectedDeckName, cardName, cardLocation}, onCardRemoved);
    
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
    };
    
    return (
        <form id="selectForm"
            name="selectForm"
            className="selectForm"
        >
            <label for="existingDeck">or select an existing Deck: </label>
            <select name="existingDeck" id="existingDeck" onChange={(e) => handleSelectDeck(e, props.triggerReload)}>
                <option value="[No Deck Selected]" selected>Choose a Deck:</option>
                {deckNodes}
            </select> 
        </form>
    );
};

// Renders buttons to export/delete deck
const DeckOptions = (props) => {
    return(
        <div>
            <form id="shareForm"
                onSubmit={(e) => handleShareDeck(e, props.triggerReload)}
                name="shareForm"
                action="/shareDeck"
                method="POST"
                className="shareForm"
            >
                <input className="shareDeckSubmit" type="submit" value="Share Deck" />
            </form>
            <form id="deleteForm"
                onSubmit={(e) => handleDeleteDeck(e, props.triggerReload)}
                name="deleteForm"
                action="/deleteDeck"
                method="POST"
                className="deleteForm"
            >
                <input className="deleteDeckSubmit" type="submit" value="Delete Deck" />
            </form>
        </div>
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
            <label htmlFor="cardLocation">Add to: </label>
            <select name="cardLocation" id="cardLocation">
                <option value="maindeck">Maindeck</option>
                <option value="sideboard">Sideboard</option>
            </select>
            <input className="addCardSubmit" type="submit" value="Add" />
        </form>
    );
};

// Renders decklist data for mainboard
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

    const currentDeck = decks.find((deck) => deck.name == selectedDeckName);

    try {
        const cardArray = currentDeck.maindeck;

        if(cardArray.length === 0) {
            return ( 
                <div className="deckList">
                    <p>There are currently no cards in this deck. Start by adding some!</p>
                </div>
            );
        }
        
        // Create individual card displays as list items
        const cardNodes = cardArray.map(currentCard => {
            return (
                <li class="cardDisplay">
                    <p id="cardInfoDisplay">{currentCard.cardCount}x  |  <strong id="cardName">{currentCard.cardName}</strong></p>
                    <img id="cardImageDisplay" src={currentCard.cardImage} alt="Card Image" width="180px"></img>
                    <form id="swapCardForm"
                    onSubmit={(e) => handleSwapCardLocation(e, 
                        { cardName: currentCard.cardName, cardLocation: "maindeck", },
                        props.triggerReload)}
                    name="swapCardForm"
                    action="/swapCardLocation"
                    method="POST"
                    className="swapCardForm"
                    >
                        <input id="cardSwapButton" className="swapCardSubmit" type="submit" value="Move to Sideboard" />
                    </form>
                    <form id="removeCardForm"
                    onSubmit={(e) => handleRemoveCard(e, 
                        { cardName: currentCard.cardName, cardLocation: "maindeck", },
                        props.triggerReload)}
                    name="removeCardForm"
                    action="/removeCard"
                    method="POST"
                    className="removeCardForm"
                    >
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
    } catch (err) {
        return ( 
            <div className="deckList">
                <p>There are currently no cards in this deck. Start by adding some!</p>
            </div>
        );
    }
    
};

// Renders decklist data for sideboard
const Sideboard = (props) => {
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
                <p>No deck selected.</p>
            </div>
        );
    }
    
    
    const currentDeck = decks.find((deck) => deck.name == selectedDeckName);

    try {
        const cardArray = currentDeck.sideboard;

        if(cardArray.length === 0) {
            return ( 
                <div className="deckList">
                    <p>There are currently no cards in the sideboard.</p>
                </div>
            );
        }

        // Create individual card displays as list items
        const cardNodes = cardArray.map(currentCard => {
            return (
                <li class="cardDisplay">
                    <p id="cardInfoDisplay">{currentCard.cardCount}x  |  <strong id="cardName" value="sideboard">{currentCard.cardName}</strong></p>
                    <img id="cardImageDisplay" src={currentCard.cardImage} alt="Card Image" width="180px"></img>
                    <form id="swapCardForm"
                    onSubmit={(e) => handleSwapCardLocation(e, 
                        { cardName: currentCard.cardName, cardLocation: "sideboard", },
                        props.triggerReload)}
                    name="swapCardForm"
                    action="/swapCardLocation"
                    method="POST"
                    className="swapCardForm"
                    >
                        <input id="cardSwapButton" className="swapCardSubmit" type="submit" value="Move to Maindeck" />
                    </form>
                    <form id="removeCardForm"
                    onSubmit={(e) => handleRemoveCard(e, 
                        { cardName: currentCard.cardName, cardLocation: "sideboard", },
                        props.triggerReload)}
                    name="removeCardForm"
                    action="/removeCard"
                    method="POST"
                    className="removeCardForm"
                    >
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
    } catch (err) {
        return ( 
            <div className="deckList">
                <p>There are currently no cards in the sideboard.</p>
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
            <div id="decks">
                <DeckDropdown decks={[]} reloadDecks={reloadDecks} triggerReload={() => setReloadDecks(!reloadDecks)} />
            </div>
            <hr></hr>
            <img src="/assets/img/banner-ad-1.png" alt="Your advertisement here!" width="100%"></img>
            <hr></hr>
            <h3>{selectedDeckName}</h3>
            {selectedDeckName !== "[No Deck Selected]" &&
                <DeckOptions triggerReload={() => setReloadDecks(!reloadDecks)} />
            }   
            {selectedDeckName !== "[No Deck Selected]" &&
                <fieldset>
                    <legend>Editor</legend>
                    <div id="addCard">
                        <AddCardForm triggerReload={() => setReloadDecks(!reloadDecks)} />
                    </div>
                </fieldset>
            }
            <div id="userMessage" class='hidden'>
                <p><strong id="errorMessage"></strong></p>
            </div>
            {selectedDeckName !== "[No Deck Selected]" &&
                <div id="optionsMessage" class='hidden'>
                    <p><em>Did you mean:</em></p>
                    <ul id="optionsList"></ul>
                </div>
            }
            {selectedDeckName !== "[No Deck Selected]" &&
            <fieldset>
                <legend>Maindeck</legend>
                <pre>
                    <div id="maindeck">
                        <DeckList decks={[]} reloadDecks={reloadDecks} triggerReload={() => setReloadDecks(!reloadDecks)}/>
                    </div>
                </pre>
            </fieldset>
            }
            {selectedDeckName !== "[No Deck Selected]" &&
                <fieldset>
                    <legend>Sideboard</legend>
                    <pre>
                        <div id="sideboard">
                            <Sideboard decks={[]} reloadDecks={reloadDecks} triggerReload={() => setReloadDecks(!reloadDecks)}/>
                        </div>
                    </pre>
                </fieldset>
            }  
            <hr></hr>
            <img src="/assets/img/banner-ad-2.png" alt="Your advertisement here!" width="100%"></img>
            <hr></hr>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App />);
};

window.onload = init;