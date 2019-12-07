const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  db_uri: process.env.DB_URI,
  secret: process.env.SECRET,
  PORT: process.env.PORT
};