export interface FortniteResponse {
  status: number;
  data: FortniteResponseData;
}

export interface FortniteResponseData {
    hash: string;
    date: string;
    vbuckIcon: string;
    entries: FortniteEntry[];
  };

interface FortniteEntry {
  regularPrice: number;
  finalPrice: number;
  devName: string;
  offerId: string;
  inDate: string;
  outDate: string;
  bundle?: {
    name: string;
    info: string;
    image: string;
  };
  banner?: {
    value: string;
    intensity: string;
    backendValue: string;
  };
  offerTag?: {
    id: string;
    text: string;
  };
  giftable: boolean;
  refundable: boolean;
  sortPriority: number;
  layoutId: string;
  layout: FortniteLayout;
  colors?: {
    color1: string;
    color2?: string;
    color3?: string;
    textBackgroundColor: string;
  };
  tileBackgroundMaterial?: string;
  tileSize?: string;
  displayAssetPath?: string;
  newDisplayAssetPath?: string;
  newDisplayAsset?: FortniteNewDisplayAsset;
  brItems?: FortniteBRItem[];
  tracks?: FortniteTrack[];
  instruments?: FortniteGenericItem[];
  cars?: FortniteCar[];
  legoKits?: Omit<FortniteGenericItem, "showcaseVideo">;
}

interface FortniteLayout {
  id: string;
  name: string;
  category?: string;
  index: number;
  rank: number;
  showIneligibleOffers: string;
  background?: string;
  useWidePreview: boolean;
  displayType: string;
  textureMetadata?: FortniteMetadata[];
  stringMetadata?: FortniteMetadata[];
  textMetadata?: FortniteMetadata[];
}

interface FortniteMetadata {
  key: string;
  value: string;
}

interface FortniteNewDisplayAsset {
  id: string;
  cosmeticId?: string;
  materialInstances: FortniteMaterialInstance[];
  renderImages: {
    productTag: string;
    fileName: string;
    image: string;
  }[];
}

interface FortniteMaterialInstance {
  id: string;
  primaryMode: string;
  productTag: string;
  Images: { [key: string]: string };
  Colors: { [key: string]: string };
  Scalings: { [key: string]: number };
  Flags: { [key: string]: boolean };
}

interface FortniteGenericItem {
  id: string;
  name: string;
  description: string;
  type: FortniteValues;
  rarity: FortniteValues;
  images: {
    small: string;
    large: string;
  };
  series?: FortniteItemSeries;
  gameplayTags?: string[];
  path?: string;
  showcaseVideo?: string;
  added: string;
  shopHistory?: Date[];
}

interface FortniteBRItem extends Omit<FortniteGenericItem, "images"> {
  exclusiveDescription?: string;
  unlockRequirements?: string;
  customExclusiveCallout?: string;
  set?: {
    value: string;
    text: string;
    backendValue: string;
  };
  introduction?: {
    chapter: string;
    season: string;
    text: string;
    backendValue: number;
  };
  images: FortniteImages;
  variants?: {
    channel: string;
    type: string;
    options: {
      tag: string;
      name: string;
      unlockRequirements?: string;
      image: string;
    }[];
  }[];
  builtInEmoteIds?: string[];
  searchTags?: string[];
  metaTags?: string[];
  dynamicPakId?: string;
  itemPreviewHeroPath?: string;
  displayAssetPath?: string;
  definitionPath?: string;
}

interface FortniteValues {
  value: string;
  displayValue: string;
  backendValue: string;
}

interface FortniteItemSeries {
  value: string;
  image?: string;
  colors: string[];
  backendValue: string;
}

interface FortniteImages {
  smallIcon: string;
  icon: string;
  featured?: string;
  lego?: {
    small: string;
    large: string;
    wide?: string;
  };
  bean?: {
    small: string;
    large: string;
  };
  other?: { [key: string]: string };
}

interface FortniteTrack {
  id: string;
  devName: string;
  title: string;
  artist: string;
  album?: string;
  releaseYear: number;
  bpm: number;
  duration: number;
  difficulty: FortniteTrackDifficulty;
  gameplayTags?: string[];
  genres?: string[];
  albumArt: string;
  added: string;
  shopHistory?: string[];
}

interface FortniteTrackDifficulty {
  vocals: number;
  guitar: number;
  bass: number;
  plasticBass: number;
  drums: number;
  plasticDrums: number;
}

interface FortniteCar extends FortniteGenericItem {
  vehicleId: string;
}
