import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { theme } from '@/theme';
import type { ArtisanLevel } from '@/types/progression';

type LevelCardProps = {
  level: ArtisanLevel;
  nextLevel: ArtisanLevel | null;
  craftFocus: string;
  completedFirstMissions: number;
  requiredFirstMissions: number;
  onSaveCraftFocus: (value: string) => void;
};

export function LevelCard({
  level,
  nextLevel,
  craftFocus,
  completedFirstMissions,
  requiredFirstMissions,
  onSaveCraftFocus,
}: LevelCardProps) {
  const [isEditing, setIsEditing] = useState(!craftFocus);
  const [draft, setDraft] = useState(craftFocus);

  const handleSave = () => {
    onSaveCraftFocus(draft);
    setIsEditing(!draft.trim());
  };

  return (
    <View
      className="gap-4"
      style={{
        padding: theme.home.spacing.card,
        borderRadius: theme.home.radii.card,
        backgroundColor: theme.home.colors.accent,
      }}
    >
      <View className="gap-1">
        <Text
          style={{
            color: theme.home.colors.accentMutedText,
            fontSize: theme.home.typography.label,
            lineHeight: theme.home.typography.labelLine,
            letterSpacing: theme.home.typography.metadataLetterSpacing,
            fontWeight: '600',
          }}
        >
          TU NIVEL
        </Text>
        <Text
          style={{
            color: theme.home.colors.accentText,
            fontSize: theme.home.typography.levelName,
            lineHeight: theme.home.typography.levelNameLine,
            fontWeight: '700',
          }}
        >
          {level.name}
        </Text>
      </View>

      {isEditing ? (
        <View className="gap-2">
          <View className="flex-row gap-2">
            <TextInput
              accessibilityLabel="Enfoque artesanal"
              placeholder="Ej. Hago remaches de jeans"
              placeholderTextColor={theme.home.colors.accentMutedText}
              value={draft}
              onChangeText={setDraft}
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              className="min-h-11 flex-1 rounded-xl px-3"
              style={{
                color: theme.home.colors.accentText,
                borderColor: theme.home.colors.accentInputBorder,
                borderWidth: theme.home.dimensions.outline,
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Guardar enfoque artesanal"
              onPress={handleSave}
              className="min-h-11 items-center justify-center rounded-xl px-4"
              style={{ backgroundColor: theme.home.colors.accentText }}
            >
              <Text
                style={{
                  color: theme.home.colors.accent,
                  fontSize: theme.home.typography.secondary,
                  fontWeight: '600',
                }}
              >
                Guardar
              </Text>
            </Pressable>
          </View>
          <Text
            style={{
              color: theme.home.colors.accentMutedText,
              fontSize: theme.home.typography.secondary,
              lineHeight: theme.home.typography.secondaryLine,
            }}
          >
            Elige una cosa concreta: mientras más específica, mejor.
          </Text>
        </View>
      ) : (
        <View className="min-h-11 flex-row items-center justify-between gap-2">
          <Text
            className="flex-1"
            style={{
              color: theme.home.colors.accentText,
              fontSize: theme.home.typography.body,
              lineHeight: theme.home.typography.bodyLine,
            }}
          >
            “{craftFocus}”
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar enfoque artesanal"
            onPress={() => setIsEditing(true)}
            className="h-11 w-11 items-center justify-center rounded-full"
            hitSlop={6}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color={theme.home.colors.accentText}
            />
          </Pressable>
        </View>
      )}

      {nextLevel ? (
        <View className="gap-2">
          <View className="flex-row gap-1.5">
            {Array.from({ length: requiredFirstMissions }, (_, index) => (
              <View
                key={index}
                className="h-2 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    index < completedFirstMissions
                      ? theme.home.colors.accentText
                      : theme.home.colors.accentTrack,
                }}
              />
            ))}
          </View>
          <Text
            style={{
              color: theme.home.colors.accentText,
              fontSize: theme.home.typography.secondary,
              lineHeight: theme.home.typography.secondaryLine,
            }}
          >
            {completedFirstMissions} de {requiredFirstMissions} venas con su primera misión
            completada · Siguiente: {nextLevel.name}
          </Text>
        </View>
      ) : (
        <Text
          style={{
            color: theme.home.colors.accentText,
            fontSize: theme.home.typography.secondary,
            lineHeight: theme.home.typography.secondaryLine,
          }}
        >
          Alcanzaste el último nivel definido por ahora.
        </Text>
      )}
    </View>
  );
}
