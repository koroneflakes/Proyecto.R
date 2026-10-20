import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TAB_CONFIG } from '@/constants/tabs';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/magic-home" />;
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen key={tab.id} name={tab.routeName} />
      ))}
    </Tabs>
  );
}
