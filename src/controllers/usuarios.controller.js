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
    const result = await pool.query(
      'SELECT id, nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio, fecha_registro FROM usuarios'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio, fecha_registro FROM usuarios WHERE id = $1',
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

exports.getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio, fecha_registro
       FROM usuarios
       WHERE id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { nombres, apellidos, numero_cuenta_unam, genero, como_conocio } = req.body;

    const result = await pool.query(
      `UPDATE usuarios
       SET nombres = COALESCE($1, nombres),
           apellidos = COALESCE($2, apellidos),
           numero_cuenta_unam = COALESCE($3, numero_cuenta_unam),
           genero = COALESCE($4, genero),
           como_conocio = COALESCE($5, como_conocio)
       WHERE id = $6
       RETURNING id, nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio, fecha_registro`,
      [nombres, apellidos, numero_cuenta_unam, genero, como_conocio, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getMisEventos = async (req, res, next) => {
  try {
    const usuario_id = req.user.id;

    const result = await pool.query(
      `SELECT 
         re.id as registro_id,
         re.fecha_registro,
         re.como_se_entero,
         e.id as evento_id,
         e.nombre,
         e.fecha,
         e.hora,
         e.lugar,
         e.descripcion,
         e.imagen_cartel
       FROM registro_evento re
       JOIN eventos e ON e.id = re.evento_id
       WHERE re.usuario_id = $1
       ORDER BY e.fecha DESC, e.hora DESC`,
      [usuario_id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
