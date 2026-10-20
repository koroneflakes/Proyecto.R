# Resultados de la prueba técnica MapLibre

**Estado:** implementación de la prueba preparada; pruebas visuales y mediciones en Android pendientes. No se presentan como ejecutados resultados que requieren un development build.

## Entorno y evidencia ejecutada

- Windows; Expo SDK `57.0.0` (`expo ~57.0.29`), React Native `0.86.3`.
- `npx expo install @maplibre/maplibre-react-native` instaló MapLibre React Native `11.5.0`; `npx expo install expo-dev-client` instaló el development client compatible.
- El config plugin `@maplibre/maplibre-react-native` aparece en la configuración resuelta por `npx expo config --type public`.
- El proyecto no tenía `expo-dev-client` antes de esta prueba y no tiene carpetas nativas mantenidas en el repositorio.
- Se ejecutó `npx expo run:android`: Expo creó el directorio nativo generado y el prebuild terminó correctamente, lo que confirma que el config plugin se aplicó durante la generación de Android. El build se detuvo después: no se encontró Android SDK en `C:\Users\moril\AppData\Local\Android\Sdk` y `adb` no está en PATH. No se llegó a compilar/instalar la app, observar el mapa, apagar la red en un dispositivo ni medir paquetes offline.
- Validación local del código: `npx tsc --noEmit`, `npm run lint` y `npx expo config --type public`. Estas comprobaciones no prueban ejecución nativa.

## Resultados por pregunta

| # | Pregunta | Estado | Evidencia observada |
|---|---|---|---|
| 1 | ¿Se instala MapLibre y funciona el plugin/build? | **Plugin/prebuild pasa; build nativo pendiente** | Se instaló `11.5.0`, compatible por metadatos con Expo `>=54`. `npx expo config --type public` resolvió el plugin y `npx expo run:android` completó prebuild, pero la compilación/instalación se detuvo por SDK Android ausente y `adb` no reconocido. |
| 2 | ¿Se ve OpenFreeMap Liberty y su atribución? | **No probado en dispositivo** | La ruta spike usa la URL Liberty y configura expresamente `attribution` y el logotipo visibles. Sin build no hay observación visual. |
| 3 | ¿OfflineManager descarga y muestra una zona en modo avión? | **No probado en dispositivo** | La pantalla implementa crear/listar/borrar, progreso y tamaño de paquetes. No se creó ningún paquete en Android ni se probó modo avión. |
| 4 | ¿Funciona el estilo propio local y por URL offline? ¿Incluye glyphs y sprites? | **JSON local preparado; comportamiento no probado** | Se descargó el JSON Liberty y se modificaron fondo (`#D8C39A`), agua (`#5E9A8E`) y calles (`#A24A33`); se verificaron esos valores al volver a leer el archivo. La pantalla permite seleccionar el JSON local o pegar una URL raw pública temporal. No se proporcionó ni alojó un Gist y no se probó la variante URL ni el contenido de glyphs/sprites en un paquete. |
| 5 | ¿Cuánto pesa según el zoom? | **Sin mediciones** | El panel muestra tamaño de recursos completados y duración para los rangos max zoom 14, 15 y 16. Requiere ejecutar las descargas en Android. |
| 6 | ¿Pines por categoría y agrupación? | **Implementado en el spike; visual no probado** | La ruta incluye cuatro puntos GeoJSON, imágenes locales distintas de taller/mercado, clustering hasta zoom 14 y selección de imagen por propiedad `icon` desde zoom 15. Falta confirmar el render en el development build. |

## Tamaños y tiempo de descarga

Zona configurada: aproximadamente **3.0 × 3.1 km**, centrada en Ensenada, Baja California, México. Rango inferior fijo: zoom 10. Para evitar solicitudes repetidas, el spike evita crear un segundo paquete con el mismo rango y estilo mientras exista el anterior; registra primero la medición y luego borra ese paquete antes de repetir o probar el siguiente rango.

| Rango de zoom | Tamaño medido | Tiempo medido | Estado |
|---|---:|---:|---|
| 10–14 | Pendiente | Pendiente | No ejecutado: falta toolchain/dispositivo Android |
| 10–15 | Pendiente | Pendiente | No ejecutado: falta toolchain/dispositivo Android |
| 10–16 | Pendiente | Pendiente | No ejecutado: falta toolchain/dispositivo Android |

No se estima el tamaño extrapolando entre niveles: la cantidad de recursos depende de la cobertura de tiles y sus respuestas reales.

## Cómo ejecutar la prueba

1. Instala Android Studio y Android SDK en Windows, configura `ANDROID_HOME` (o `ANDROID_SDK_ROOT`) y acepta las licencias del SDK. Conecta un Android o inicia un emulador.
2. Desde la raíz del proyecto ejecuta `npx expo run:android`. Expo generará el proyecto nativo y construirá/instalará el development client; el código nativo generado no se edita a mano.
3. Abre la ruta directa `/map-spike` en el development build (no hay enlace en la barra de navegación). Comprueba Liberty y que su botón de atribución esté visible.
4. Descarga una sola vez cada rango 10–14, 10–15 y 10–16. Espera a `complete`; registra tamaño y duración mostrados en la pantalla, borra el paquete y continúa con el siguiente.
5. Selecciona «JSON local», descarga un paquete con el estilo base Liberty para la misma zona, espera a `complete`, deja abierta la pantalla y activa modo avión. Confirma si el mapa conserva el estilo amate, tiles, textos, glyphs y sprites.
6. Para probar URL, pega en «JSON URL» una URL pública raw del mismo estilo modificado. Descarga un paquete para ese estilo y repite la observación offline. La URL debe ser pública y temporal; el proyecto no aloja el JSON.
7. Completa este informe con los resultados observados, el modelo del dispositivo, la versión Android y capturas antes/después de desconectar.

El centro y bbox se definen en un único archivo, `src/data/map-spike/constants.ts`; reemplázalos por una zona pequeña propia antes de medir otra región.

## Problemas y resolución

| Problema | Acción / estado |
|---|---|
| MapLibre no funciona dentro de Expo Go. | Añadidos `expo-dev-client`, MapLibre y su config plugin; prebuild Android funcionó. La compilación espera a que se instale/configure Android Studio/SDK y `adb`. |
| No se puede verificar visualmente ni registrar métricas sin Android nativo. | Dejé mediciones explícitamente pendientes y preparé progreso, listado, borrado y medición en la ruta spike. No se sustituyeron por estimaciones. |
| La URL pública temporal del estilo modificado necesita hosting público. | La pantalla admite pegar el enlace raw; no se publicó un Gist desde este entorno. La comparación URL queda pendiente hasta contar con una URL pública. |

## Recomendación provisional

El JSON local y las imágenes de pines están empaquetados en la app y evitan alojar esos archivos. La pantalla construye paquetes locales usando el estilo remoto Liberty para descargar los recursos fuente y muestra el estilo amate local; la hipótesis de que glyphs/sprites y tiles quedan disponibles offline debe confirmarse en Android. No adoptes todavía mapas offline para producción ni el hosting del estilo hasta completar las pruebas en dispositivo y contrastar los tamaños.
