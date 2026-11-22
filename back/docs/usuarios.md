# Módulo de usuarios

## URL base

Todos los endpoints de este módulo utilizan la siguiente base:

```text
/api/auth
```

La autenticación utiliza sesiones de Express mediante la cookie `connect.sid`.
Las peticiones protegidas deben enviar esta cookie.

## Formato general de respuestas

Las respuestas exitosas incluyen `success: true` y un mensaje descriptivo.
Las respuestas de error incluyen `success: false` y un mensaje.

## Endpoints

### Iniciar sesión

```http
POST /api/auth/login
```

#### Body

```json
{
  "correo": "usuario@ejemplo.com",
  "password": "1234"
}
```

También se aceptan los alias `email` para el correo y `contrasena` o `clave`
para la contraseña.

#### Respuesta `200 OK`

```json
{
  "success": true,
  "message": "Se ha iniciado sesión correctamente",
  "user": {
    "id": "uuid",
    "correo": "usuario@ejemplo.com",
    "nombre_usuario": "usuario",
    "xp_total": 0,
    "nivel_actual": 1
  }
}
```

#### Posibles errores

| Código | Mensaje |
| --- | --- |
| `400` | `Correo y contraseña son requeridos` |
| `400` | `Contraseña requerida` |
| `400` | `Correo electrónico inválido` |
| `401` | `Usuario no encontrado` |
| `400` | `Esta cuenta está vinculada con google/github. Inicia sesión usando ese botón.` |
| `401` | `Contraseña incorrecta` |
| `500` | `Error interno en el servidor durante el inicio de sesión` |

### Registrar usuario

```http
POST /api/auth/register
```

#### Body

```json
{
  "nombre_usuario": "usuario",
  "correo": "usuario@ejemplo.com",
  "password": "1234"
}
```

También se acepta `contrasena` o `clave` en lugar de `password`.

La contraseña debe tener entre 4 y 64 caracteres.

#### Respuesta `201 Created`

```json
{
  "success": true,
  "message": "Usuario creado correctamente",
  "usuario": {
    "id": "uuid",
    "nombre_usuario": "usuario",
    "correo": "usuario@ejemplo.com",
    "xp_total": 0,
    "nivel_actual": 1
  }
}
```

#### Posibles errores

| Código | Mensaje |
| --- | --- |
| `400` | `Los campos nombre_usuario, correo y contraseña son obligatorios` |
| `400` | `Correo electrónico inválido` |
| `400` | `La contraseña no cumple con los requisitos mínimos de seguridad` |
| `409` | `El correo electrónico ya está registrado` |
| `409` | `El nombre de usuario ya está en uso` |
| `409` | `El nombre de usuario o correo ya está registrado` |
| `500` | `Ocurrió un error al registrar el usuario` |

### Cerrar sesión

```http
POST /api/auth/logout
```

**Requiere autenticación.**

#### Respuesta `200 OK`

```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

#### Posibles errores

| Código | Mensaje |
| --- | --- |
| `401` | `No autorizado` |
| `500` | `Error al cerrar sesión` |

### Actualizar usuario

```http
PUT /api/auth/update-user
```

**Requiere autenticación.**

#### Body

Debe incluir al menos uno de los siguientes campos:

```json
{
  "nombre_usuario": "nuevo_usuario",
  "correo": "nuevo@ejemplo.com",
  "newPassword": "nueva-clave"
}
```

#### Respuesta `200 OK`

```json
{
  "success": true,
  "message": "Información de usuario actualizada correctamente",
  "usuario": {
    "id": "uuid",
    "nombre_usuario": "nuevo_usuario",
    "correo": "nuevo@ejemplo.com",
    "proveedor_auth": "local",
    "xp_total": 0,
    "nivel_actual": 1,
    "jefe_final_derrotado": false,
    "creado_en": "2026-01-01T00:00:00.000Z"
  }
}
```

#### Posibles errores

| Código | Mensaje |
| --- | --- |
| `401` | `No autorizado` |
| `400` | `ID de usuario inválido` |
| `400` | `Debe proporcionar al menos un campo para actualizar` |
| `404` | `Usuario no encontrado` |
| `400` | `Contraseña no válida` |
| `409` | `El nombre de usuario o correo ya pertenece a otra cuenta` |
| `500` | `No se pudo actualizar la cuenta del usuario` |

### Eliminar usuario

```http
DELETE /api/auth/delete-user
```

**Requiere autenticación.**

#### Respuesta `200 OK`

```json
{
  "success": true,
  "message": "La cuenta de usuario ha sido eliminada exitosamente"
}
```

#### Posibles errores

| Código | Mensaje |
| --- | --- |
| `401` | `No autorizado` |
| `400` | `ID de usuario inválido o ausente` |
| `500` | `No se pudo eliminar la cuenta de usuario` |

### Comprobar sesión

```http
GET /api/auth/check-session
```

No requiere autenticación previa.

#### Respuesta `200 OK`

```json
{
  "success": true,
  "message": "Usuario autenticado",
  "user": {
    "id": "uuid",
    "correo": "usuario@ejemplo.com",
    "nombre_usuario": "usuario",
    "xp_total": 0,
    "nivel_actual": 1
  }
}
```

#### Respuesta `401 Unauthorized`

```json
{
  "success": false,
  "message": "Usuario no autenticado"
}
```

## Rutas no disponibles

Las rutas `POST /google-auth`, `POST /forgot-password` y
`POST /reset-password` aparecen declaradas en el router, pero sus
implementaciones están actualmente comentadas en el controlador. No forman
parte de los endpoints funcionales documentados.

El controlador también contiene una función para obtener todos los usuarios,
pero actualmente no existe una ruta pública que la utilice.