# Módulo de gamificación

Este módulo administra mundos, sesiones educativas, progreso, XP, niveles,
la batalla contra el jefe final y los comentarios de sesión.

## URL base

```text
/api/gamificacion
```

Todos los endpoints requieren una sesión autenticada mediante la cookie
`connect.sid`.

## Estructuras comunes

### Mundo

```json
{
  "id": "uuid",
  "orden": 1,
  "titulo": "Fundamentos",
  "subtitulo": "Introducción",
  "descripcion": "Descripción del mundo",
  "nombre_gema": "Gema de Fundamentos",
  "icono_slug": "fundamentos",
  "total_sesiones": 4,
  "sesiones_completadas": 2,
  "gema_desbloqueada": false
}
```

### Resumen de sesión

```json
{
  "id": "uuid",
  "mundo_id": "uuid",
  "orden": 1,
  "titulo": "Variables y memoria",
  "tipo_sesion": "normal",
  "xp_recompensa": 100,
  "estado": "activo",
  "puntaje_obtenido": 85,
  "xp_ganada": 100,
  "intentos": 2
}
```

Los valores posibles de `tipo_sesion` son `normal` y `guardian`. Los estados
posibles son `bloqueado`, `activo` y `completado`.

## Endpoints

### Obtener mundos y progreso

```http
GET /api/gamificacion/mundos
```

Retorna todos los mundos junto con la cantidad de sesiones completadas y si
se ha obtenido la gema correspondiente a cada uno.

#### Respuesta `200 OK`

```json
{
  "success": true,
  "data": {
    "mundos": [],
    "gemas_desbloqueadas": 0,
    "total_gemas": 4,
    "jefe_final_desbloqueado": false
  }
}
```

#### Errores

| Código | Mensaje |
| --- | --- |
| `401` | `No autorizado` |
| `500` | `Error al obtener los mundos de la plataforma` |

### Obtener sesiones de un mundo

```http
GET /api/gamificacion/mundos/:mundoId/sesiones
```

#### Parámetro de ruta

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `mundoId` | UUID | Sí | Identificador del mundo |

#### Respuesta `200 OK`

```json
{
  "success": true,
  "data": []
}
```

#### Errores

| Código | Mensaje |
| --- | --- |
| `400` | `ID de mundo inválido` |
| `401` | `No autorizado` |
| `500` | `Error al obtener las sesiones del mundo` |

### Obtener detalle de una sesión

```http
GET /api/gamificacion/sesiones/:sesionId
```

#### Parámetro de ruta

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `sesionId` | UUID | Sí | Identificador de la sesión |

#### Respuesta `200 OK`

La respuesta combina el resumen de la sesión con su contenido teórico y
cuestionario:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "mundo_id": "uuid",
    "orden": 1,
    "titulo": "Variables y memoria",
    "tipo_sesion": "normal",
    "xp_recompensa": 100,
    "estado": "activo",
    "puntaje_obtenido": 85,
    "contenido_teorico": {
      "tarjetas": [],
      "guardian": null
    },
    "cuestionario_json": {
      "preguntas": []
    },
    "intentos": 2
  }
}
```

#### Errores

| Código | Mensaje |
| --- | --- |
| `400` | `ID de sesión inválido` |
| `401` | `No autorizado` |
| `403` | `Debes completar el nivel anterior para desbloquear esta sesión` |
| `404` | `Sesión no encontrada` |
| `500` | `Error al cargar el contenido de la sesión` |

### Completar una sesión

```http
POST /api/gamificacion/sesiones/:sesionId/completar
```

#### Parámetro de ruta

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `sesionId` | UUID | Sí | Identificador de la sesión |

#### Body

```json
{
  "aprobado": true,
  "puntaje_obtenido": 85
}
```

| Campo | Tipo | Requerido | Restricciones |
| --- | --- | --- | --- |
| `aprobado` | boolean | Sí | Indica si el usuario aprobó el cuestionario |
| `puntaje_obtenido` | number | No | Valor entre `0` y `100`; el valor predeterminado al completar es `100` |

#### Respuesta cuando aprueba — `200 OK`

```json
{
  "success": true,
  "aprobado": true,
  "gema_obtenida": false,
  "xp_ganada_ahora": 100,
  "xp_total": 100,
  "nivel_actual": 1,
  "siguiente_sesion_id": "uuid",
  "progreso": {}
}
```

La XP solo se otorga la primera vez que se completa una sesión. El nivel se
calcula con 500 XP por nivel: nivel 1 comienza en 0 XP.

#### Respuesta cuando no aprueba — `200 OK`

```json
{
  "success": true,
  "aprobado": false,
  "message": "Intento registrado. Revisa el feedback de Artur e inténtalo de nuevo.",
  "intentos": 3
}
```

#### Errores

| Código | Mensaje |
| --- | --- |
| `400` | `ID de sesión inválido` |
| `400` | `Datos de evaluación inválidos` |
| `401` | `No autorizado` |
| `403` | `No puedes completar una sesión bloqueada` |
| `404` | `Sesión no encontrada` |
| `404` | `Usuario no encontrado` |
| `500` | `Error al registrar el progreso de la sesión` |

### Obtener jefe final

```http
GET /api/gamificacion/jefe-final
```

Retorna los retos solo después de que todos los mundos tengan su gema
desbloqueada.

#### Respuesta `200 OK`

```json
{
  "success": true,
  "data": []
}
```

Cada reto contiene, entre otros campos, `id`, `mundo_id`, `mundo_titulo`,
`ronda`, `enunciado_mision`, `plantilla_codigo`, `bloques_opciones` y
`pista_artur`.

#### Errores

| Código | Mensaje |
| --- | --- |
| `401` | `No autorizado` |
| `403` | `Portal sellado: debes derrotar a los 4 Guardianes de Mundo para enfrentar al Bug Supremo.` |
| `500` | `Error al cargar la arena del Jefe Final` |

### Completar jefe final

```http
POST /api/gamificacion/jefe-final/completar
```

No requiere body.

Otorga 500 XP una sola vez y marca al usuario como vencedor del jefe final.

#### Respuesta `200 OK`

```json
{
  "success": true,
  "message": "¡Has derrotado al Bug Supremo y dominado los fundamentos!",
  "xp_total": 1500,
  "nivel_actual": 4,
  "jefe_final_derrotado": true
}
```

#### Errores

| Código | Mensaje |
| --- | --- |
| `401` | `No autorizado` |
| `404` | `Usuario no encontrado` |
| `500` | `Error al registrar la derrota del Jefe Final` |

### Obtener comentarios de una sesión

```http
GET /api/gamificacion/sesiones/:sesionId/comentarios
```

#### Parámetro de ruta

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `sesionId` | UUID | Sí | Identificador de la sesión |

#### Respuesta `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sesion_id": "uuid",
      "usuario_id": "uuid",
      "nombre_usuario": "usuario",
      "nivel_actual": 2,
      "contenido": "Excelente explicación",
      "creado_en": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

Los comentarios se ordenan por fecha de creación descendente.

#### Errores

| Código | Mensaje |
| --- | --- |
| `400` | `ID de sesión inválido` |
| `401` | `No autorizado` |
| `500` | `Error al obtener los comentarios` |

### Crear comentario

```http
POST /api/gamificacion/sesiones/:sesionId/comentarios
```

#### Parámetro de ruta

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `sesionId` | UUID | Sí | Identificador de la sesión |

#### Body

```json
{
  "contenido": "Esta sesión me ayudó a comprender el tema."
}
```

| Campo | Tipo | Requerido | Restricciones |
| --- | --- | --- | --- |
| `contenido` | string | Sí | Entre 2 y 500 caracteres |

#### Respuesta `201 Created`

```json
{
  "success": true,
  "message": "Comentario publicado",
  "data": {
    "id": "uuid",
    "sesion_id": "uuid",
    "usuario_id": "uuid",
    "contenido": "Esta sesión me ayudó a comprender el tema.",
    "creado_en": "2026-01-01T00:00:00.000Z"
  }
}
```

#### Errores

| Código | Mensaje |
| --- | --- |
| `400` | `ID de sesión inválido` |
| `400` | `El comentario no es válido` |
| `401` | `No autorizado` |
| `500` | `Error al publicar el comentario` |