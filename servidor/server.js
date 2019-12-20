var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controllerCompetencias = require('./controladores/competenciasController');
var controllerCrud = require('./controladores/crudController');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.get('/competencias', controllerCompetencias.listarCompetencias);
app.get('/competencias/:id/peliculas', controllerCompetencias.listarOpciones);
app.post('/competencias/:id/votos', controllerCompetencias.listarVotos);
app.get('/competencias/:id/resultados', controllerCompetencias.resultados);
app.get('/genres', controllerCompetencias.generos);
app.get('/directores', controllerCompetencias.directores);
app.get('/actores', controllerCompetencias.actores);
app.post('/competencias', controllerCrud.crearCompetencia);
app.put('/competencias/:id', controllerCrud.actualizarCompetencia);
app.get('/competencias/:id', controllerCrud.consultarCompetencia);
app.delete('/competencias/:id/votos', controllerCrud.reiniciarCompeticion);
app.delete('/competencias/:id', controllerCrud.eliminarCompetencia);

var puerto = '8080';

app.listen(puerto, function () {
  console.log("Escuchando en el puerto " + puerto);
});