const pool = require('../config/db');
const puntosService = require('../services/puntos.service');

exports.registrar = async (req, res, next) => {
  const { usuario_id, evento_id, puntos } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO asistencia_evento (usuario_id, evento_id, puntos_otorgados)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [usuario_id, evento_id, puntos]
    );

    await puntosService.otorgarPuntos(usuario_id, puntos);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
