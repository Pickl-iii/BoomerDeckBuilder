// SOURCE: Based on code provided as part of a class assignment. Code has been lightly modified.

const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

// Removes user from session
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// Attempts to login the user based on credentials
const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'ERROR: All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'WARNING: Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/builder' });
  });
};

// Attempts to create a new account in database
const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'ERROR: All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'WARNING: Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/builder' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'ERROR: Username already taken!' });
    }
    return res.status(500).json({ error: 'SERVER ERROR: Something went wrong creating an account!' });
  }
};

// Attempts to update password to new value
const changePassword = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const newPass = `${req.body.newPass}`;
  const newPass2 = `${req.body.newPass2}`;

  if (!username || !pass || !newPass || !newPass2) {
    return res.status(400).json({ error: 'ERROR: All fields are required!' });
  }

  if (newPass !== newPass2) {
    return res.status(400).json({ error: 'WARNING: Passwords do not match!' });
  }

  return Account.authenticate(username, pass, async (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'WARNING: Wrong username or password!' });
    }

    try {
      const hash = await Account.generateHash(newPass);
      await Account.findOneAndUpdate(
        { username },
        { $set: { password: hash } },
      ).exec();
      req.session.account = Account.toAPI(account);
      return res.json({ redirect: '/login' });
    } catch (err2) {
      console.log(err2);
      return res.status(500).json({ error: 'SERVER ERROR: Something went wrong updating password!' });
    }
  });
};

module.exports = {
  loginPage,
  logout,
  login,
  signup,
  changePassword,
};
