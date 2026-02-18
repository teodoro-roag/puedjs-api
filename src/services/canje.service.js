const pool = require('../config/db');

exports.canjear = async (usuarioId, swagId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const swag = await client.query(
      'SELECT * FROM swag WHERE id = $1 AND activo = TRUE',
      [swagId]
    );

    if (swag.rows.length === 0) throw new Error('Swag no disponible');

    if (swag.rows[0].cantidad <= 0)
      throw new Error('Sin stock');

    const puntos = await client.query(
      'SELECT * FROM puntos_usuario WHERE usuario_id = $1',
      [usuarioId]
    );

    if (!puntos.rows.length || puntos.rows[0].puntos_disponibles < swag.rows[0].puntos_requeridos)
      throw new Error('Puntos insuficientes');

    await client.query(
      `UPDATE puntos_usuario
       SET puntos_disponibles = puntos_disponibles - $1,
           puntos_canjeados = puntos_canjeados + $1
       WHERE usuario_id = $2`,
      [swag.rows[0].puntos_requeridos, usuarioId]
    );

    await client.query(
      `UPDATE swag
       SET cantidad = cantidad - 1
       WHERE id = $1`,
      [swagId]
    );

    await client.query(
      `INSERT INTO canje_swag (usuario_id, swag_id, puntos_usados)
       VALUES ($1,$2,$3)`,
      [usuarioId, swagId, swag.rows[0].puntos_requeridos]
    );

    await client.query('COMMIT');

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
