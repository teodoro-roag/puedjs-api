const express = require('express');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuarios.routes');
const eventosRoutes = require('./routes/eventos.routes');
const authRoutes = require('./routes/auth.routes');
const asistenciaRoutes = require('./routes/asistencia.routes');

/*
const swagRoutes = require('./routes/swag.routes');
const canjeRoutes = require('./routes/canje.routes');
*/
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/usuarios', usuariosRoutes);
app.use('/api/v1/eventos', eventosRoutes);
app.use('/api/v1/asistencias', asistenciaRoutes);


/*
app.use('/api/v1/swag', swagRoutes);
app.use('/api/v1/canje', canjeRoutes);
*/

app.use('/api/v1/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
