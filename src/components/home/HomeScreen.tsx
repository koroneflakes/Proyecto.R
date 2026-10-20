import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeaturedMissionCard } from '@/components/home/FeaturedMissionCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { LevelCard } from '@/components/home/LevelCard';
import { MissionListItem } from '@/components/home/MissionListItem';
import { RewardPreviewCard } from '@/components/home/RewardPreviewCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { VeinCarousel } from '@/components/home/VeinCarousel';
import { useHomeData } from '@/hooks/useHomeData';
import { theme } from '@/theme';

export function HomeScreen() {
  const home = useHomeData();
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (isSigningOut && isLoaded && !isSignedIn) {
      router.replace('/magic-home');
    }
  }, [isLoaded, isSignedIn, isSigningOut]);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    if (isLoaded && !isSignedIn) {
      router.replace('/magic-home');
      return;
    }

    setIsSigningOut(true);
    try {
      await signOut();
      router.replace('/magic-home');
    } catch (error) {
      console.error('Failed to sign out.', error);
      Alert.alert('No se pudo cerrar la sesión', 'Inténtalo de nuevo.');
      setIsSigningOut(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: theme.home.spacing.horizontal,
        paddingTop: insets.top + theme.home.spacing.screenTopOffset,
        paddingBottom:
          theme.navigation.tabBarHeight +
          Math.max(insets.bottom, theme.navigation.tabBarMinimumBottomInset) +
          theme.home.spacing.screenBottomExtra,
        gap: theme.home.spacing.section,
      }}
      style={{ flex: 1, backgroundColor: theme.home.colors.background }}
    >
      {!home.isReady ? (
        <HomeSkeleton />
      ) : (
        <>
          <HomeHeader
            firstName={home.firstName}
            imageUrl={home.imageUrl}
            isSigningOut={isSigningOut}
            onSignOut={handleSignOut}
          />
          <LevelCard
            level={home.currentLevel}
            nextLevel={home.nextLevel}
            craftFocus={home.craftFocus}
            completedFirstMissions={home.completedFirstMissions}
            requiredFirstMissions={home.requiredFirstMissions}
            onSaveCraftFocus={home.setCraftFocus}
          />
          <VeinCarousel items={home.veins} />
          {home.featuredMission ? (
            <>
              <FeaturedMissionCard home={home} />
              {home.otherMissions.length > 0 ? (
                <View className="gap-3">
                  <SectionHeader title="Otras misiones" />
                  {home.otherMissions.slice(0, 3).map((mission) => (
                    <MissionListItem
                      key={mission.id}
                      mission={mission}
                      home={home}
                    />
                  ))}
                </View>
              ) : null}
              <RewardPreviewCard home={home} />
            </>
          ) : (
            <View
              className="justify-center"
              style={{
                minHeight: theme.home.dimensions.emptyStateMinHeight,
                padding: theme.home.spacing.card,
                borderRadius: theme.home.radii.card,
                borderWidth: theme.home.dimensions.outline,
                borderColor: theme.home.colors.border,
                backgroundColor: theme.home.colors.surface,
              }}
            >
              <Text
                style={{
                  color: theme.home.colors.textSecondary,
                  fontSize: theme.home.typography.body,
                  lineHeight: theme.home.typography.bodyLine,
                }}
              >
                Por ahora no hay misiones disponibles. Cuando se definan nuevas, aparecerán aquí.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
