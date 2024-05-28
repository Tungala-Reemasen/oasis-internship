
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    session({
        secret: 'your_secret_key_here', // Change this to a secure, random key
        resave: false,
        saveUninitialized: true,
    })
);

// In-memory user storage (you can replace this with a database)
const users = [];

// Home page
app.get('/', (req, res) => {
    if (req.session.username) {
        return res.redirect('/secured');
    }
    res.send(`
    <h1>Welcome</h1>
    <a href="/register">Register</a> | <a href="/login">Login</a>`);
});

// Register page
app.route('/register')
    .get((req, res) => {
        res.send(`<h1>Register</h1>
    <form action="/register" method="post">
        <label>Username:</label>
        <input type="text" name="username" required><br>
        <label>Password:</label>
        <input type="password" name="password" required><br>
        <input type="submit" value="Register">
    </form>
    <a href="/">Back to Home</a>
    `);
    })
    .post((req, res) => {
        const { username, password } = req.body;

        // Check if the username already exists
        const userExists = users.some((user) => user.username === username);
        if (userExists) {
            return res.send(`
        <p style="color: red;">Username already exists!</p>
        <a href="/register">Back to Register</a>`);
        }

        // Create a new user
        users.push({ username, password });

        res.redirect('/login');
    });

// Login page
app.route('/login')
    .get((req, res) => {
        res.send(`
    <h1>Login</h1>
    <form action="/login" method="post">
        <label>Username:</label>
        <input type="text" name="username" required><br>
        <label>Password:</label>
        <input type="password" name="password" required><br>
        <input type="submit" value="Login">
    </form>
    <a href="/">Back to Home</a>
    `);
    })
    .post((req, res) => {
        const { username, password } = req.body;

        // Find the user
        const user = users.find((user) => user.username === username);

        if (user && user.password === password) {
            req.session.username = username;
            res.redirect('/secured');
        } else {
            res.send(`
        <p style="color: red;">Invalid credentials!</p>
        <a href="/login">Back to Login</a>`);
        }
    });

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Secured page
app.get('/secured', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login');
    }
    res.send(`
    <h1>Welcome to the Secured Page, ${req.session.username}!</h1>
    <p>This page is only accessible to logged-in users.</p>
    <a href="/logout">Logout</a>`);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});