export type ItemCategory =
  | "hairstyle"
  | "clothing"
  | "accessory"
  | "hat"
  | "furniture";

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  thumbnail: string; // The icon shown in the list
  price: number;
  rarity: "common" | "uncommon" | "rare" | "epic";
}

export const ITEM_REGISTRY: Record<string, ItemDefinition> = {
  // --- HAIRSTYLES ---
  hair_bob: {
    id: "hair_bob",
    name: "The Adventurer's Bob",
    category: "hairstyle",
    thumbnail: "/assets/icons/hair_bob.png",
    price: 0,
    rarity: "common",
  },
  hair_spiky: {
    id: "hair_spiky",
    name: "The Hero Spikes",
    category: "hairstyle",
    thumbnail: "/assets/icons/hair_spikes.png",
    price: 0,
    rarity: "common",
  },

  // --- CLOTHING ---
  tunic_starter: {
    id: "tunic_starter",
    name: "Novice Tunic",
    category: "clothing",
    thumbnail: "/assets/icons/tunic_starter.png",
    price: 0,
    rarity: "common",
  },
  gi_training: {
    id: "gi_training",
    name: "Training Gi",
    category: "clothing",
    thumbnail: "/assets/icons/gi_training.png",
    price: 0,
    rarity: "common",
  },
};
