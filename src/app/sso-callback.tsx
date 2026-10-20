import { useAuth } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function SsoCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6">
      <ActivityIndicator accessibilityLabel="Completando autenticación" />
      <Text className="text-center text-[16px] text-[#24242a]">
        Completando autenticación...
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/sign-in")}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Text className="text-[14px] font-semibold text-[#6238d3]">
          Volver a iniciar sesión
        </Text>
      </Pressable>
    </View>
  );
}
