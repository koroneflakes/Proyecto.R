import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";

const palette = [
  { name: "Terracota", hex: "#C4573F", description: "Rojo · retorcido · energía", tint: "bg-terracota" },
  { name: "Musgo", hex: "#5C8A5E", description: "Verde · próspero · logro", tint: "bg-musgo" },
  { name: "Lago", hex: "#4B7F9C", description: "Azul · acción · principal", tint: "bg-lago" },
  { name: "Ocre", hex: "#D8A23E", description: "Dorado · rempensa", tint: "bg-ocre" },
  { name: "Arcilla", hex: "#F0CFC2", description: "", tint: "bg-arcilla" },
  { name: "Salvia", hex: "#CFDDC4", description: "", tint: "bg-salvia" },
  { name: "Bruma", hex: "#CBDDE6", description: "", tint: "bg-bruma" },
  { name: "Miel", hex: "#F3DDA8", description: "", tint: "bg-miel" },
  { name: "Crema", hex: "#FBF7EF", description: "", tint: "bg-crema" },
  { name: "Arena", hex: "#EFE4D0", description: "", tint: "bg-arena" },
  { name: "Piedra", hex: "#8A7A66", description: "", tint: "bg-piedra" },
  { name: "Tierra", hex: "#3E3226", description: "", tint: "bg-tierra" },
];

const typographyScale = [
  { label: "H1", usage: "Page / Screen Title", size: 32, weight: "Bold", lineHeight: 1.2, style: "font-display" },
  { label: "H2", usage: "Section Title", size: 24, weight: "SemiBold", lineHeight: 1.3, style: "font-display" },
  { label: "H3", usage: "Card / Module Title", size: 20, weight: "SemiBold", lineHeight: 1.3, style: "font-display" },
  { label: "Body Large", usage: "Important content", size: 16, weight: "Regular", lineHeight: 1.6, style: "font-body" },
  { label: "Body Medium", usage: "Body text", size: 14, weight: "Regular", lineHeight: 1.6, style: "font-body" },
  { label: "Body Small", usage: "Supporting text", size: 13, weight: "Regular", lineHeight: 1.6, style: "font-body" },
  { label: "Caption", usage: "Labels / meta text", size: 11, weight: "Regular", lineHeight: 1.4, style: "font-body" },
];

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10 pt-6">
        <Text className="font-display text-[24px] font-bold tracking-[-0.8px] text-ink">
          Tipografía: Gambarino
        </Text>

        <View className="mt-6">
          {typographyScale.map((item) => (
            <View key={item.label} className="mb-3 flex-row items-end justify-between">
              <View className="w-24">
                <Text className="font-display text-[15px] font-semibold text-ink">{item.label}</Text>
              </View>
              <View className="flex-1 flex-row items-end justify-between">
                <Text
                  className={`${item.style} text-ink`}
                  style={{ fontSize: item.size, lineHeight: item.size * item.lineHeight }}
                >
                  {item.usage}
                </Text>
                <Text className="font-body text-[12px] text-inkSoft">{item.weight}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-8 flex-row items-start">
          <View className="flex-1 rounded-[30px] bg-[#171512] p-4">
            <Text className="font-display text-[15px] text-[#f5efe6]">Colores principales</Text>

            <View className="mt-3 flex-row flex-wrap">
              {palette.slice(0, 4).map((swatch) => (
                <View key={swatch.name} className="mb-3 mr-3 h-[110px] w-[31%] rounded-[18px] border border-white/5 bg-white/5 p-2">
                  <View className={`${swatch.tint} h-full rounded-[14px] p-2`}>
                    <Text className="font-display text-[15px] text-[#1b1a18]">{swatch.name}</Text>
                    <Text className="mt-1 font-body text-[11px] text-[#1b1a18]">{swatch.hex}</Text>
                    <Text className="mt-2 font-body text-[10px] text-[#1b1a18]">{swatch.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text className="mt-2 font-display text-[15px] text-[#f5efe6]">Tonos suaves para fondos y tarjetas</Text>
            <View className="mt-3 flex-row flex-wrap">
              {palette.slice(4, 8).map((swatch) => (
                <View key={swatch.name} className="mb-3 mr-3 h-[90px] w-[31%] rounded-[18px] bg-white/5 p-2">
                  <View className={`${swatch.tint} h-full rounded-[14px] p-2`}>
                    <Text className="font-display text-[13px] text-[#1b1a18]">{swatch.name}</Text>
                    <Text className="mt-1 font-body text-[10px] text-[#1b1a18]">{swatch.hex}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text className="mt-2 font-display text-[15px] text-[#f5efe6]">Neutros cálidos</Text>
            <View className="mt-3 flex-row flex-wrap">
              {palette.slice(8).map((swatch) => (
                <View key={swatch.name} className="mb-3 mr-3 h-[90px] w-[31%] rounded-[18px] bg-white/5 p-2">
                  <View className={`${swatch.tint} h-full rounded-[14px] p-2`}>
                    <Text className="font-display text-[13px] text-[#1b1a18]">{swatch.name}</Text>
                    <Text className="mt-1 font-body text-[10px] text-[#1b1a18]">{swatch.hex}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="ml-4 w-[220px] rounded-[30px] bg-[#f3efe9] p-4">
            <Text className="font-display text-[24px] text-ink">Mascota</Text>
            <View className="mt-3 overflow-hidden rounded-[24px] bg-[#f3efe9]">
              <Image source={images.mascot} className="h-[360px] w-full" resizeMode="contain" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
