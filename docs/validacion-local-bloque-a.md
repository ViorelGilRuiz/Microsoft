# Validación local del bloque A

Fecha: 22 de noviembre de 2026. Instancia nueva de desarrollo Supabase CLI 3.2.0 y PostgreSQL 17 en Docker Desktop; no se utilizó una base de producción ni se reinició o eliminó una base existente. Antes del arranque no había contenedores Docker. La configuración generada está en `supabase/config.toml`.

## Migraciones aplicadas

El historial `supabase_migrations.schema_migrations` confirmó `202611220001` y `202611220002`. La CLI las aplicó al iniciar la nueva instancia. No se modificaron las migraciones existentes.

## Comprobaciones y resultados

- **SQL: superado.** `supabase/tests/security.sql` se ejecutó con `ON_ERROR_STOP` y terminó con `ROLLBACK`. Comprobó dos identidades con claims de usuario y el rol anónimo, el aislamiento de perfiles e intentos, las preguntas publicadas y en borrador, la denegación de inserción directa de intentos y los privilegios de `private.question_keys`.
- **API: superado.** `tests/local-api-security.mjs` creó dos usuarios temporales, inició sesiones reales y comprobó que cada usuario podía leer su perfil, pero no leer ni modificar el del otro. Verificó el bloqueo de creación directa de intentos, el acceso anónimo a perfiles y preguntas y la no exposición del esquema privado tanto anónimamente como con sesión. Eliminó únicamente los usuarios que creó durante la prueba.
- **Integridad: superado para los casos ejercitados.** Se rechazaron una opción de otra pregunta, una clave asociada a otra pregunta, orden duplicado en un intento, envío sin fecha, tema inválido, intervalo negativo y valoración de repaso inválida. El catálogo no contenía restricciones sin validar. Esta selección no constituye una prueba exhaustiva de cada combinación posible de datos.
- **Cliente: superado para la demostración.** `node tests/client-secrecy.mjs` no encontró dos explicaciones reservadas en el HTML inicial ni en los 17 scripts que descargó. La acción de corrección de demostración sigue devolviendo las explicaciones cuando se solicita la corrección. No hay todavía un banco persistente cuyos payloads puedan comprobarse.
- **Aplicación: superado.** `npm.cmd run typecheck`, `npm.cmd test` (dos pruebas) y `npm.cmd run build`. Node emitió un aviso de interpretación de módulos, sin fallos.

Las pruebas SQL usan transacciones con rollback. Las pruebas API generan identificadores únicos y limpian solo sus propios usuarios. La prueba API requiere una clave administrativa **local** solo en memoria para crear y limpiar fixtures; no se incluye en el código del cliente ni se guarda en archivos. Los permisos de producción, el acceso a otras tablas y las rutas de un motor futuro requieren sus propias pruebas; este resultado no certifica la seguridad de un despliegue remoto.

## Estado y pendientes

Siguen habilitados la interfaz y la corrección de demostración en servidor. La aplicación no está configurada automáticamente con las credenciales de esta instancia local. No se ha habilitado la escritura de intentos ni de resultados. Falta implementar y verificar autorización transaccional, concurrencia, idempotencia, versionado inmutable de preguntas, persistencia de resultados y repasos, y la protección de respuestas en el motor nuevo. Véase [diseño del bloque B](./bloque-b-diseno.md).
