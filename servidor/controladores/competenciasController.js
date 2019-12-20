var conexion = require('../lib/conexionbd');

function conDatos(attr) {
	if (typeof attr !== 'string') return true;
	return attr.trim().length > 0;
}

function buscarReal(attr) {
	return attr !== undefined && attr !== null
        && attr !== 'null' && conDatos(attr);
}

function listarCompetencias(req, res) {
    var sql = "select * from competencia;";
    conexion.query(sql, function (err, resultado) {
        if (err) {
            return res.status(500).send(err.message + " en consulta competencia.");
        }
        res.send(JSON.stringify(resultado));
    });
}

function listarOpciones(req, res) {
	var sql = 'SELECT * FROM competencias WHERE id = ' + req.params.id;
	conexion.query(sql, (err, respuesta) => {
		if (err) {
			return res.status(500).send('Error ' + err.message + ' en consulta.');
		}

		if (respuesta.length < 1) {
			return res.status(422).send('No hay datos para esa consulta.');
        }
        
		var datosOpciones = {
			genero: {
				attr: [respuesta[0].genero_id],
				sql: ' JOIN genero ON genero.id = pelicula.genero_id ',
				filtro: ' genero.id = ' + respuesta[0].genero_id + ' '
			},
			director: {
				attr: [respuesta[0].director_id],
				sql: ' JOIN director_pelicula ON director_pelicula.pelicula_id = pelicula.id ',
				filtro: ' director_pelicula.director_id = ' + respuesta[0].director_id + ' '
			},
			actor: {
				attr: [respuesta[0].actor_id],
				sql: ' JOIN actor_pelicula ON actor_pelicula.pelicula_id = pelicula.id ',
				filtro: ' actor_pelicula.actor_id = ' + respuesta[0].actor_id + ' '
			},
		};

		let sql = ' SELECT pelicula.* FROM pelicula ';
        let sqlSize = 0;
        
		Object.keys(datosOpciones).forEach(dato => {
			if (datosOpciones[dato].attr.every(buscarReal)) {
				sqlSize++;
				sql += datosOpciones[dato].sql;
			}
		});

		sql += ' WHERE ';
		Object.keys(datosOpciones).forEach(dato => {
			if (datosOpciones[dato].attr.every(buscarReal)) {
				sql += datosOpciones[dato].filtro;
				sqlSize--;
				if (sqlSize > 0) sql += ' AND ';
			}
		});

		sql += ' ORDER BY RAND() LIMIT 2;';
		conexion.query(sql, (err_, respuesta_) => {
			if (err_) return res.status(500).send('Error ' + err.message + ' en consulta.');

			if (respuesta_.length < 2) {
				return res.status(422).send('No hay datos para esa consulta.');
			}

			return res.send(JSON.stringify({
				competicion: respuesta[0].nombre,
				pelicula: respuesta_,
			}));
		});
	});
}

function listarVotos(req, res) {
	var sql = ' CALL update_or_insert_vote(' + req.params.id + ', ' + req.body.movieID + ') ';
	conexion.query(sql, (err, respuesta) => {
		if (err) return res.status(500).send('Error ' + err.message + ' en consulta.');

		if (respuesta.affectedRows === 0) return res.status(422).send('No se pudo votar.');

		return res.json(response);
	});
}

function resultados(req, res) {
	var sql = ' SELECT * FROM competencia_voto JOIN pelicula ON pelicula.id = competencia_voto.pelicula_id WHERE competencia_voto.competencia_id = ' + req.params.id + ' ORDER BY voto DESC LIMIT 3;';
	conexion.query(sql, (err, respuesta) => {
		if (err) return res.status(500).send('Error ' + err.message + ' en consulta.');

		return res.json(respuesta);
	});
}

function generos(req, res) {
	var sql = ' SELECT * FROM genero; ';
	conexion.query(sql, (err, respuesta) => {
		if (err)
			return res.status(500).send('Error ' + err.message + ' en consulta.');

		if (respuesta.length === 0) return res.status(404).send('No hay coincidencia para \'genres\'.');

		return res.json(respuesta);
	});
}

function directores(req, res) {
	var sql = ' SELECT * FROM director; ';

	conexion.query(sql, (err, respuesta) => {
		if (err) return res.status(500).send('Error ' + err.message + ' en consulta.');

		if (respuesta.length === 0) return res.status(404).send('No hay coincidencia para \'directores\'.');

		return res.json(respuesta);
	});
}

function actores(req, res) {
	var sql = ' SELECT * FROM actor; ';

	conexion.query(sql, (err, respuesta) => {
		if (err) return res.status(500).send('Error ' + err.message + ' en consulta.');

		if (respuesta.length === 0) {
			return res.status(404).send('No hay coincidencia para \'actores\'.');
		}

		return res.json(respuesta);
	});
}

module.exports = {
    listarCompetencias,
    listarOpciones,
    listarVotos,
    resultados,
    generos,
    directores,
    actores
};