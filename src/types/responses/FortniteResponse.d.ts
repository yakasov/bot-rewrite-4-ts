export interface FortniteResponse {
  status: number;
  data: ResponseData;
}

export interface ResponseData {
  hash: string;
  date: string;
  vbuckIcon: string;
  entries: Entry[];
}

interface Entry {
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
  layout: Layout;
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
  newDisplayAsset?: NewDisplayAsset;
  brItems?: BRItem[];
  tracks?: Track[];
  instruments?: GenericItem[];
  cars?: Car[];
  legoKits?: Omit<GenericItem, "showcaseVideo">;
}

interface Layout {
  id: string;
  name: string;
  category?: string;
  index: number;
  rank: number;
  showIneligibleOffers: string;
  background?: string;
  useWidePreview: boolean;
  displayType: string;
  textureMetadata?: Metadata[];
  stringMetadata?: Metadata[];
  textMetadata?: Metadata[];
}

interface Metadata {
  key: string;
  value: string;
}

interface NewDisplayAsset {
  id: string;
  cosmeticId?: string;
  materialInstances: MaterialInstance[];
  renderImages: {
    productTag: string;
    fileName: string;
    image: string;
  }[];
}

interface MaterialInstance {
  id: string;
  primaryMode: string;
  productTag: string;
  Images: Record<string, string>;
  Colors: Record<string, string>;
  Scalings: Record<string, number>;
  Flags: Record<string, boolean>;
}

interface GenericItem {
  id: string;
  name: string;
  description: string;
  type: Values;
  rarity: Values;
  images: {
    small: string;
    large: string;
  };
  series?: ItemSeries;
  gameplayTags?: string[];
  path?: string;
  showcaseVideo?: string;
  added: string;
  shopHistory?: Date[];
}

interface BRItem extends Omit<GenericItem, "images"> {
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
  images: Images;
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

interface Values {
  value: string;
  displayValue: string;
  backendValue: string;
}

interface ItemSeries {
  value: string;
  image?: string;
  colors: string[];
  backendValue: string;
}

interface Images {
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
  other?: Record<string, string>;
}

interface Track {
  id: string;
  devName: string;
  title: string;
  artist: string;
  album?: string;
  releaseYear: number;
  bpm: number;
  duration: number;
  difficulty: TrackDifficulty;
  gameplayTags?: string[];
  genres?: string[];
  albumArt: string;
  added: string;
  shopHistory?: string[];
}

interface TrackDifficulty {
  vocals: number;
  guitar: number;
  bass: number;
  plasticBass: number;
  drums: number;
  plasticDrums: number;
}

interface Car extends GenericItem {
  vehicleId: string;
}

export type FestivalItems = Record<string, FestivalItem>;

export interface FestivalItem {
  title: string;
  artist: string;
  releaseYear: number;
  cover: string;
  bpm: number;
  duration: string;
  difficulties: {
    vocals: number;
    guitar: number;
    bass: number;
    drums: number;
    "plastic-bass": number;
    "plastic-drums": number;
    "plastic-guitar": number;
  };
  createdAt: string;
  lastFeatured: string;
  previewUrl: string;
  featured?: boolean;
}
