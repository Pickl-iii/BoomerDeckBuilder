// SOURCE: Based on code provided as part of a class assignment. Code has been modified.

const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');

// Sends a POST request for attempting to log in
const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if(!username || !pass) {
        helper.handleError('ERROR: All fields are required!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass});
    return false;
}

// Sends a POST request for signing up
const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if(!username || !pass || !pass2) {
        helper.handleError('ERROR: All fields are required!');
        return false;
    }

    if(pass !== pass2) {
        helper.handleError('WARNING: Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, pass2});

    return false;
}

// Sends a POST request for changing password
const handleChangePassword = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;

    if(!username || !pass || !newPass || !newPass2) {
        helper.handleError('ERROR: All fields are required!');
        return false;
    }

    if(newPass !== newPass2) {
        helper.handleError('WARNING: Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, newPass, newPass2});

    return false;
}

// Renders fields and button to log in
const LoginWindow = (props) => {
    return (
        <form  id="loginForm"
            name = "loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
            class="field-row-stacked"
        >
            <label htmlFor="username">Screen Name: </label>
            <input id="user" type="text" name="username" placeholder="Your Screen Name" />
            <label htmlFor="pass">Secret Password: </label>
            <input id="pass" type="password" name="pass" placeholder="Your Password" />
            <input className="formSubmit" type="submit" value="Log in!" />
        </form>
    );
};

// Renders fields and button to sign up
const SignupWindow = (props) => {
    return (
        <form  id="signupForm"
            name = "signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
            class="field-row-stacked"
        >
            <label htmlFor="username">Screen Name: </label>
            <input id="user" type="text" name="username" placeholder="Your Screen Name" />
            <label htmlFor="pass">Secret Password: </label>
            <input id="pass" type="password" name="pass" placeholder="Your Password" />
            <label htmlFor="pass2">Re-type Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="Your Password (again)" />
            <input className="formSubmit" type="submit" value="Sign up!" />
        </form>
    );
};

// Renders fields and button to change password
const ChangePasswordWindow = (props) => {
    return (
        <form  id="changePasswordForm"
            name = "changePasswordForm"
            onSubmit={handleChangePassword}
            action="/changePassword"
            method="POST"
            className="mainForm"
            class="field-row-stacked"
        >
            <label htmlFor="username">Screen Name: </label>
            <input id="user" type="text" name="username" placeholder="Your Screen Name" />
            <label htmlFor="pass">Current Password: </label>
            <input id="pass" type="password" name="pass" placeholder="Your Old Password" />
            <label htmlFor="newPass">New Password: </label>
            <input id="newPass" type="password" name="newPass" placeholder="Your New Password" />
            <label htmlFor="newPass2">Re-type New Password: </label>
            <input id="newPass2" type="password" name="newPass2" placeholder="Your New Password (again)" />
            <input className="formSubmit" type="submit" value="Change Password" />
        </form>
    );
};

const init = () => {
    const loginButton = document.getElementById("loginButton");
    const signupButton = document.getElementById("signupButton");
    const changePasswordButton = document.getElementById("changePasswordButton");

    const root = createRoot(document.getElementById("content"));

    // Add buttons to allow user to switch tabs in window

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render( <LoginWindow /> );

        loginButton.parentElement.ariaSelected = "true";
        signupButton.parentElement.ariaSelected = "false";
        changePasswordButton.parentElement.ariaSelected = "false";

        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render( <SignupWindow /> );

        loginButton.parentElement.ariaSelected = "false";
        signupButton.parentElement.ariaSelected = "true";
        changePasswordButton.parentElement.ariaSelected = "false";

        return false;
    });

    changePasswordButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render( <ChangePasswordWindow /> );

        loginButton.parentElement.ariaSelected = "false";
        signupButton.parentElement.ariaSelected = "false";
        changePasswordButton.parentElement.ariaSelected = "true";

        return false;
    });

    root.render( <LoginWindow /> );
};

window.onload = init;