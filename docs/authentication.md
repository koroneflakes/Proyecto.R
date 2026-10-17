# Autenticación con Clerk

Configura `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` en `.env.local` y reinicia Expo
después de cambiar las variables de entorno. No incluyas claves secretas en la
aplicación ni en el repositorio.

En el Dashboard de Clerk, habilita el registro con correo y contraseña, los
códigos de verificación por correo y los proveedores OAuth de Google y
Facebook. El registro usa contraseña y código por correo; el inicio de sesión
usa un código enviado al correo. Los flujos por correo continúan a `/` después
de que Clerk verifique el código y active la sesión. Google y Facebook usan
OAuth y continúan tras activar la sesión.

El proveedor usa `expo-secure-store` para persistir la sesión en el dispositivo.
Si modificas plugins de configuración nativa, vuelve a generar el cliente nativo.
