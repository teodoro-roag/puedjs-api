const pool = require('../config/db');
const puntosService = require('../services/puntos.service');

exports.registrar = async (req, res, next) => {
  try {
    const usuario_id = req.user.id; // 👈 sale del JWT
    const { evento_id, puntos } = req.body;

    // Validaciones mínimas
    if (!evento_id) {
      return res.status(400).json({ message: 'evento_id es obligatorio' });
    }

    const puntosNum = Number(puntos ?? 0);
    if (!Number.isInteger(puntosNum) || puntosNum < 0) {
      return res.status(400).json({ message: 'puntos debe ser un entero >= 0' });
    }

    // Evitar duplicado (la tabla tiene UNIQUE(usuario_id, evento_id) pero mejor dar mensaje decente)
    const ya = await pool.query(
      'SELECT id FROM asistencia_evento WHERE usuario_id = $1 AND evento_id = $2',
      [usuario_id, evento_id]
    );
    if (ya.rows.length) {
      return res.status(409).json({ message: 'La asistencia ya fue registrada para este evento.' });
    }

    const result = await pool.query(
      `INSERT INTO asistencia_evento (usuario_id, evento_id, puntos_otorgados)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [usuario_id, evento_id, puntosNum]
    );

    await puntosService.otorgarPuntos(usuario_id, puntosNum);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
