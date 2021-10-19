const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');



dotenv.config({ path: './.env'});

const app = express();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  helpers: {
    ifCond: ('ifCond', function (v1, operator, v2, options) {

      switch (operator) {
          case '==':
              return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
              return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=':
              return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==':
              return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
              return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
              return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
              return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
              return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
              return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
              return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
              return options.inverse(this);
      }
  })
  }
});

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());


app.set('view engine', 'hbs');

db.connect( (error) => {
  if(error) {
    console.log(error)
  } else {
    console.log("MYSQL Connected")
  }
})

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/', require('./routes/auth'));
app.use('/list', require('./routes/listPublication'))
app.use('/list/questions', require('./routes/listQuestions'))
app.use('/profile', require('./routes/profile'));
app.use('/favorites', require('./routes/favorites'));
app.use('/publication', require('./routes/publication'));
app.use('/create', require('./routes/createPublication'));
app.use('/notifications', require('./routes/notifications'));


app.listen(3000, () => {
  console.log("Server started on Port 3000");
})

console.log("App version: "+process.env.VERSION);