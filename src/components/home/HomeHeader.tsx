import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@/theme';

type HomeHeaderProps = {
  firstName: string;
  imageUrl: string | null;
  isSigningOut: boolean;
  onSignOut: () => void;
};

export function HomeHeader({
  firstName,
  imageUrl,
  isSigningOut,
  onSignOut,
}: HomeHeaderProps) {
  return (
    <View className="min-h-11 flex-row items-center justify-between">
      <View>
        <View className="gap-0.5">
          <Text
            style={{
              color: theme.home.colors.textSecondary,
              fontSize: theme.home.typography.secondary,
              lineHeight: theme.home.typography.greetingLine,
            }}
          >
            Hola,
          </Text>
          <Text
            numberOfLines={1}
            style={{
              maxWidth: 250,
              color: theme.home.colors.text,
              fontSize: theme.home.typography.screenTitle,
              lineHeight: theme.home.typography.screenTitleLine,
              fontWeight: '700',
            }}
          >
            {firstName}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Salir de la sesión"
          disabled={isSigningOut}
          onPress={onSignOut}
          className="min-h-11 justify-center self-start"
        >
          <Text
            style={{
              color: theme.home.colors.textSecondary,
              fontSize: theme.home.typography.secondary,
              lineHeight: theme.home.typography.secondaryLine,
              textDecorationLine: 'underline',
              opacity: isSigningOut ? 0.6 : 1,
            }}
          >
            {isSigningOut ? 'Cerrando sesión…' : 'Salir de la sesión'}
          </Text>
        </Pressable>
      </View>
      <View
        className="items-center justify-center overflow-hidden rounded-full"
        style={{
          width: theme.home.dimensions.avatar,
          height: theme.home.dimensions.avatar,
          borderColor: theme.home.colors.border,
          borderWidth: theme.home.dimensions.avatarBorder,
          backgroundColor: theme.home.colors.surface,
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            contentFit="cover"
            transition={theme.home.motion.avatarTransitionMs}
            style={{ width: '100%', height: '100%' }}
            accessibilityLabel={`Foto de perfil de ${firstName}`}
          />
        ) : (
          <Text
            accessibilityLabel={`Inicial de ${firstName}`}
            style={{
              color: theme.home.colors.text,
              fontSize: theme.home.typography.avatarFallback,
              fontWeight: '600',
            }}
          >
            {firstName.charAt(0).toLocaleUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );
}
