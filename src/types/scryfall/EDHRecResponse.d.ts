export interface EDHRecResponse {
  creature: number;
  instant: number;
  sorcery: number;
  artifact: number;
  enchantment: number;
  battle: number;
  planeswalker: number;
  land: number;
  basic: number;
  nonbasic: number;
  similar: EDHRecCard[];
  header: string;
  panels: Panels;
  description: string;
  container: Container;
}

export interface Panels {
  piechart: Piechart;
  links: Link[];
  mana_curve?: Record<number, number>;
  rank_over_time?: Record<string, RankOverTime>;
  combocounts?: ComboCount[];
  taglinks?: TagLink[];
  articles?: Article[];
}

export interface Piechart {
  content: {
    label: string;
    value: number;
    color: string;
  }[];
  title: string;
}

export interface Link {
  header: string;
  items: {
    href: string;
    value: string;
  }[];
  separator: string;
}

export interface Article {
  alt: string;
  date: string;
  href: string;
  site: {
    api: string;
    auth: string;
    id: string;
    name: string;
    parent_page_id: number;
    tags: boolean;
  };
  value: string;
  author: {
    avatar: string;
    id: number;
    link: string;
    name: string;
  };
  excerpt: string;
  media: string;
}

export interface Container {
  breadcrumb: Record<string, string>[];
  description: string | null;
  json_dict: JSONDict;
  keywords: string;
  title: string;
}

export interface JSONDict {
  cardlists: CardList[];
  card: EDHRecCard;
}

export interface CardList {
  cardviews: CardView[];
  header: string;
  tag: string;
}

export interface CardView {
  name: string;
  sanitized: string;
  sanitized_wo: string;
  url: string;
  inclusion: number;
  label: string;
  num_decks: number;
  potential_decks: number;
}

export interface EDHRecCard {
  potential_decks?: number;
  color_identity: string[];
  cmc: number;
  image_uris: {
    normal: string;
    art_crop: string;
  }[];
  layout: string;
  name: string;
  names: string[];
  prices: Prices;
  primary_type: string;
  rarity: string;
  salt: number;
  sanitized: string;
  sanitized_wo: string;
  scryfall_uri: string;
  spellbook_uri: string;
  type: string;
  combos: boolean;
  label?: string;
  legal_commander: boolean;
  url: string | null;
}

export interface Prices {
  cardhoarder: Price;
  cardkingdom: Price;
  cardmarket: Price;
  face2face: Price;
  manapool: Price;
  mtgstocks: Price;
  scg: Price;
  tcgplayer: Price;
  tcgl: Price;
}

export interface Price {
  name?: string;
  rawName?: string;
  price: number;
  slug?: string;
  url?: string;
}

export interface TagLink {
  count: number;
  slug: string;
  value: string;
}

export interface RankOverTime {
  commander_count: number;
  perc_of_decks_overall: number;
  perc_of_decks_overall_ma: number;
  rank: number;
  rank_ma: number;
}

export interface ComboCount {
  value: string;
  alt: string;
  href: string;
}