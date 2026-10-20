const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const typescript = require('typescript');

let shouldRejectOpenUrl = false;
let openedUrl;
const originalLoad = Module._load;

Module._load = function load(request, parent, isMain) {
  if (request === 'expo-linking') {
    return {
      openURL: async (url) => {
        openedUrl = url;
        if (shouldRejectOpenUrl) {
          throw new Error('No se pudo abrir el enlace.');
        }
      },
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const result = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(result.outputText, filename);
};

const mapContentPath = path.resolve(__dirname, '../src/data/map');
const { buildGoogleMapsUrl, openInGoogleMaps } = require(
  path.join(mapContentPath, 'google-maps.ts'),
);
const { validateDraft } = require(path.join(mapContentPath, 'validation.ts'));
const { VALIDATION_ERROR_CODES } = require(path.join(mapContentPath, 'types.ts'));

const validDraft = {
  name: 'Taller de prueba',
  category: 'mercado',
  subtypes: [],
  lat: 32.5,
  lng: -116.9,
  photoLocalUri: 'file:///foto.jpg',
};

function assertHasError(draft, expectedCode) {
  const errors = validateDraft({ ...validDraft, ...draft });
  assert.ok(
    errors.some((error) => error.code === expectedCode),
    `Se esperaba el error ${expectedCode}.`,
  );
}

assertHasError({ name: 'ab' }, VALIDATION_ERROR_CODES.NAME_TOO_SHORT);
assertHasError({ name: 'a'.repeat(61) }, VALIDATION_ERROR_CODES.NAME_TOO_LONG);
assertHasError(
  { subtypes: ['electronicos', 'bisuteria', 'mecanicos', 'ingredientes'] },
  VALIDATION_ERROR_CODES.TOO_MANY_SUBTYPES,
);
assertHasError(
  { category: 'taller', subtypes: ['electronicos'] },
  VALIDATION_ERROR_CODES.SUBTYPE_NOT_ALLOWED_FOR_CATEGORY,
);
assertHasError(
  { lat: 91 },
  VALIDATION_ERROR_CODES.COORDINATES_INVALID,
);
assertHasError({ photoLocalUri: undefined }, VALIDATION_ERROR_CODES.PHOTO_REQUIRED);
assert.equal(
  buildGoogleMapsUrl(32.5, -116.9),
  'https://www.google.com/maps/search/?api=1&query=32.5,-116.9',
);

async function testGoogleMapsOpening() {
  assert.equal(await openInGoogleMaps(32.5, -116.9), true);
  assert.equal(openedUrl, buildGoogleMapsUrl(32.5, -116.9));

  shouldRejectOpenUrl = true;
  assert.equal(await openInGoogleMaps(32.5, -116.9), false);
  assert.equal(await openInGoogleMaps(91, -116.9), false);
}

testGoogleMapsOpening()
  .then(() => {
    Module._load = originalLoad;
    console.log('Autotest del contenido del mapa: correcto.');
  })
  .catch((error) => {
    Module._load = originalLoad;
    console.error(error);
    process.exitCode = 1;
  });
