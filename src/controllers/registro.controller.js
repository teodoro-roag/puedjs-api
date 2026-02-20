const pool = require('../config/db');

exports.registrar = async (req, res, next) => {
  try {
    const usuario_id = req.user.id;
    const evento_id = Number(req.params.id);

    // opcional pero recomendado (según tu BD)
    const { como_se_entero } = req.body;

    if (!Number.isInteger(evento_id) || evento_id <= 0) {
      return res.status(400).json({ message: 'ID de evento inválido' });
    }

    // Validar que el evento exista (para evitar FK 500)
    const ev = await pool.query('SELECT id FROM eventos WHERE id = $1', [evento_id]);
    if (!ev.rows.length) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Validación mínima para ENUM (si lo usas)
    if (!como_se_entero) {
      return res.status(400).json({ message: 'como_se_entero es obligatorio' });
    }

    // Evitar duplicado con mensaje decente (además del UNIQUE)
    const ya = await pool.query(
      'SELECT id FROM registro_evento WHERE usuario_id = $1 AND evento_id = $2',
      [usuario_id, evento_id]
    );
    if (ya.rows.length) {
      return res.status(409).json({ message: 'Ya estás registrado en este evento.' });
    }

    const result = await pool.query(
      `INSERT INTO registro_evento (usuario_id, evento_id, como_se_entero)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [usuario_id, evento_id, como_se_entero]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
