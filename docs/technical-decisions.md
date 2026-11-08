# Decisiones técnicas iniciales

## Plataforma y versiones

- Expo SDK 57 con Expo Router.
- React 19.2.3 y React Native 0.86.3, según las versiones fijadas en el proyecto.
- npm es el gestor de paquetes y `package-lock.json` debe mantenerse junto con `package.json`.
- No se actualizarán paquetes del SDK fuera de las versiones compatibles que resuelve Expo.

## Estilos

Se usa la edición gratuita de Uniwind con Tailwind CSS 4. Los tokens de TickDesk están
definidos en `global.css`; Metro procesa esa hoja mediante `withUniwindConfig`. El modo
claro se fija en la configuración de Expo y los componentes usan los colores de marca
definidos allí, sin estilos para modo oscuro.

## Animación

`lottie-react-native` muestra una animación JSON local del área de soporte. El archivo
está empaquetado con la aplicación: no se descarga contenido remoto ni se requiere
conexión a un servicio.

## Arquitectura

Expo Router vive en `src/app`. Cada ruta es un adaptador pequeño que renderiza una
pantalla de `src/pages`. La pantalla compone la funcionalidad de acceso de `src/features`,
el bloque ilustrado de `src/widgets` y controles reutilizables de `src/shared`.

Las entidades se reservaron en `src/entities`, pero se mantienen sin modelos de dominio
hasta que exista una necesidad real. Las capas inferiores no importan desde las superiores:
`shared` es independiente; `entities` puede usar `shared`; `features` puede usar
`entities` y `shared`; `widgets` puede usar las capas inferiores; y `pages` compone las
capas inferiores. Las rutas solo dependen de páginas.

## Límites de esta etapa

La pantalla de acceso es una propuesta visual. No autentica, no navega a una pantalla
de recuperación y no se conecta a Google, Supabase ni otro servicio. No se agregan
sesiones, validación de credenciales ni datos de tickets antes de su etapa correspondiente.
