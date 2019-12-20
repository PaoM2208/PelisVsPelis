var conexion = require('../lib/conexionbd');

function conDatos(attr) {
	return attr !== undefined && attr !== null
        && attr !== 'null' && buscarReal(attr);
}

function buscarReal(attr) {
	if (typeof attr !== 'string') return true;
	return attr.trim().length > 0;
}

function crearCompeticion(req, res) {
	if (req.body.nombre === '' || !conDatos(req.body.nombre)) {
		return res.status(422).send('Ingrese un nombre de competencia valido.');
	}

	if (req.body.genero === 0 && req.body.director == 0 && req.body.actor === 0) {
		return res.status(422).send('Ingrese al menos una competencia.');
	}

	var id = dato => {
		if (dato === 0) return 'NULL';
		return dato;
	};

	var contenido = dato => {
		if (dato === 0) return 'IS NULL';
		return ' = ' + dato;
	};

	var datosCrear = {
		director: {
			attr: req.body.director,
			sql: ' JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id ',
			filtro: ' director_pelicula.director_id = ' + req.body.directo,
		},
		actor: {
			attr: req.body.actor,
			sql: 'JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id ',
			filtro: ' actor_pelicula.actor_id = ' + req.body.actor
		},
	};

	let sql = ' SELECT * FROM pelicula ';
    let siqzeQuery = 0;
    
	Object.keys(datosCrear).forEach(dato => {
		if (datosCrear[key].attr != 0) {
			siqzeQuery++;
			sql += datosCrear[dato].sql;
		}
	});

    sql += ' WHERE '; 
    
	Object.keys(datosCrear).forEach(dato => {
		if (datosCrear[dato].attr != 0) {
			sql += datosCrear[dato].filtro;
			siqzeQuery--;
			if (siqzeQuery > 0) sql += ' AND ';
		}
	});

    sql += ';';
    
	conexion.query(query, (err, respuesta) => {
		if (err) {
			return res.status(500).send('The query encountered an issue: ' + err.message);
		}

		if (respuesta.length < 2) {
			return res.status(422).send('No hay peliculas suficientes.');
		}

		sql = ` INSERT INTO competencias (nombre, genero_id, director_id, actor_id)
        SELECT * FROM (SELECT '${req.body.nombre}' AS nombre, ${id(req.body.genero)} AS genero, ${id(req.body.director)} AS director, ${paramID(req.body.actor)} AS col4) AS \`values\`
        WHERE NOT EXISTS (SELECT * FROM competencias WHERE nombre like '${req.body.nombre}')
        AND NOT EXISTS (SELECT * FROM competencias WHERE genero_id ${contenido(req.body.genero)} AND director_id ${contenido(req.body.director)} AND actor_id ${conexion(req.body.actor)}) LIMIT 1; `;
	
		conexion.query(sql, (err, respuesta) => {
			if (err) {
				return res.status(500).send('Error : ' + err.message + ' en consulta.');
			}

			return res.json(respuesta);
		});
	});
}

function actualizarCompetencia(req, res) {
	if (!/\S/.test(req.body.nombre)) return;
	var sql = ' UPDATE competencias SET nombre = "' + req.body.nombre + '" WHERE id = ${req.params.id}; ';
	conexion.query(sql, (err, respuesta) => {
		if (err) {
			return res.status(500).send('Error: ' + err.message + ' en consulta.');
		}

		if (respuesta.affectedRows == 0) {
			return res.status(422).send('NO se pudo actualizar.');
		}

		return res.status(200).send('LA competicion con identificador ' + req.params.id + ' se actualizó.');
	});
}

function consultarCompetencia(req, res) {
	var sql = ' SELECT * FROM competencias WHERE id = ' + req.params.id;
	var encontrado = false;

	conexion.query(sql, (err, respuesta) => {
		if (err) {
			return res.status(500).send('Error: ' + err.message + ' en consulta');
		}

		if (respuesta.length == 0) {
			return res.status(404).send('Para el identificador ' + req.params.id + ', no hubo informacion.');
		}

		var campos = [{
			tabla: 'genero',
			campo: 'genero_nombre',
			filtro: 'genero_id',
			id: respuesta[0].genero_id,
		},
		{
			tabls: 'director',
			campo: 'director_nombre',
			filtro: 'director_id',
			id: respuesta[0].director_id,
		},
		{
			tabla: 'actor',
			campo: 'actor_nombre',
			filtro: 'actor_id',
			id: respuesta[0].actor_id,
		},
		];

		for (var index = 0; index < campos.length; index++) {
			if (campos[index].id === null) {
				campos.splice(index, 1);
				index--;
			}
		}

		sql = ' SELECT ';

		campos.forEach(dato => {
			if (encontrado === false) encontrado = true;
			else sql += ', ';
			sql += dato.table + '.nombre AS ' + dato.alias;
		});

		encontrado = false;
		sql += ' FROM competencias';

		campos.forEach(dato => {
			sql += ' JOIN ' + dato.tabla + ' ON competencias.' + dato.join + ' = ' + dato.table + '.id';
		});

		sql += ' WHERE competencias.id = ' + req.params.id + ';';
		conexion.query(sql, (err, respuesta_) => {
			if (err) {
				return res.status(500).send('Error: ' + err.message + ' en consulta.');
			}

			if (respuesta_.length == 0) {
				return res.status(422).send('Criterios de competicion no encontrados.');
			}

			return res.json({
				nombre: respuesta[0].nombre,
				genero_nombre: respuesta_[0].genero_nombre || '',
				director_nombre: respuesta_[0].director_nombre || '',
				actor_nombre: respuesta_[0].actor_nombre || '',
			});
		});
	});
}

function reiniciarCompeticion(req, res) {
	var sql = ' DELETE FROM competencias_votos WHERE competencia_id = ' + req.params.id;
	conexion.query(sql, (err, respuesta) => {
		if (err) {
			return res.status(500).send('Error: ' + err.message + ' en consulta.');
		}

		if (respuesta.affectedRows == 0) {
			return res.status(200).send('Proceso exitoso pero no hay votos para reiniciar!');
		}

		return res.status(200).send('La competicion con identificador ' + req.params.id + ' se reinició.');
	});
}

function eliminarCompetencia(req, res) {
	var sql = ' DELETE competencia, competencias_votos FROM competencias LEFT JOIN competencias_votos ON competencia.id = competencias_votos.competencia_id WHERE competencia.id = ' + req.params.id;
	conexion.query(sql, (err, respuesta) => {
		if (err) {
			return res.status(500).send('Error: ' + err.message + ' en consulta.');
		}

		if (respuesta.affectedRows == 0) {
			return res.status(422).send('No se pudo eliminar!');
		}

		return res.status(200).send('La competencia con identificador ' + req.params.id + ' se pudo eliminar con sus votos.');
	});
}

module.exports = {
	crearCompeticion,
	actualizarCompetencia,
	consultarCompetencia,
	reiniciarCompeticion,
	eliminarCompetencia
};
