import { Text, View } from 'react-native';

import { theme } from '@/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View className="gap-1">
      <Text
        style={{
          color: theme.home.colors.text,
          fontSize: theme.home.typography.sectionTitle,
          lineHeight: theme.home.typography.sectionTitleLine,
          fontWeight: '600',
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: theme.home.colors.textSecondary,
            fontSize: theme.home.typography.secondary,
            lineHeight: theme.home.typography.secondaryLine,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
