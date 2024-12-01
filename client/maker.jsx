// SOURCE: Based on code provided as part of a class assignment. Code has been modified.

const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

let selectedDeckName = "";

const handleDeck = (e, onDeckAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#deckName').value;

    if(!name) {
        helper.handleError('Deck name is required!');
        return false;
    }

    selectedDeckName = name;
    helper.sendPost(e.target.action, {name}, onDeckAdded);
    return false;
};

const DeckForm = (props) => {
    return(
        <form id="deckForm"
            onSubmit={(e) => handleDeck(e, props.triggerReload)}
            name="deckForm"
            action="/maker"
            method="POST"
            className="deckForm"
        >
            <label htmlFor="name">Make a brand new Deck: </label>
            <input id="deckName" type="text" name="name" placeholder="Deck Name" />
            <input className="makeDeckSubmit" type="submit" value="Create" />
        </form>
    );
};

const selectDeck = (e, onDeckSelected) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#existingDeck').value;
    
    selectedDeckName = name;
    return false;
};

const DeckDropdown = (props) => {
    const [decks, setDecks] = useState(props.decks);

    useEffect(() => {
        const loadDecksFromServer = async () => {
            const response = await fetch('/getDecks');
            const data = await response.json();
            setDecks(data.decks);
        };
        loadDecksFromServer();
    }, [props.reloadDecks]);

    const deckNodes = decks.map(deck => {
        return (
            <option key={deck.id} value={deck.name}>
                {deck.name}
            </option>
        );
    });

    return (
        <form id="selectForm"
            onSubmit={(e) => selectDeck(e, props.triggerReload)}
            name="selectForm"
            action="/maker"
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

const handleAddCard = (e, onCardAdded) => {
    e.preventDefault();
    helper.hideError();

    const cardName = e.target.querySelector('#cardName').value;
    const cardCount = e.target.querySelector('#cardCount').value;

    if(!cardName || !cardCount) {
        helper.handleError('Both fields are required!');
        return false;
    }

    helper.sendPost(e.target.action, {selectedDeckName, cardName, cardCount}, onCardAdded);
    return false;
}

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
            <input id="cardCount" type="number" name="cardCount" placeholder="1" min="1" max="4"/>
            <input className="addCardSubmit" type="submit" value="Add" />
        </form>
    );
};

const handleRemoveCard = (e, onCardRemoved) => {
    e.preventDefault();
    helper.hideError();

    /*
    const cardName = e.target.querySelector('#cardName').value;

    console.log(e.target);
    console.log(cardName);

    if(!cardName) {
        helper.handleError('Error removing card!');
        return false;
    }

    helper.sendPost(e.target.action, {selectedDeckName, cardName}, onCardRemoved);
    */
    return false;
}

const DeckList = (props) => {
    const [cards, setCards] = useState(props.cards);

    useEffect(() => {
        const loadCardsFromServer = async () => {
            const response = await fetch(`/getCards?deck=${selectedDeckName}`);
            const data = await response.json();
            setCards(data.cards);
        };
        loadCardsFromServer();
    }, [props.reloadCards]);

    if(cards) {
        const cardNodes = cards.map(card => {
            return (
                <li>
                    <form id="removeCardForm"
                    onSubmit={(e) => handleRemoveCard(e, props.triggerReload)}
                    name="removeCardForm"
                    action="/removeCard"
                    method="POST"
                    className="removeCardForm"
                    value={card}
                    >
                        <p id="cardName">{card}   </p>
                        <input className="removeCardSubmit" type="submit" value="Remove" />
                    </form>
                </li>
            );
        });
        
        return ( 
            <div className="deckList">
                <h2>{selectedDeckName}</h2>
                <ul id="cardsList">
                    {cardNodes}
                </ul> 
            </div>
        );
    } else {
        return ( 
            <div className="deckList">
                <h2>{selectedDeckName}</h2>
                <p>There are currently no cards in this deck.</p>
            </div>
        );
    }
    
};

const App = () => {
    const [reloadDecks, setReloadDecks] = useState(false);
    const [reloadCards, setReloadCards] = useState(false);

    return (
        <div>
            <div id="makeDeck">
                <DeckForm triggerReload={() => setReloadDecks(!reloadDecks)} />
            </div>
            <div if="decks">
                <DeckDropdown decks={[]} reloadDecks={reloadDecks} />
            </div>
            <hr></hr>
            <div id="addCard">
                <AddCardForm triggerReload={() => setReloadCards(!reloadCards)} />
            </div>
            <div if="cards">
                <DeckList cards={[]} reloadCards={reloadCards}/>
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App />);
};

window.onload = init;