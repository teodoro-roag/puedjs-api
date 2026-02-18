const pool = require('../config/db');

exports.create = async (req, res, next) => {
  try {
    const { nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio } = req.body;

    const result = await pool.query(
      `INSERT INTO usuarios 
       (nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getPuntos = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM puntos_usuario WHERE usuario_id = $1',
      [req.params.id]
    );

    res.json(result.rows[0] || { puntos_totales: 0 });
  } catch (error) {
    next(error);
  }
};
