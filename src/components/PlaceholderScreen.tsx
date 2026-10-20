import { Text, View } from 'react-native';

import { colors, fontFamilies, typography } from '@/theme';

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  return (
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: colors.background }}>
      <Text
        className="mb-3 text-center"
        style={{ color: colors.ink, ...typography.h2, fontFamily: fontFamilies.display }}
      >
        {title}
      </Text>
      <Text
        className="text-center"
        style={{ color: colors.inkSoft, ...typography.bodyMedium }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
