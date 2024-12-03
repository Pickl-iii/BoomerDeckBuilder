// SOURCE: Based on code provided as part of a class assignment. Code has been modified.

const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');

const handleChangePassword = (e) => {
    e.preventDefault();
    helper.hideError();

    //const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;

    if(!pass || !newPass || !newPass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if(newPass !== newPass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {pass, newPass, newPass2});

    return false;
}

// <label htmlFor="username">Username: </label>
// <input id="user" type="text" name="username" placeholder="username" />

const ChangePasswordWindow = (props) => {
    return (
        <form  id="changePasswordForm"
            name = "changePasswordForm"
            onSubmit={handleChangePassword}
            action="/changePassword"
            method="POST"
            className="mainForm"
        >
            
            <label htmlFor="pass">Current Password: </label>
            <input id="pass" type="password" name="pass" placeholder="current password" />
            <label htmlFor="newPass">New Password: </label>
            <input id="newPass" type="password" name="newPass" placeholder="new password" />
            <label htmlFor="newPass2">New Password: </label>
            <input id="newPass2" type="password" name="newPass2" placeholder="retype new password" />
            <input className="formSubmit" type="submit" value="Change Password" />.
        </form>
    );
};

const init = () => {
    const root = createRoot(document.getElementById("content"));
    root.render( <ChangePasswordWindow /> );
};

window.onload = init;