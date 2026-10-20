# Contenido del mapa

Esta carpeta reúne el contenido, el almacenamiento local y las utilidades compartidas por las etapas del mapa. No contiene pantallas ni lógica de servidor.

El repositorio local usa SQLite con migración versionada y guarda fotos JPEG comprimidas en el directorio persistente de la app. `useLocalLocations` limita consultas al usuario de Clerk activo. El autotest completo se puede lanzar desde «Más» en modo de desarrollo.

## Catálogos

- Para agregar una categoría, añade su clave a `MAP_CATEGORY_KEYS` y su entrada a `MAP_CATEGORIES` en `categories.ts`; asígnale un token existente de `colors.ts`.
- Para agregar un subtipo, añade una sola entrada a `subtypes.ts` con su categoría, clave de glifo y descripción para diseño. Los tipos y helpers se derivan del catálogo.
- Los límites centralizados están en `constants.ts`; los textos de interfaz están en `texts.ts`.

## Etapas que dependen de este contenido

El formulario y el almacenamiento local usan `LocationDraft`, `MapLocation` y `validateDraft`. La sincronización y publicación usan los estados, límites y aviso de privacidad. El mapa público y sus filtros usan los catálogos, colores, coordenadas y límites geográficos. El detalle del lugar puede usar el enlace calculado a Google Maps.
