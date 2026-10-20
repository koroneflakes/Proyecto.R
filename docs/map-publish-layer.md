# Capa de publicación del mapa

La capa de publicación mantiene una interfaz independiente del backend y, por ahora, usa `MockPublicLocationsService`. No realiza llamadas a internet. Las locaciones propias siguen almacenadas en SQLite; los lugares públicos simulados, reportes y eventos de publicación se guardan en tablas `mock_*` de la misma base local. Las tablas mock son temporales y no constituyen el esquema del futuro backend.

El usuario actual se obtiene con `useUser()` de Clerk y se pasa como `ownerId` a la capa de publicación y exploración. Un lugar solo se muestra públicamente a una sesión con usuario.

## Contrato y operaciones

`PublicLocationsService` devuelve `PublicServiceResult<T>` (`ok/data` o `ok/error`) en todas las operaciones:

- `publish(location)` publica o actualiza la locación usando el mismo UUID del almacenamiento local. Su propia foto local sirve como URL de foto en el mock. Un upsert existente no cuenta como nueva publicación.
- `unpublish(id, ownerId)` retira el registro público; el orquestador cambia el local a `local`.
- `fetchPublic(bounds, filter, viewerId)` filtra por área, categorías y subtipos, marca `isOwn`, excluye de otros usuarios los lugares con suficientes reportes y limita la respuesta a `MAX_PUBLIC_RESULTS`.
- `report(id, reason, reporterId)` registra un reporte único por usuario y lugar. Los reportes no se acumulan si el mismo usuario reporta otra vez.

`publishLocation`, `unpublishLocation` y `syncPending` en `publish-orchestrator.ts` coordinan NetInfo, el servicio y el repositorio local. `activatePendingSync(ownerId)` inicia un intento al activarse y vuelve a intentar al recuperar la conexión; devuelve una función para detener la suscripción. `useLocalLocations` lo activa mientras haya una sesión cargada y limpia la suscripción al desmontarse o cambiar de usuario.

`usePublicLocations(bounds, filter)` espera 350 ms antes de consultar y descarta las respuestas obsoletas al cambiar el área, los filtros o desmontarse.

## Errores estables

Todos los mensajes salen de `MAP_TEXTS.publishErrors`:

| Código | Uso |
| --- | --- |
| `NO_CONNECTION` | Modo sin conexión o red no disponible; la locación queda pendiente si intentaba publicarse. |
| `DAILY_LIMIT_REACHED` | Se alcanzó `DAILY_PUBLISH_LIMIT` en las últimas 24 horas. |
| `PHOTO_MISSING` | La locación no tiene foto local para publicar. |
| `NOT_AUTHORIZED` | No hay usuario o se intenta modificar/reportar contenido ajeno. |
| `NOT_FOUND` | No se encontró el lugar público solicitado. |
| `UNKNOWN` | Error inesperado o filtros geográficos inválidos. |

## Configuración mock

`EXPO_PUBLIC_MAP_BACKEND=mock` es el valor por defecto. Copia `.env.example` como base de configuración; Expo incorpora las variables `EXPO_PUBLIC_*` al bundle y hay que reiniciar el servidor de desarrollo tras cambiarlas. Si se configura `supabase`, el selector lanza `El backend real aún no está implementado`.

En `mock-public-constants.ts`, `MOCK_CENTER` fija la zona de los 20 lugares de ejemplo. El centro inicial es Ensenada, Baja California, México (31.87149, -116.60071); cámbialo a otra zona si quieres probar el mapa en una ubicación distinta.

`MOCK_PUBLIC_SERVICE_FLAGS` permite controlar la latencia (300–800 ms), el modo `offline`, `forceDailyLimit` y `failureProbability` (0–1, por defecto 0). Se puede usar `setMockPublicServiceFlags({ offline: true })` durante desarrollo y restablecerlo con `false`. La bandera de latencia está activada por defecto.

## Autotest

En modo de desarrollo, la pestaña «Más» ofrece el botón «Probar publicación simulada». `runPublishLayerSelfTest()` cubre publicación y consulta, filtros, upsert, reportes y ocultamiento, despublicación, límite diario, cola pendiente sin conexión y reintento. Usa datos temporales y los limpia al finalizar.

## Cuando llegue el backend

Implementa otra clase que cumpla exactamente `PublicLocationsService`, configura el selector para devolverla cuando corresponda y cambia `EXPO_PUBLIC_MAP_BACKEND`. El contrato y las pantallas/hooks no necesitan conocer el proveedor. La implementación real deberá mantener los mismos resultados tipados, permisos, límites, ocultamiento y semántica de upsert.
