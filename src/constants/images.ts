import mascot from "@/assets/images/I/Roxy-logo2.png";
import roxyBackground from "@/assets/images/I/Roxy-logo.jpg";
import registrationAnimation from "@/assets/images/I/registroanimacion.mp4";

const mapPlaceholderDataUri =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAWSURBVChTY/iyJOE/PsyALoCOh4cCAOIXvcHorp9CAAAAAElFTkSuQmCC";

export const images = {
  mascot,
  roxyBackground,
  registrationAnimation,
  mapPlaceholderDataUri,
  mapSpikePins: {
    taller: require("@/assets/map-spike/pin-taller.png"),
    mercado: require("@/assets/map-spike/pin-mercado.png"),
  },
  // PLACEHOLDER: Replace these fixed-seed images with dedicated vein artwork.
  veinCovers: {
    artifice: { uri: "https://picsum.photos/seed/artifice/336/168" },
    merchant: { uri: "https://picsum.photos/seed/merchant/336/168" },
    collector: { uri: "https://picsum.photos/seed/collector/336/168" },
  },
};
