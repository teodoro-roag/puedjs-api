const pool = require('../config/db');

exports.otorgarPuntos = async (usuarioId, puntos) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT * FROM puntos_usuario WHERE usuario_id = $1',
      [usuarioId]
    );

    if (existing.rows.length === 0) {
      await client.query(
        `INSERT INTO puntos_usuario 
         (usuario_id, puntos_totales, puntos_disponibles)
         VALUES ($1,$2,$2)`,
        [usuarioId, puntos]
      );
    } else {
      await client.query(
        `UPDATE puntos_usuario
         SET puntos_totales = puntos_totales + $1,
             puntos_disponibles = puntos_disponibles + $1,
             ultima_actualizacion = NOW()
         WHERE usuario_id = $2`,
        [puntos, usuarioId]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
