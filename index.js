const express = require('express');
const app = express();

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

// READ
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//READ by title
app.get('/movies/:title', (req, res) => {
    const {title} = req.params;
    const movie = movies.find( movie => movie.title === title )

    if(movie){
        res.status(200).json(movie);
    }
    else{
        res.status(404).send('Movie not found :( ');
    }
});

//READ Genre by title
app.get('/movies/:title/genre', (req, res) => {
    const {title} = req.params;
    const movie = movies.find( movie => movie.title === title )

    if(movie){
        res.status(200).json(movie.genre);
    }
    else{
        res.status(404).send('Movie not found :( ');
    }
});

//READ Director by title
app.get('/movies/:title/director', (req, res) => {
    const {title} = req.params;
    const movie = movies.find( movie => movie.title === title )

    if(movie){
        res.status(200).json(movie.director);
    }
    else{
        res.status(404).send('Movie not found :( ');
    }
});

//READ Documentation
app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});

//Create new user
app.post('/users', (req, res) => {
    const newUser = req.body;
    if(newUser.fullname){
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    }
    else{
        res.status(400).send('user needs name');
    }
});

//Update username
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if(user){
      user.fullname = updatedUser.fullname;
      res.status(200).json(user);
  }
  else{
      res.status(400).send('not a registered user');
  }
});

//Update users favMovie
app.post('/users/:id/:title', (req, res) => {
  const { id , title } = req.params;
  

  let user = users.find( user => user.id == id );
  let newTitle = {
    title,
    director: req.body.director,
    genre: req.body.genre
  };
  
  if(user){
      user.favMovies.push(newTitle);
      res.status(200).send('user\'s favorite movies have been updated');
  }
  else{
      res.status(400).send('could not update favorite movies');
  }
  console.log(JSON.stringify(user.favMovies));
});

//Delete a favorite movie
app.delete('/users/:id/:title', (req, res) => {
  const { id , title } = req.params;
  let user = users.find( user => user.id == id );

  if(user){
    user = user.favMovies.filter( m => m.title !== title)
    res.status(200).send('user\'s favorite movies have been updated');
  }
  else{
      res.status(400).send('could not update favorite movies');
  }
  console.log(JSON.stringify(user));
});
//Delete a user
app.delete('/users/:id/', (req, res) => {
  const { id  } = req.params;
  let user = users.find( user => user.id == id );

  if(user){
    users = users.filter( user => user.id !== id)
    console.log(users);
    res.status(200).send('user has been deleted');
  }
  else{
      res.status(400).send('could not update user');
  }
  
});
//Server
app.listen(8080, ()=>{
    console.log('server is running on 8080');
});
