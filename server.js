const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// Routes
// Root Request
app.get('/', (req, res) => {
    // This is where we will retrieve the users from the database and include them in the view page we will be rendering.
    res.render('index.ejs');
})
// Add User Request 
app.post('/users', (req, res) => {
    console.log("POST DATA", req.body);
    // This is where we would add the user from req.body to the database.
    res.redirect('/');
})

// Raffle:
app.get('/raffle', (req, res) => {
  res.render('raffle.ejs');
})

// Lottery:
app.get('/lottery', (req, res) => {
  res.render('lottery.ejs');
})

app.listen(port, () => {
    console.log(`Server Running On port ${port}`);
})