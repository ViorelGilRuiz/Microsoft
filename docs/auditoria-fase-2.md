# Auditoría y planificación de la fase 2

Revisión: 22 de noviembre de 2026. La [guía oficial AZ-900](https://learn.microsoft.com/es-es/credentials/certifications/resources/study-guides/az-900), actualizada el 14 de noviembre de 2026, identifica como vigente la versión de habilidades del 20 de julio de 2026. La [página de la certificación](https://learn.microsoft.com/es-es/credentials/certifications/azure-fundamentals/) también indica esa fecha. La versión localizada del examen puede actualizarse después de la inglesa; consulta la guía antes de presentarte.

## Estado comprobado

La rama de aprendizaje contiene Next.js, una pantalla de demostración, acceso a Supabase configurable y migraciones SQL. No contiene un curso persistido, intentos funcionales ni datos reales de progreso. La pregunta de ejemplo se corrige mediante una acción de servidor al pulsar «Corregir respuesta»; no constituye un motor de examen ni registra intentos. La migración no se ha ejecutado en una instancia real y no existe prueba empírica de RLS. Las opciones de la pregunta y la clave privada ahora tienen restricciones para impedir que una opción de otra pregunta sea aceptada; los intentos siguen sin escritura desde el cliente.

## Mapa de cobertura previsto

Esta tabla asigna los grupos oficiales a las lecciones solicitadas; es un mapa de planificación, no evidencia de contenido ya redactado ni revisado. Todos los grupos siguen pendientes de implementación y revisión editorial.

| Grupo oficial | Peso del dominio | Lecciones previstas |
| --- | --- | --- |
| Computación cloud, responsabilidad, modelos y consumo | 25–30 % | A1–A4 |
| Ventajas de la nube | 25–30 % | A5–A7 |
| IaaS, PaaS y SaaS | 25–30 % | A8 |
| Componentes arquitectónicos de Azure | 35–40 % | B1–B3 |
| Proceso, alojamiento y redes | 35–40 % | B4–B8 |
| Almacenamiento y migración | 35–40 % | B9–B12 |
| Identidad, acceso y seguridad | 35–40 % | B13–B16 |
| Costes y etiquetas | 30–35 % | C1–C3 |
| Gobernanza y cumplimiento | 30–35 % | C4–C5 |
| Administración y despliegue | 30–35 % | C6–C8 |
| Supervisión | 30–35 % | C9–C10 |

La trazabilidad detallada de cada viñeta oficial deberá comprobarse contra el contenido definitivo, incluyendo jerarquía de recursos, puntos de conexión públicos y privados y Application Insights. La existencia de un título en el mapa no acredita cobertura didáctica.

## Bloques pendientes

1. Aplicar las migraciones en Supabase de prueba y verificar aislamiento con dos usuarios, roles anónimo y autenticado y acceso denegado al esquema privado. Incorporar una API transaccional y pruebas antes de habilitar escrituras de intentos.
2. Crear las 34 lecciones originales con objetivos, ejemplos, tarjetas y preguntas; revisar cada una frente al mapa.
3. Añadir un mínimo de 60 preguntas originales revisadas y servir claves solo durante la corrección segura.
4. Implementar simulacros con persistencia, envío idempotente y resultados.
5. Crear repaso espaciado, recomendaciones y planificación adaptable.
6. Integrar gamificación, pruebas de interfaz, accesibilidad e instalación móvil.

No hay una instancia ni credenciales Supabase disponibles en este repositorio. La migración define la base de datos, pero todavía no permite afirmar que la aplicación persiste los intentos o sincroniza el progreso.
