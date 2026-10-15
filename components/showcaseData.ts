export type Flavor = {
  name: string;
  tagline: string;
  note: string;
  dot: string;
  src: string;
};

// Shared between the 3D stage and the overlay so they never drift out of sync.
// `dot` matches each can's printed label accent exactly (see pipeline/make_labels.mjs).
export const SHOWCASE_FLAVORS: Flavor[] = [
  {
    name: "Blood Orange\n& Rosemary",
    tagline: "No. 01",
    note: "Bittersweet citrus, a whisper of herb. The one we started with.",
    dot: "#c0592b",
    src: "/models/can_blood.glb",
  },
  {
    name: "Elderflower\n& Lime",
    tagline: "No. 02",
    note: "Floral, bright and clean on the finish. Summer in a glass.",
    dot: "#7f9168",
    src: "/models/can_elder.glb",
  },
  {
    name: "Rhubarb\n& Ginger",
    tagline: "No. 03",
    note: "Tart garden rhubarb with a warm ginger lift. Quietly moreish.",
    dot: "#b05560",
    src: "/models/can_rhubarb.glb",
  },
  {
    name: "Pink Grapefruit\n& Sage",
    tagline: "No. 04",
    note: "Bittersweet pink citrus lifted by savoury sage. Bright, dry, grown-up.",
    dot: "#d46a7b",
    src: "/models/can_grapefruit.glb",
  },
  {
    name: "Peach\n& Basil",
    tagline: "No. 05",
    note: "Ripe summer peach with a torn-basil edge. Soft, golden, gently sweet.",
    dot: "#e09a5f",
    src: "/models/can_peach.glb",
  },
  {
    name: "Cucumber\n& Mint",
    tagline: "No. 06",
    note: "Cool pressed cucumber and garden mint. Clean, crisp, barely there.",
    dot: "#6fae8c",
    src: "/models/can_cucumber.glb",
  },
];
