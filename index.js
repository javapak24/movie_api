const mongoose = require('mongoose');
const Models = require('./models.js');

mongoose.connect('mongodb+srv://java:passw0rd@cluster0.hzurcpu.mongodb.net/moviesdb', {
   useNewUrlParser: true, useUnifiedTopology: true 
  });

const Movies = Models.Movie;

const Users = Models.User;

const express = require('express');
var cors = require('cors')
const app = express();
app.use(cors());

const fs = require('fs'); // import built in node modules fs and path 
const path = require('path');
const morgan = require('morgan');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const bodyParser = require('body-parser');
const uuid = require('uuid');

app.use(bodyParser.json());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

let users = [
    {
      id:'1',
      fullname: 'John Doe',
      email: 'johndoe@mail.com',
      favMovies: [{
        title: 'Inception',
        director: 'Christopher Nolan',
        genre: 'Sci-Fi'
      }]
    },
    {
      id:'2',
      fullname: 'Jane Doe',
      email: 'janedoe@mail.com',
      favMovies: [{
        title: 'Inception',
        director: 'Christopher Nolan',
        genre: 'Sci-Fi'
      }]
    }
  
  ];

let movies = [
    {
      title: 'Inception',
      director: 'Christopher Nolan',
      genre: 'Sci-Fi'
    },
    {
      title: 'Lord of the Rings',
      director: 'Peter Jackson',
      genre: 'Super-Heroes'
    },
    {
      title: 'The Matrix',
      director: 'Lana Wachowski',
      genre: 'Sci-fi'
    },
    {
        title: 'The Avengers',
        director: 'Anthony Russo',
        genre: 'Super-Heroes'
      },
      {
        title: 'The Silence Of The Lambs',
        director: 'Jonathan Demme',
        genre: 'Suspense-Thriller'
      },
      {
        title: 'Terminator',
        director: 'James Cameron',
        genre: 'Action'
      },
      {
        title: 'The Prestige',
        director: 'Christopher Nolan',
        genre: 'Suspense-Thriller'
      },
      {
        title: 'Shutter Island',
        director: 'Martin Scorsese',
        genre:'Suspense-Thriller'
      },
      {
        title: 'The Fugitive',
        director: 'Andrew Davis',
        genre: 'Suspense-Thriller'
      },
      {
        title: 'The Shack',
        director: 'Stuart Hazeldine',
        genre: 'Feel-Good'
      }
  ];


app.get('/', (req, res) => {
    res.send('Welcome to my movie API!');
});

// READ// protect
app.get('/movies', async (req, res) => {
    return res.json(await Movies.find());
});

//READ by title// protect
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {title} = req.params;
    const movie = await Movies.findOne({Title: title});

    if(movie){
        res.status(200).json(movie);
    }
    else{
        res.status(404).send('Movie not found :( ');
    }
});

//READ Genre by title//protect
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }), async  (req, res) => {
    const {genre} = req.params;
    const movie = await Movies.findOne({ "Genre.Name": genre});

    if(movie){
        res.status(200).json(movie.Genre);
    }
    else{
        res.status(404).send('Movie not found :( ');
    }
});

//READ Director by title ///// protect
app.get('/movies/director/:director', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {director} = req.params;
    const movie = await Movies.find({ "Director.Name": director});

    if(movie){
        res.status(200).json(movie[0]);
   }
    else{
        res.status(404).send('Movie not found :( ');
    }
});

//READ Documentation///no protect
app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});


//Create new user/// no protect
app.post('/users', async (req, res) => {
    const newUser = req.body;
        res.status(201).json(await Users.create(newUser));
});

//Update user info////protect
app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { username } = req.params;
  const updatedUser = req.body;

  let user = await Users.findOneAndUpdate({Username: username} 
  ,{ $set:
    {
        Username: updatedUser.Username,
        Password: updatedUser.Password,
        Email: updatedUser.Email,
        Birthday: updatedUser.Birthday,
        FavoriteMovies: updatedUser.FavoriteMovies
    }
  },
  { new: true})
  .then((updated) =>{
    res.status(200).json(updated);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send(err);
  });
});

//Update users favMovie///protect
app.post('/users/:username/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { username , movieId } = req.params;
  

  const user = await Users.findOneAndUpdate(
    { Username: username }, 
    { $push: { FavoriteMovies: movieId } },
    { new: true }
  );
  res.json(user);
});

// Delete favorite movie
app.delete('/users/:username/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { username , movieId } = req.params;
  

  const user = await Users.findOneAndUpdate(
    { Username: username }, 
    { $pull: { FavoriteMovies: movieId } },
    { new: true }
  );
  res.json(user);
  
});

//Delete a user////
app.delete('/users/:username/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {username} = req.params;
    const user = await Users.findOneAndDelete({Username: username});

    if(user){
        res.status(200).send(`${username} is deleted`);
    }
    else{
        res.status(404).send('User not found :( ');
    }
});

const PORT = process.env.PORT || 8080;

//Server
app.listen(PORT, ()=>{
    console.log('server is running on 8080');
});
