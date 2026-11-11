# TickDesk 🎫

**Sistema móvil de gestión de tickets de soporte técnico**

TickDesk es una aplicación móvil desarrollada con React Native y Expo que permite gestionar solicitudes de soporte técnico mediante un sistema de tickets. Cuenta con autenticación de usuarios, gestión de roles y operaciones para administrar y atender solicitudes.

El proyecto fue desarrollado como parte de la formación académica en la Escuela Politécnica Nacional.

## ✨ Características principales

### Autenticación

- Inicio de sesión con correo electrónico y contraseña.
- Registro de nuevos usuarios.
- Inicio de sesión con Google.
- Recuperación de contraseña.
- Cambio de contraseña.

### Gestión de tickets

- Creación de solicitudes de soporte.
- Consulta de tickets.
- Edición y eliminación de tickets pendientes.
- Asignación de tickets al personal de soporte.
- Actualización de prioridad y estado.
- Registro y consulta de observaciones.

### Roles de usuario

| Rol           | Funcionalidades                                                               |
| ------------- | ----------------------------------------------------------------------------- |
| Solicitante   | Crear, consultar, editar y eliminar sus tickets pendientes.                   |
| Soporte       | Consultar tickets disponibles, asignarse solicitudes y gestionar su atención. |
| Administrador | Consultar perfiles y administrar los roles de los usuarios.                   |

## 🛠️ Tecnologías utilizadas

- **React Native:** desarrollo de la aplicación móvil.
- **Expo:** entorno y herramientas de desarrollo.
- **TypeScript:** tipado y organización del código.
- **Expo Router:** navegación entre pantallas.
- **Supabase:** autenticación y base de datos.
- **Uniwind:** estilos e interfaz de usuario.
- **Lottie:** animaciones de la aplicación.
- **Lucide React Native:** iconografía.

## 🏗️ Arquitectura

El proyecto utiliza **Feature-Sliced Design (FSD)** para organizar el código en módulos y capas, facilitando su mantenimiento, reutilización y escalabilidad.

La estructura principal del proyecto es:

```text
TickDesk/
├── assets/
│   └── images/
├── src/
│   ├── app/
│   ├── entities/
│   ├── features/
│   ├── pages/
│   ├── shared/
│   └── widgets/
├── apps/
│   └── web/
├── android/
├── .env
├── app.json
├── package.json
└── README.md
```

## ⚙️ Requisitos previos

Antes de ejecutar el proyecto, necesitas:

- Node.js.
- npm.
- Android Studio.
- Un emulador Android o dispositivo físico.
- Una cuenta y un proyecto configurado en Supabase.

## 🚀 Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/LeonorYumi2/Deber-6---TickDesk.git
```

2. Ingresar a la carpeta:

```bash
cd Deber-6---TickDesk
```

3. Instalar las dependencias:

```bash
npm install
```

4. Configurar las variables de entorno creando un archivo `.env` en la raíz:

```env
EXPO_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
EXPO_PUBLIC_WEB_URL=TU_URL_WEB
```

**Importante:** No compartir ni subir al repositorio claves privadas, contraseñas o credenciales administrativas de Supabase.

5. Ejecutar la aplicación en Android:

```bash
npx expo run:android
```

También puedes iniciar Metro con:

```bash
npx expo start
```

## 🔐 Configuración de Supabase

TickDesk utiliza Supabase para gestionar la autenticación y almacenar la información de los tickets y perfiles de usuario.

Para ejecutar todas las funcionalidades es necesario configurar correctamente:

- Supabase Auth.
- Base de datos y tablas.
- Políticas de seguridad RLS.
- Funciones RPC utilizadas por la aplicación.
- Configuración de autenticación con Google.

## 🌐 Aplicación web complementaria

TickDesk también cuenta con una aplicación web complementaria para gestionar los enlaces de autenticación y recuperación de contraseña.

---

*Proyecto académico desarrollado con fines educativos.*
