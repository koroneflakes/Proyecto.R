import { useUser } from '@clerk/expo';
import { useState } from 'react';
import { Alert, Button, View } from 'react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { getTabConfig } from '@/constants/tabs';
import { runPublishLayerSelfTest } from '@/data/map/publish-self-test';
import { runLocalStorageSelfTest } from '@/data/map/self-test';

const tab = getTabConfig('more');

export default function MoreScreen() {
  const { user } = useUser();
  const [isRunningSelfTest, setIsRunningSelfTest] = useState(false);
  const [isRunningPublishTest, setIsRunningPublishTest] = useState(false);

  const runSelfTest = async () => {
    if (!user?.id) {
      Alert.alert('Autotest del mapa', 'No hay un usuario de Clerk disponible.');
      return;
    }

    setIsRunningSelfTest(true);
    try {
      await runLocalStorageSelfTest(user.id);
      Alert.alert('Autotest del mapa', 'El flujo de almacenamiento local terminó correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido.';
      Alert.alert('Falló el autotest del mapa', message);
      console.error('Falló el autotest de almacenamiento local del mapa.', error);
    } finally {
      setIsRunningSelfTest(false);
    }
  };

  const runPublishTest = async () => {
    if (!user?.id) {
      Alert.alert('Autotest de publicación', 'No hay un usuario de Clerk disponible.');
      return;
    }

    setIsRunningPublishTest(true);
    try {
      await runPublishLayerSelfTest(user.id);
      Alert.alert('Autotest de publicación', 'La capa de publicación terminó correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido.';
      Alert.alert('Falló el autotest de publicación', message);
      console.error('Falló el autotest de publicación del mapa.', error);
    } finally {
      setIsRunningPublishTest(false);
    }
  };

  if (!__DEV__) {
    return <PlaceholderScreen title={tab.label} subtitle={tab.placeholderSubtitle} />;
  }

  return (
    <View className="flex-1">
      <PlaceholderScreen title={tab.label} subtitle={tab.placeholderSubtitle} />
      <View className="px-6 pb-6">
        <Button
          title={isRunningSelfTest ? 'Ejecutando autotest…' : 'Probar almacenamiento local del mapa'}
          disabled={isRunningSelfTest || isRunningPublishTest}
          onPress={() => void runSelfTest()}
        />
        <Button
          title={isRunningPublishTest ? 'Ejecutando autotest…' : 'Probar publicación simulada'}
          disabled={isRunningSelfTest || isRunningPublishTest}
          onPress={() => void runPublishTest()}
        />
      </View>
    </View>
  );
}
