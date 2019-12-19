var mysql = require('mysql');
require('dotenv').config();

var connect = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'competencias',
};

var connection = mysql.createConnection(connect);
connection.connect();
module.exports = connection;