This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

----------------------------------------------#

You are an expert React Native and Expo engineer helping me build
[Proyecto.R].
Write clean, simple, maintainable code. Prioritize clarity over
unnecessary abstraction.
Think like a senior mobile developer.
---
## Project Overview
We are building [Proyecto.R], [a gamified platform for developing real-world artisanal skills, sharing practical knowledge, discovering useful resources, and building a collaborative community of artisans].

The app helps users progress from beginners to skilled artisans through practical creation, repair, material sourcing, and responsible commerce. Its philosophy prioritizes useful and durable objects, craftsmanship, resourcefulness, local and sustainable materials, fair exchange, and shared knowledge over consumerism or wealth maximization.

The app includes:
[FEATURE_LIST]
Artisan progression: A game-like progression system based on demonstrated skills, practical achievements, and meaningful contributions rather than arbitrary points alone.

Three skill paths (venas):

Artífice: Creating, repairing, and improving useful objects.

Recolector: Finding, evaluating, sourcing, and eventually generating raw materials.

Comerciante: Pricing, selling, and distributing crafted products through responsible and sustainable commercial practices.

Craftsmanship quality grades: Objects progress through Funcional → Artesanal → Maestre → Emblema → Reliquia. Their quality is evaluated across six dimensions: Material, Resistencia, Durabilidad, Reparabilidad, Función, and Estilo. Reliquia represents exceptional craftsmanship and discoveries beyond ordinary quality requirements.

Commercial progression: Mercader de Correspondencia → Mercader de Barrio → Feriante → Tendero → Maestro de Tienda. Progression represents the development of direct sales, community recognition, participation in temporary markets, regular sales channels, and an independent shop.

Resource-gathering progression: Explorador de Rincones → Rastreador de Abastos → Tratante de Abastos → Enlace de Origen → Maestro de Abastos. Progression represents discovering reusable materials, building reliable sourcing networks, negotiating with intermediaries, connecting directly with local primary producers, and eventually generating or processing raw materials independently.

Community recipe library: Artisans can publish practical recipes, tutorials, and project guides covering fabrication, repair, reuse, and material transformation. Each recipe should support authorship, descriptions, instructions, required tools, material lists, quantities, estimated costs, and relevant safety considerations.

Recipe categorization and discovery: Recipes are organized by craft and activity, including electronics, sewing, gastronomy, woodworking, and other disciplines. Categories can contain subcategories, techniques, project types, and material tags. Users should be able to search, filter, and discover recipes relevant to their interests and skills.

Recipe ratings and contribution reputation: A community evaluation system inspired by GitHub allows users to recognize useful recipes and contributions. Support recipe ratings, saves or bookmarks, author attribution, revision history, and community feedback. Where appropriate, evaluate recipes across relevant dimensions such as quality, strength, durability, repairability, function, and materials. Keep overall popularity separate from individual quality dimensions and verified craftsmanship.

Material sourcing map: A minimalist map interface powered by the Google Maps Platform helps artisans discover and record local suppliers, shops, workshops, producers, and other sources of useful materials. Users can associate a location with a business or source name, a trusted vendor contact, available materials, relevant notes, and sourcing information.

Recipe-to-material connections: Recipes published by Artífices define their required materials. The Recolector's sourcing map connects those requirements to places where the materials may be available. Users can discover relevant sources for a specific project, record supplier information, and maintain useful material-source directories.

Supplier and material records: Store material names, descriptions, source locations, available quality information, provenance, sustainability considerations, and prices when known. Availability and prices may change, so distinguish user-reported information from verified or recently updated information.

Merchant cost calculator: A dedicated tool helps artisans estimate the actual cost of producing and selling an item. It supports fixed costs, variable costs, production quantities, material costs, labor, packaging, and other applicable expenses. It automatically calculates unit costs, allocated fixed costs, estimated selling prices, margins, and break-even quantities when sufficient inputs are available.

Recipe-integrated costing: The Comerciante's calculator can reuse material lists and quantities from Artífice recipes. Material prices can be updated, and production estimates recalculated. Clearly distinguish known costs, user estimates, and missing inputs instead of silently assuming values.

Shared data across systems: Recipes, materials, supplier locations, and cost calculations should be connected through consistent data models. A recipe identifies what is needed, the sourcing map helps locate it, and the cost calculator estimates what it takes to produce and sell the resulting object.

Quality, ethics, and local impact: Depending on the activity, progression and evaluations consider craftsmanship, fair pricing, honesty, punctuality, humanity, material quality, local impact, provenance, and regional uniqueness.

Circular use of resources: Encourage repairing, reusing, recovering, and transforming materials—including suitable industrial byproducts—into useful, durable, high-value products.

Community knowledge and collaboration: Enable artisans to share techniques, useful contacts, material sources, project improvements, and opportunities that help others become more capable and self-sufficient.

Incremental development: Build the application in modular stages. Prioritize a functional core, clear data relationships, understandable interfaces, and maintainable code. Do not invent additional ranks, scoring formulas, permissions, or technical requirements unless they are explicitly defined or agreed upon.

Proyecto.R should feel like a game about becoming a capable artisan in the real world, not a conventional business management platform or a generic social network.

Every feature should support practical learning, resourcefulness, craftsmanship, independence, responsible exchange, or community benefit.

Keep the implementation simple and readable.
---
## Tech Stack
- Expo

- React Native

- TypeScript

- Expo Router

- NativeWind

- Zustand

- AsyncStorage

- Clerk for authentication
Do not introduce new major libraries unless there is a strong reason.
Ask before installing anything new.
---
## Development Philosophy
Build feature by feature.
For every feature:
1. Read this file first.

2. Keep the implementation simple.

3. Avoid overengineering.

4. Prefer readable code over clever code.

5. Build the smallest useful version first.

6. Refactor only when repetition appears.
---
## Decision Making
If something is unclear or could be improved, suggest a better
approach. If a new library would significantly help, recommend it,
explain why, and ask before adding it.
Do not install new libraries without approval.
---
## Architecture
Use this folder structure:
```

app/

 (auth)/

 (tabs)/

components/

constants/
constants/

data/

hooks/

lib/

store/

types/

assets/

```
**app/** is for routes and screens only. Screens compose components and
call hooks or stores. They should not contain large reusable UI blocks
or business logic.
**components/** is for reusable UI. Create a component when it is
reused in multiple places, when it makes a screen easier to read, or
when it represents a clear UI concept. Examples for this app:
[EXAMPLE_COMPONENT_NAMES]. Do not create components too early.
**data/** holds hardcoded content. Keep it typed.
**store/** holds Zustand stores. Examples of state to keep here:
[EXAMPLE_STATE_FIELDS]. Persist with AsyncStorage when needed.
**lib/** holds external service helpers (clerk.ts, api.ts, cn.ts).
Never expose secret keys here.
---
## UI Rules
For any UI task:
- Replicate the provided design exactly.
- Match layout, spacing, padding, font sizes, font hierarchy, colors,
border radius, shadows, alignment, and proportions.

- Do not approximate. Do not simplify unless explicitly asked.
---
## Styling Rules
Use NativeWind classes. Do not use StyleSheet unless it is not possible
to style with className.
Use the NativeWind version installed in this project. Check
package.json. Do not upgrade without approval.
Reuse class patterns through utilities in global.css.
### Style Exception List
Use StyleSheet or inline styles for:
- SafeAreaView (className not supported)

- KeyboardAvoidingView (behavior props)

- Modal (visible, transparent props)

- Animated.View (animated style values)

- Dynamic styles calculated at runtime

- Platform specific styles

- Pressable or TouchableOpacity pressed states

- Shadows (different per platform)
Everywhere else, use NativeWind.
---
## Image Rule
Use centralized image imports.
1. Check if constants/images.ts exists.

2. If not, create it.

3. Import all app images there.

4. Use them through the centralized object.
```ts

import mascot from "@/assets/images/i/Roxy-logo2";
export const images = {

 mascot,

};

```
```tsx

<Image source={images.mascot} />

```
Do not import image assets directly inside screens or components.
---
## State Management
- Zustand for global client state.

- Local state for temporary UI state.

- AsyncStorage for persistence.
---
## TypeScript
- Strict mode.

- No `any`.

- Keep types simple and readable.
---
## Feature Implementation
When building a feature:
1. Read this file first.

2. Identify the files to change.

3. Keep changes focused.

4. Do not rewrite unrelated code.

5. Follow existing patterns.

6. Make sure the feature works end to end.

7. Fix lint and type errors before finishing.
---
## Secrets
- Never expose secret keys in client code.

- Use server routes for tokens, AI calls, and any external API access.
---
## Authentication
Use Clerk. Do not build custom auth.
---
## Communication
Be concise. Explain what changed and how to test it.
---
## Final Reminder
Before every feature:
- Read this file.

- Follow it strictly.

- Build clean, simple code.

- Replicate UI exactly when designs are provided.