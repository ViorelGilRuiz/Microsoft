# Fase 2.2 — auditoría y validación de seguridad

Estado de la auditoría: 22 de noviembre de 2026. La aplicación de Next.js mantiene una pregunta de demostración corregida por una Server Action sin persistencia. La autenticación usa el cliente de Supabase y variables públicas; no hay `.env.local` configurado en este entorno. Las migraciones existentes están en `supabase/migrations/`. La escritura de intentos permanece deshabilitada para el cliente. No hay motor persistente ni sesiones de práctica reanudables. Las pruebas posteriores en una nueva instancia local y sus límites están registrados en [validación local](./validacion-local-bloque-a.md).

La [guía oficial española](https://learn.microsoft.com/es-es/credentials/certifications/resources/study-guides/az-900) y la [inglesa](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900), consultadas el 22 de noviembre de 2026, siguen mostrando las habilidades medidas a partir del 20 de julio de 2026. La guía española indica que la localización del examen puede actualizarse después de la inglesa. El mapa provisional de grupos se encuentra en [auditoría de fase 2](./auditoria-fase-2.md); falta un mapa por objetivo y su cobertura real.

## Comprobaciones preparadas

`supabase/tests/security.sql` crea datos temporales dentro de una transacción, verifica aislamiento de perfiles e intentos entre dos usuarios, visibilidad de borradores, acceso anónimo, privilegios del esquema privado, restricciones de opciones y rechazo de escritura directa de intentos. Termina con rollback y detiene la ejecución ante cualquier fallo. Hay que ejecutarlo con una conexión administrativa a una **base Supabase desechable**, nunca contra producción. El entorno debe tener las funciones y roles reales de Supabase; una base PostgreSQL vacía no sirve para validar sus políticas.

1. Crea una instancia Supabase de prueba aislada y aplica **en orden** ambas migraciones de `supabase/migrations/` usando las herramientas de Supabase.
2. Con `psql` instalado, usa una conexión administrativa a esa instancia y ejecuta `psql -X -v ON_ERROR_STOP=1 -f supabase/tests/security.sql`. Proporciona la conexión mediante un mecanismo seguro de tu entorno; no la incluyas en el repositorio, en la línea de comandos compartida ni en capturas.
3. Confirma que todas las comprobaciones pasan y que el mensaje final aparece. El script es una primera prueba de SQL/RLS, no sustituye las pruebas de API, concurrencia ni autenticación real.

Con la aplicación de desarrollo activa, `node tests/client-secrecy.mjs` verifica que dos explicaciones de la pregunta de demostración no aparecen en el HTML inicial ni en los scripts descargados por el navegador. Esta comprobación es específica de la demostración: no prueba todos los payloads ni garantiza la seguridad de un futuro banco de preguntas.

## Puerta de seguridad y trabajo pendiente

La instancia local ha superado las pruebas concretas registradas en el informe de validación. La escritura de resultados aún no se ha habilitado: faltan el motor transaccional y sus pruebas de autorización de intentos ajenos, concurrencia, idempotencia, claves y versiones inmutables. El banco revisado y el sistema de evaluación aún no están implementados.
