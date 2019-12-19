var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controller = require('./controladores/competenciasController');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.get('/competencias', controller.listarCompetencias);
//app.get('/generos', controller.buscarGenero);

var puerto = '8080';

app.listen(puerto, function () {
  console.log("Escuchando en el puerto " + puerto);
});