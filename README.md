# TickDesk

TickDesk es una aplicación móvil de gestión de tickets para soporte técnico. Esta primera
etapa prepara el proyecto y presenta una pantalla visual de acceso; todavía no hay
autenticación ni conexión con servicios externos.

## Tecnologías

- Expo SDK 57, React 19.2.3 y React Native 0.86.3.
- TypeScript en modo estricto.
- Expo Router para navegación basada en archivos.
- Uniwind gratuito 1.13.2 y Tailwind CSS 4.3.4 para estilos.
- `lottie-react-native` 7.3.8 para la ilustración animada local y
  `@lottiefiles/dotlottie-react` como renderer web opcional.
- npm para instalar y fijar dependencias.

Las versiones instaladas pueden revisarse en `package.json` y `package-lock.json`. En el
entorno donde se preparó esta etapa se comprobó Node.js 24.14.1 y npm 11.11.0.

## Arquitectura

Las rutas de Expo Router están separadas de las capas de funcionalidades. La ruta inicial
en `src/app/index.tsx` solo delega a la página de acceso.

```text
src/
  app/                 Configuración de navegación y rutas Expo Router
  pages/login/         Composición de la pantalla de acceso
  widgets/              Bloques grandes de interfaz (ilustración de soporte)
  features/auth/        Interfaz del formulario de acceso
  entities/             Reservado para modelos reales del dominio
  shared/               Recursos y componentes reutilizables
    assets/animations/
    ui/
global.css              Tema de Uniwind y colores TickDesk
metro.config.js         Integración de Uniwind con Metro
docs/technical-decisions.md
```

La pantalla es solo una propuesta: los botones y enlaces todavía no realizan acciones
de autenticación o navegación.

## Estilos y animación

`global.css` importa Tailwind CSS y Uniwind, y declara la paleta de marca como tokens.
`metro.config.js` indica a Metro dónde está esa hoja y dónde generar los tipos de
`className`. El diseño usa exclusivamente el tema claro.

La animación de soporte se guarda en `src/shared/assets/animations/support-desk.json` y
se importa de forma local con `LottieView`; no depende de una URL ni de una API.

## Comandos

Instala dependencias y arranca el servidor de desarrollo:

```bash
npm install
npx expo start
```

También se puede iniciar directamente para una plataforma:

```bash
npx expo start --android
npx expo start --ios
npx expo start --web
```

Verifica tipos y dependencias:

```bash
npx tsc --noEmit
npm run lint
npx expo install --check
npx expo-doctor
```

## Qué comprobar

1. Ejecuta `npx expo start` y abre la aplicación en un dispositivo o emulador.
2. Revisa que aparezcan la marca TickDesk, los campos de correo y contraseña, las
   acciones visuales y la ilustración animada.
3. Escribe en ambos campos para comprobar su estado local; no se envían credenciales.
4. Ejecuta los comandos de verificación anteriores. `npx expo export --platform web`
   también permite comprobar que Metro puede generar el bundle web.

Consulta [las decisiones técnicas](docs/technical-decisions.md) para más detalle sobre
versiones, arquitectura y límites de esta primera etapa.
