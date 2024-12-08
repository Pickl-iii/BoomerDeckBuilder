// SOURCE: Based on code provided as part of a class assignment. Code has been modified.

const React = require('react');
const {createRoot} = require('react-dom/client');

const ErrorWindow = () => {
    // https://stackoverflow.com/questions/2906582/how-do-i-create-an-html-button-that-acts-like-a-link
    return (
        <div class="window-body error">
            <p>The requested page does not exist.</p>
            <form action="/builder">
                <button class="default" type="submit">Go Back</button>
            </form>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById("content"));
    root.render( <ErrorWindow /> );
};

window.onload = init;