import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { TAB_CONFIG } from '@/constants/tabs';
import { colors, fontFamilies, theme } from '@/theme';

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const selectedIndex = state.index;
  const [barWidth, setBarWidth] = useState(0);
  const slotWidth = barWidth / TAB_CONFIG.length;
  const indicatorOffset =
    selectedIndex * slotWidth + (slotWidth - theme.navigation.activeIndicatorDiameter) / 2;

  const handleLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const tabRoutes = TAB_CONFIG.map((tab) => {
    const route = state.routes.find((item) => item.name === tab.routeName);
    if (!route) {
      throw new Error(`No registered route found for tab "${tab.routeName}".`);
    }
    return { tab, route };
  });

  return (
    <View
      className="bg-surface"
      onLayout={handleLayout}
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, theme.navigation.tabBarMinimumBottomInset),
          borderTopLeftRadius: theme.navigation.tabBarTopRadius,
          borderTopRightRadius: theme.navigation.tabBarTopRadius,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View className="relative flex-row" style={{ height: theme.navigation.tabBarHeight }}>
        <View
          accessible={false}
          className="absolute"
          style={[
            styles.activeIndicator,
            {
              top: theme.navigation.activeIndicatorTop,
              width: theme.navigation.activeIndicatorDiameter,
              height: theme.navigation.activeIndicatorDiameter,
              backgroundColor: theme.navigation.activeColor,
              transform: [{ translateX: indicatorOffset }],
            },
          ]}
        />

        {tabRoutes.map(({ tab, route }, index) => {
          const selected = index === selectedIndex;
          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!selected && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.accessibilityLabel}
              onPress={handlePress}
              className="flex-1 items-center justify-center"
              style={styles.tab}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={selected ? theme.navigation.activeIconSize : theme.navigation.iconSize}
                color={
                  selected
                    ? theme.navigation.activeIconColor
                    : theme.navigation.inactiveIconColor
                }
              />
              {!selected && (
                <Text
                  numberOfLines={1}
                  className="mt-1 text-center"
                  style={styles.label}
                >
                  {tab.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    ...Platform.select({
      ios: {
        shadowColor: colors.ink,
        shadowOpacity: theme.navigation.shadowOpacity,
        shadowRadius: theme.navigation.shadowRadius,
        shadowOffset: { width: 0, height: theme.navigation.shadowOffsetY },
      },
      android: {
        elevation: theme.navigation.androidElevation,
      },
      default: {},
    }),
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    borderRadius: theme.navigation.activeIndicatorDiameter / 2,
  },
  tab: {
    minHeight: 44,
  },
  label: {
    maxWidth: '100%',
    color: theme.navigation.inactiveIconColor,
    fontFamily: fontFamilies.body,
    fontSize: theme.navigation.labelFontSize,
    lineHeight: theme.navigation.labelLineHeight,
  },
});
