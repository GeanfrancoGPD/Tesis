# Documentación de la API

Documentación técnica de los endpoints REST disponibles en el backend.

## Información general

### URL base

```text
http://localhost:5000/api
```

En producción, reemplace el origen por la URL configurada para el servidor.

### Formato de datos

- Las solicitudes con cuerpo utilizan JSON y deben declarar
  `Content-Type: application/json`.
- Las respuestas exitosas pueden contener `success: true`, `message`, `data`
  o `usuario`, según el endpoint.
- Las respuestas de error contienen `success: false` y `message`.
- Algunos errores de validación incluyen además `errors`.

### Autenticación

La autenticación se mantiene mediante una sesión de Express almacenada en
PostgreSQL. Después de iniciar sesión, el cliente debe conservar y enviar la
cookie `connect.sid`.

Las rutas protegidas devuelven `401 Unauthorized` con el mensaje
`No autorizado` cuando no existe una sesión válida.

```http
Cookie: connect.sid=<sid>
```

## Módulos disponibles

| Módulo | Ruta base | Descripción |
| --- | --- | --- |
| [Usuarios y autenticación](./usuarios.md) | `/api/auth` | Registro, inicio de sesión, perfil y sesión activa |
| [Gamificación](./gamificacion.md) | `/api/gamificacion` | Mundos, sesiones, progreso, jefe final y comentarios |

## Convenciones de respuestas HTTP

| Código | Significado |
| --- | --- |
| `200` | Solicitud procesada correctamente |
| `201` | Recurso creado correctamente |
| `400` | Parámetros o datos de entrada inválidos |
| `401` | Autenticación requerida o sesión inválida |
| `403` | Recurso bloqueado por el estado de progreso |
| `404` | Recurso no encontrado |
| `409` | Conflicto, por ejemplo, correo o nombre ya registrado |
| `500` | Error interno del servidor |
