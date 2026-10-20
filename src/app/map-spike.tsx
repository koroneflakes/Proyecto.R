import {
  Camera,
  GeoJSONSource,
  Images,
  Layer,
  Map as MapLibreMap,
  OfflineManager,
  type OfflinePack,
  type OfflinePackStatus,
  type StyleSpecification,
} from '@maplibre/maplibre-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { images } from '@/constants/images';
import {
  SPIKE_BASE_STYLE_URL,
  SPIKE_DEFAULT_MAX_ZOOM,
  SPIKE_MAX_ZOOM_OPTIONS,
  SPIKE_MIN_ZOOM,
  SPIKE_SAMPLE_POINTS,
  SPIKE_TEST_BOUNDS,
  SPIKE_TEST_CENTER,
} from '@/data/map-spike/constants';
import amateStyleJson from '../../assets/map-spike/amate-style.json';

type StyleMode = 'base' | 'local' | 'remote';
type PackEntry = {
  pack: OfflinePack;
  status: OfflinePackStatus;
};
type DownloadMeasurement = {
  bytes: number;
  seconds: number;
};

const AMATE_STYLE = amateStyleJson as StyleSpecification;

function formatBytes(bytes: number): string {
  if (bytes < 1_000_000) {
    return `${(bytes / 1_000).toFixed(1)} kB`;
  }
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

function getDownloadSize(status: OfflinePackStatus): number {
  return status.completedResourceSize;
}

export default function MapSpikeScreen() {
  const [styleMode, setStyleMode] = useState<StyleMode>('base');
  const [remoteStyleUrl, setRemoteStyleUrl] = useState('');
  const [maxZoom, setMaxZoom] = useState<number>(SPIKE_DEFAULT_MAX_ZOOM);
  const [packs, setPacks] = useState<PackEntry[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<OfflinePackStatus | null>(null);
  const [spikeError, setSpikeError] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<
    Partial<Record<number, DownloadMeasurement>>
  >({});
  const downloadStartedAt = useRef<number | null>(null);
  const activePackId = useRef<string | null>(null);

  const refreshPacks = useCallback(async () => {
    setIsLoadingPacks(true);
    try {
      const offlinePacks = await OfflineManager.getPacks();
      const entries = await Promise.all(
        offlinePacks.map(async (pack) => ({
          pack,
          status: await pack.status(),
        })),
      );
      setPacks(entries);
    } finally {
      setIsLoadingPacks(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void refreshPacks().catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudieron consultar los paquetes.';
        setSpikeError(message);
        console.error('No se pudieron consultar los paquetes offline de MapLibre.', error);
      });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (activePackId.current) {
        OfflineManager.removeListener(activePackId.current);
      }
    };
  }, [refreshPacks]);

  const handleProgress = useCallback(
    (pack: OfflinePack, status: OfflinePackStatus) => {
      setProgress(status);
      if (status.state === 'complete') {
        const startedAt = downloadStartedAt.current;
        if (startedAt !== null) {
          setMeasurements((current) => ({
            ...current,
            [maxZoom]: {
              bytes: getDownloadSize(status),
              seconds: (Date.now() - startedAt) / 1_000,
            },
          }));
        }
        setIsDownloading(false);
        OfflineManager.removeListener(pack.id);
        activePackId.current = null;
        void refreshPacks();
      }
    },
    [maxZoom, refreshPacks],
  );

  const createOfflinePack = async () => {
    setSpikeError(null);
    setProgress(null);
    try {
      const sameRangeAlreadyExists = packs.some(
        ({ pack }) =>
          pack.metadata.spike === true &&
          pack.metadata.maxZoom === maxZoom &&
          pack.metadata.styleMode === styleMode,
      );
      if (sameRangeAlreadyExists) {
        setSpikeError(
          `Ya existe un paquete de prueba para zoom máximo ${maxZoom} con este estilo. Bórralo antes de repetir la descarga.`,
        );
        return;
      }
      if (styleMode === 'remote' && !remoteStyleUrl.trim()) {
        setSpikeError('Pega la URL pública raw del estilo JSON que quieres probar.');
        return;
      }

      setIsDownloading(true);
      downloadStartedAt.current = Date.now();
      const packStyle =
        styleMode === 'remote' ? remoteStyleUrl.trim() : SPIKE_BASE_STYLE_URL;
      const pack = await OfflineManager.createPack(
        {
          mapStyle: packStyle,
          bounds: SPIKE_TEST_BOUNDS,
          minZoom: SPIKE_MIN_ZOOM,
          maxZoom,
          metadata: {
            spike: true,
            styleMode,
            maxZoom,
            bounds: SPIKE_TEST_BOUNDS,
          },
        },
        handleProgress,
        (_offlinePack, error) => {
          setSpikeError(`Falló la descarga (${error.id}): ${error.message}`);
          setIsDownloading(false);
        },
      );
      activePackId.current = pack.id;
      await refreshPacks();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falló la creación del paquete offline.';
      setSpikeError(message);
      setIsDownloading(false);
      console.error('Falló la descarga del paquete de prueba de MapLibre.', error);
    }
  };

  const deletePack = async (packId: string) => {
    setSpikeError(null);
    try {
      await OfflineManager.deletePack(packId);
      OfflineManager.removeListener(packId);
      if (activePackId.current === packId) {
        activePackId.current = null;
        setIsDownloading(false);
      }
      await refreshPacks();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo borrar el paquete offline.';
      setSpikeError(message);
      console.error(`No se pudo borrar el paquete offline ${packId}.`, error);
    }
  };

  const mapStyle =
    styleMode === 'local'
      ? AMATE_STYLE
      : styleMode === 'remote' && remoteStyleUrl.trim()
        ? remoteStyleUrl.trim()
        : SPIKE_BASE_STYLE_URL;

  return (
    <View className="flex-1 bg-[#D8C39A]">
      <View className="px-4 pt-12 pb-2">
        <Text className="text-xl font-bold text-[#3A2B20]">
          MapLibre spike — Ensenada
        </Text>
        <Text className="text-sm text-[#3A2B20]">
          Prueba desechable. Cambia el cuadro de prueba por una zona pequeña propia
          en constants.ts.
        </Text>
      </View>

      <View className="h-[42%] min-h-[280px]">
        <MapLibreMap
          mapStyle={mapStyle}
          style={{ flex: 1 }}
          attribution
          attributionPosition={{ bottom: 8, right: 8 }}
          logo
          logoPosition={{ bottom: 8, left: 8 }}
          compass
          scaleBar
          onDidFinishLoadingMap={() => setSpikeError(null)}
          onDidFailLoadingMap={() =>
            setSpikeError('MapLibre no pudo cargar el estilo o sus recursos.')
          }
        >
          <Camera
            initialViewState={{
              center: [SPIKE_TEST_CENTER.longitude, SPIKE_TEST_CENTER.latitude],
              zoom: 13,
            }}
            minZoom={SPIKE_MIN_ZOOM}
            maxZoom={18}
          />
          <Images
            images={{
              'pin-taller': images.mapSpikePins.taller,
              'pin-mercado': images.mapSpikePins.mercado,
            }}
          />
          <GeoJSONSource
            id="spike-sample-points"
            data={JSON.stringify(SPIKE_SAMPLE_POINTS)}
            cluster
            clusterRadius={48}
            clusterMaxZoom={14}
          >
            <Layer
              id="spike-clusters"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': '#3A2B20',
                'circle-radius': ['step', ['get', 'point_count'], 18, 5, 23],
                'circle-stroke-color': '#D8C39A',
                'circle-stroke-width': 2,
              }}
            />
            <Layer
              id="spike-cluster-count"
              type="symbol"
              filter={['has', 'point_count']}
              layout={{
                'text-field': ['get', 'point_count_abbreviated'],
                'text-size': 13,
              }}
              paint={{ 'text-color': '#D8C39A' }}
            />
            <Layer
              id="spike-single-points"
              type="symbol"
              filter={['!', ['has', 'point_count']]}
              layout={{
                'icon-image': [
                  'case',
                  ['>=', ['zoom'], 15],
                  ['get', 'icon'],
                  'pin-taller',
                ],
                'icon-size': 0.75,
                'icon-allow-overlap': true,
              }}
            />
          </GeoJSONSource>
        </MapLibreMap>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        <Text className="mb-1 font-semibold text-[#3A2B20]">Estilo del mapa</Text>
        <View className="mb-2 flex-row gap-2">
          {(['base', 'local', 'remote'] as const).map((mode) => (
            <View key={mode} className="flex-1">
              <Button
                title={
                  mode === 'base'
                    ? 'OpenFreeMap'
                    : mode === 'local'
                      ? 'JSON local'
                      : 'JSON URL'
                }
                onPress={() => setStyleMode(mode)}
                disabled={isDownloading}
              />
            </View>
          ))}
        </View>
        {styleMode === 'remote' && (
          <TextInput
            value={remoteStyleUrl}
            onChangeText={setRemoteStyleUrl}
            placeholder="URL raw pública temporal del estilo JSON"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            className="mb-3 rounded border border-[#3A2B20] px-3 py-2 text-[#3A2B20]"
          />
        )}

        <Text className="mb-1 font-semibold text-[#3A2B20]">
          Paquete offline — min zoom {SPIKE_MIN_ZOOM}, max zoom {maxZoom}
        </Text>
        <View className="mb-2 flex-row gap-2">
          {SPIKE_MAX_ZOOM_OPTIONS.map((zoom) => (
            <View key={zoom} className="flex-1">
              <Button
                title={`Máx ${zoom}`}
                onPress={() => setMaxZoom(zoom)}
                disabled={isDownloading}
              />
            </View>
          ))}
        </View>

        <View className="mb-2 flex-row gap-2">
          <View className="flex-1">
            <Button
              title={isDownloading ? 'Descargando…' : 'Crear paquete'}
              onPress={() => void createOfflinePack()}
              disabled={isDownloading}
            />
          </View>
          <View className="flex-1">
            <Button
              title={isLoadingPacks ? 'Actualizando…' : 'Listar paquetes'}
              onPress={() =>
                void refreshPacks().catch((error: unknown) => {
                  const message =
                    error instanceof Error
                      ? error.message
                      : 'No se pudieron consultar los paquetes.';
                  setSpikeError(message);
                })
              }
              disabled={isLoadingPacks || isDownloading}
            />
          </View>
        </View>

        <Text className="mb-1 text-sm text-[#3A2B20]">
          Zona: O {SPIKE_TEST_BOUNDS[0].toFixed(5)} a O{' '}
          {SPIKE_TEST_BOUNDS[2].toFixed(5)}, N {SPIKE_TEST_BOUNDS[1].toFixed(5)} a
          N {SPIKE_TEST_BOUNDS[3].toFixed(5)}. Elige un solo rango a la vez; borra
          un paquete antes de repetir la descarga.
        </Text>

        {progress && (
          <Text className="mb-2 text-sm text-[#3A2B20]">
            {progress.state}: {progress.percentage.toFixed(1)}% ·{' '}
            {progress.completedTileCount} tiles ·{' '}
            {formatBytes(progress.completedResourceSize)} recursos
          </Text>
        )}

        {SPIKE_MAX_ZOOM_OPTIONS.map((zoom) => {
          const measurement = measurements[zoom];
          return (
            <Text key={zoom} className="text-sm text-[#3A2B20]">
              Medición sesión máx {zoom}:{' '}
              {measurement
                ? `${formatBytes(measurement.bytes)}, ${measurement.seconds.toFixed(1)} s`
                : 'pendiente'}
            </Text>
          );
        })}

        {spikeError && (
          <Text className="my-2 text-sm text-red-900">{spikeError}</Text>
        )}

        <Text className="mt-3 mb-1 font-semibold text-[#3A2B20]">
          Paquetes existentes ({packs.length})
        </Text>
        {packs.map(({ pack, status }) => (
          <View
            key={pack.id}
            className="mb-2 rounded border border-[#3A2B20] p-2"
          >
            <Text className="text-xs text-[#3A2B20]">
              {pack.id} · estilo {String(pack.metadata.styleMode ?? 'sin metadatos')}
              {' · '}máx zoom {String(pack.metadata.maxZoom ?? '—')}
            </Text>
            <Text className="text-xs text-[#3A2B20]">
              {status.state} · {status.completedTileCount} tiles ·{' '}
              {formatBytes(status.completedResourceSize)}
            </Text>
            <Button
              title="Borrar paquete"
              onPress={() => {
                Alert.alert('Borrar paquete offline', '¿Quieres eliminar este paquete?', [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Borrar',
                    style: 'destructive',
                    onPress: () => void deletePack(pack.id),
                  },
                ]);
              }}
              disabled={isDownloading}
            />
          </View>
        ))}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
