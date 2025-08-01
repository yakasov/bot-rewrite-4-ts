import {
  BorderColor,
  Card,
  CardFace,
  CardLanguage,
  CardLayout,
  Color,
  Finish,
  Frame,
  Game,
  ImageStatus,
  Legalities,
  Rarity,
  SetType,
} from "scryfall-api";

export const mockCardCore = {
  id: "card-id",
  lang: "en" as CardLanguage,
  layout: "battle" as CardLayout,
  // This is a good reason to NOT use TypeScript
  object: "card" as "card",
  prints_search_uri: "https://www.example-uri.com/",
  rulings_uri: "https://www.example-uri.com/",
  scryfall_uri: "https://www.example-uri.com/",
  uri: "https://www.example-uri.com/",
};

export const mockCardPrint = {
  booster: false,
  border_color: "white" as BorderColor,
  card_back_id: "card-back-id",
  collector_number: "123",
  digital: false,
  finishes: ["nonfoil"] as Finish[],
  frame: "2003" as Frame,
  full_art: true,
  games: ["arena"] as Game[],
  highres_image: true,
  image_status: "highres_scan" as ImageStatus,
  image_uris: {
    art_crop: "https://www.example-uri.com/",
    border_crop: "https://www.example-uri.com/",
    large: "https://www.example-uri.com/",
    small: "https://www.example-uri.com/",
    normal: "https://www.example-uri.com/",
    png: "https://www.example-uri.com/",
  },
  oversized: false,
  preview: {
    previewed_at: new Date(),
    source: "example-source",
    source_uri: "https://www.example-uri.com/",
  },
  prices: {
    eur: "2.50",
    usd: "2.50",
    usd_foil: "2.50",
  },
  promo: false,
  rarity: "mythic" as Rarity,
  related_uris: {},
  released_at: new Date(),
  reprint: false,
  scryfall_set_uri: "https://www.example-uri.com/",
  set: "SET",
  set_id: "set-id",
  set_name: "set-name",
  set_search_uri: "https://www.example-uri.com/",
  set_type: "commander" as SetType,
  set_uri: "https://www.example-uri.com/",
  story_spotlight: false,
  textless: false,
  variation: false,
};

export const mockGameplayCard = {
  cmc: 5,
  color_identity: ["B", "G"] as Color[],
  keywords: ["key", "words"],
  legalities: {
    alchemy: "legal",
    brawl: "legal",
    commander: "legal",
    duel: "legal",
    explorer: "legal",
    future: "legal",
    gladiator: "legal",
    historic: "legal",
    legacy: "legal",
    modern: "legal",
    oathbreaker: "legal",
    oldschool: "legal",
    pauper: "legal",
    paupercommander: "legal",
    penny: "legal",
    pioneer: "legal",
    predh: "legal",
    premodern: "legal",
    standard: "legal",
    standardbrawl: "legal",
    timeless: "legal",
    vintage: "legal",
  } as Legalities,
  name: "card-name",
  reserved: false,
  type_line: "card-types",
};

export const mockCard: Card = {
  ...mockCardCore,
  ...mockCardPrint,
  ...mockGameplayCard,
};

export const mockCardFace: CardFace = {
  cmc: 5,
  colors: ["B", "G"],
  image_uris: {
    art_crop: "https://www.example-uri.com/",
    border_crop: "https://www.example-uri.com/",
    large: "https://www.example-uri.com/",
    small: "https://www.example-uri.com/",
    normal: "https://www.example-uri.com/",
    png: "https://www.example-uri.com/",
  },
  mana_cost: "5",
  name: "card-face",
  object: "card_face" as "card_face",
};
