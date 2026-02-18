const pool = require('../config/db');

exports.create = async (req, res, next) => {
  try {
    const { nombre, fecha, hora, lugar, descripcion, imagen_cartel } = req.body;

    const result = await pool.query(
      `INSERT INTO eventos 
       (nombre, fecha, hora, lugar, descripcion, imagen_cartel)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [nombre, fecha, hora, lugar, descripcion, imagen_cartel]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM eventos ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
