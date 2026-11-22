# CertifyHub

Base en desarrollo para aprender certificaciones Microsoft. No está afiliada a Microsoft. La interfaz contiene una lección y una pregunta originales de demostración, no preguntas oficiales. Las métricas aparecen sin datos y la selección de ruta solo dura la sesión; aún no hay progreso sincronizado.

## Estado

- Next.js App Router, TypeScript estricto, interfaz adaptable, tema claro/oscuro y catálogo AZ-900, SC-900 y AZ-104.
- Acceso con correo y contraseña mediante Supabase cuando está configurado. El registro puede requerir confirmación por correo según la configuración del proyecto.
- Migración inicial de contenido y datos privados con RLS. Las claves de respuestas viven en un esquema privado; los intentos todavía no se pueden escribir desde el cliente. **La migración no ha sido aplicada ni verificada contra una instancia de Supabase.** La pregunta local de demostración contiene su respuesta en el código cliente y no constituye el motor seguro de evaluación previsto.
- Manifest e icono SVG iniciales. Faltan iconos PNG para instalación compatible con iOS y pruebas de instalación; no existe soporte offline.

## Desarrollo

Requiere Node.js compatible con Next.js y npm. En PowerShell:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
# Añade la URL y la clave pública anon/publishable de tu proyecto Supabase.
npm.cmd run dev
```

Abre <http://localhost:3000>. Sin variables de entorno la demostración funciona, pero no la autenticación. Nunca incluyas la clave `service_role` en el cliente. Para usar la migración, revisa y aplica `supabase/migrations/202611220001_initial.sql` con las herramientas de Supabase antes de activar funcionalidades dependientes. No contiene datos iniciales.

Comprueba con `npm.cmd run typecheck` y `npm.cmd run build`. Para probar en un móvil de la misma red, ejecuta `npm.cmd run dev -- --hostname 0.0.0.0` y abre `http://IP_DEL_ORDENADOR:3000` en el móvil. La instalación PWA y algunos servicios requieren HTTPS; para producción configura las dos variables públicas en Vercel y despliega el repositorio.

## Trabajo pendiente

La fase 1 no está terminada: persistencia de perfil y progreso, historial, estadísticas reales, preferencias, pruebas de aislamiento, estados de carga y vacíos, iconos instalables y pruebas de extremo a extremo. Tailwind, shadcn/ui y Motion aún no están integrados; se ha usado CSS propio para esta base.

La fase 2 necesita verificar el temario vigente en Microsoft Learn y registrar la fecha y versión verificadas; diseñar y revisar las 34 lecciones, al menos 60 preguntas originales, el mapa de cobertura y el motor de evaluación seguro en servidor. También faltan simulacros, repasos, calendario, recomendaciones, gamificación y sus pruebas. El esquema es una base, no una implementación completa de esas funciones.
