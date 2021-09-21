const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const handlebars = require('handlebars');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');

dotenv.config({ path: './.env'});

const app = express();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
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
app.use('/profile', require('./routes/profile'));

app.listen(3000, () => {
  console.log("Server started on Port 3000");
})

