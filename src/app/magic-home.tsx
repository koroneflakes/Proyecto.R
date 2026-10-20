import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';

import { MagicHomeScreen } from '@/components/magic-home-screen';

export default function MagicHomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <MagicHomeScreen />;
}
