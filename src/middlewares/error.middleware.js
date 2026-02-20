module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || 'Error interno del servidor'
  });
};

function errorHandler(err, req, res, next) {
  // FK violation
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referencia inválida: verifica que el evento exista.' });
  }

  // Unique violation
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Registro duplicado.' });
  }

  console.error(err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = errorHandler;
