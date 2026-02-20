const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'current_password y new_password son obligatorios' });
    }

    if (String(new_password).length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const userRes = await pool.query(
      'SELECT password_hash FROM usuarios WHERE id = $1',
      [userId]
    );

    if (!userRes.rows.length || !userRes.rows[0].password_hash) {
      return res.status(404).json({ message: 'Usuario no encontrado o sin contraseña.' });
    }

    const bcrypt = require('bcrypt');
    const ok = await bcrypt.compare(current_password, userRes.rows[0].password_hash);

    if (!ok) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);

    await pool.query(
      `UPDATE usuarios
       SET password_hash = $1
       WHERE id = $2`,
      [newHash, userId]
    );

    return res.json({ message: 'Contraseña cambiada correctamente.' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, correo, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ message: 'token y new_password son obligatorios' });
    }

    if (String(new_password).length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const tokenHash = sha256(String(token));
    const correoNorm = correo ? String(correo).trim().toLowerCase() : null;

    const params = correoNorm ? [tokenHash, correoNorm] : [tokenHash];
    const query = correoNorm
      ? `SELECT id FROM usuarios WHERE reset_token_hash = $1 AND reset_expires > NOW() AND correo = $2`
      : `SELECT id FROM usuarios WHERE reset_token = $1 AND reset_expires > NOW()`;

    const userRes = await pool.query(query, params);

    if (!userRes.rows.length) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    const userId = userRes.rows[0].id;

    const bcrypt = require('bcrypt');
    const password_hash = await bcrypt.hash(new_password, 10);

    await pool.query(
      `UPDATE usuarios
       SET password_hash = $1,
           reset_token_hash = NULL,
           reset_expires = NULL
       WHERE id = $2`,
      [password_hash, userId]
    );

    return res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ message: 'correo es obligatorio' });

    const correoNorm = String(correo).trim().toLowerCase();

    const userRes = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1',
      [correoNorm]
    );

    // Respuesta siempre igual (anti-enumeración)
    if (!userRes.rows.length) {
      return res.json({ message: 'Si el correo existe, se enviaron instrucciones.' });
    }

    const userId = userRes.rows[0].id;

    const token = crypto.randomBytes(32).toString('hex'); // token real
    const tokenHash = sha256(token); // lo que guardas
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await pool.query(
        `UPDATE usuarios
        SET reset_token_hash = $1,
            reset_expires = $2
        WHERE id = $3`,
        [tokenHash, expires, userId]
    );

    // TODO PROD: enviar email con link:
    // https://tuapp.com/reset-password?token=<token>&correo=<correoNorm>

    // DEV: devolver token para pruebas locales
    const response = { message: 'Si el correo existe, se enviaron instrucciones.' };
    if (process.env.NODE_ENV !== 'production') response.dev_reset_token = token;

    return res.json(response);
  } catch (error) {
    next(error);
  }
};

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const {
      nombres,
      apellidos,
      correo,
      numero_cuenta_unam,
      genero,
      como_conocio,
      password
    } = req.body;

    if (!correo || !password || !nombres || !apellidos || !genero || !como_conocio) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    // Normaliza correo
    const correoNorm = String(correo).trim().toLowerCase();

    // Verifica duplicado
    const exists = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correoNorm]);
    if (exists.rows.length) {
      return res.status(409).json({ message: 'El correo ya está registrado.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios
       (nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio, fecha_registro`,
      [nombres, apellidos, correoNorm, numero_cuenta_unam || null, genero, como_conocio, password_hash]
    );

    const user = result.rows[0];
    const token = signToken({ sub: user.id });

    return res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ message: 'Correo y password son obligatorios.' });
    }

    const correoNorm = String(correo).trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, nombres, apellidos, correo, numero_cuenta_unam, genero, como_conocio, fecha_registro, password_hash
       FROM usuarios
       WHERE correo = $1`,
      [correoNorm]
    );

    if (!result.rows.length) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const userRow = result.rows[0];

    if (!userRow.password_hash) {
      return res.status(403).json({ message: 'Usuario sin contraseña. Requiere registro/migración.' });
    }

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = signToken({ sub: userRow.id });

    // Nunca regreses password_hash
    const { password_hash, ...user } = userRow;

    return res.json({ user, token });
  } catch (error) {
    next(error);
  }
};
