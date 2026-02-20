📦 API APP – Backend Documentation
Base Configuration

Base URL (local):

http://localhost:3000/api/v1

Authentication:
JWT Bearer Token

Authorization: Bearer <token>
🔐 AUTH
Register

POST /auth/register

Body
{
  "nombres": "Joel",
  "apellidos": "Ramos",
  "correo": "joel@test.com",
  "numero_cuenta_unam": null,
  "genero": "Masculino",
  "como_conocio": "Redes Sociales",
  "password": "12345678"
}
Success (201)
{
  "user": { ... },
  "token": "JWT..."
}
Errors

400 Missing fields

409 Email already exists

Login

POST /auth/login

Body
{
  "correo": "joel@test.com",
  "password": "12345678"
}
Success (200)
{
  "user": { ... },
  "token": "JWT..."
}
Errors

401 Invalid credentials

Forgot Password

POST /auth/forgot-password

Body
{
  "correo": "joel@test.com"
}
Success (200)
{
  "message": "Si el correo existe, se enviaron instrucciones."
}

In development mode, a dev_reset_token may be returned for testing.

Reset Password

POST /auth/reset-password

Body
{
  "correo": "joel@test.com",
  "token": "TOKEN_RECIBIDO",
  "new_password": "nuevoPassword123"
}
Success (200)
{
  "message": "Contraseña actualizada correctamente."
}
Errors

400 Invalid or expired token

Change Password (Authenticated)

POST /auth/change-password

Headers

Authorization: Bearer <token>
Body
{
  "current_password": "actualPassword",
  "new_password": "nuevoPassword123"
}
Success (200)
{
  "message": "Contraseña cambiada correctamente."
}
👤 USERS
Get My Profile

GET /usuarios/me

Requires JWT.

Success (200)
{
  "id": 1,
  "nombres": "Joel",
  "apellidos": "Ramos",
  "correo": "joel@test.com",
  "numero_cuenta_unam": null,
  "genero": "Masculino",
  "como_conocio": "Redes Sociales",
  "fecha_registro": "2026-02-20T16:51:23.779Z"
}
Update My Profile

PUT /usuarios/me

Requires JWT.

Body (partial allowed)
{
  "nombres": "Joel",
  "apellidos": "Ramos",
  "numero_cuenta_unam": "1234567890",
  "genero": "Masculino",
  "como_conocio": "Universidad"
}
Get My Registered Events

GET /usuarios/me/eventos

Requires JWT.

Success (200)
[
  {
    "registro_id": 10,
    "fecha_registro": "2026-02-20T17:00:00.000Z",
    "como_se_entero": "Redes Sociales",
    "evento_id": 3,
    "nombre": "Evento Test",
    "fecha": "2026-02-25",
    "hora": "18:00:00",
    "lugar": "Auditorio",
    "descripcion": "Prueba",
    "imagen_cartel": null
  }
]
📅 EVENTS
List Events

GET /eventos

Returns array of events.

Get Event By ID

GET /eventos/:id

Success (200)

Event object

Error

404 Event not found

Create Event

POST /eventos

{
  "nombre": "Evento Test",
  "fecha": "2026-02-25",
  "hora": "18:00",
  "lugar": "Auditorio",
  "descripcion": "Prueba",
  "imagen_cartel": null
}
Register to Event (Authenticated)

POST /eventos/:id/registro

Requires JWT.

Body
{
  "como_se_entero": "Redes Sociales"
}
Success

201 Registration created

Errors

401 Unauthorized

404 Event not found

409 Already registered

🎯 ATTENDANCE
Register Attendance (Authenticated)

POST /asistencias

Requires JWT.

Body
{
  "evento_id": 1,
  "puntos": 10
}
Success

201 Attendance created

Errors

401 Unauthorized

409 Duplicate attendance

400 Invalid data

📌 ENUM VALUES
gender_type

Femenino

Masculino

Otro

discover_app_type

Redes Sociales

Universidad

Evento del PUEDJS

Me contó un amigo

discover_event_type

Redes Sociales

Whatsapp

Universidad

Otro

🛡 Security Notes

JWT must be stored securely on client side.

All authenticated routes require Authorization: Bearer <token>.

Password reset tokens are hashed in database.

Tokens expire automatically.

Sensitive fields (password_hash, reset_token_hash) are never returned.

🚀 Environment Variables
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=tu_base
DB_PASSWORD=1234
DB_PORT=5432
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d
