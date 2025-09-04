export interface BooksResponse {
  kind: string;
  totalItems: number;
  items: Book[];
}

export interface Book {
  kind: string;
  id: string;
  etag: string;
  selfLike: string;
  volumeInfo?: VolumeInfo;
  saleInfo?: SaleInfo;
  accessInfo?: AccessInfo;
  searchInfo?: SearchInfo;
}

export interface VolumeInfo {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers: Identifier[];
  readingModes?: ReadingModes;
  pageCount: number;
  dimensions?: Dimensions;
  printType: string;
  maturityRating: "MATURE" | "NOT_MATURE";
  allowAnonLogging: boolean;
  mainCategory?: string;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  contentVersion: string;
  panelizationSummary: PanelizationSummary;
  imageLinks: ImageLinks;
  language: string;
  previewLink: string;
  infoLink: string;
  canonicalVolumeLink: string;
}

export interface Identifier {
  type: string;
  identifier: string;
}

export interface ReadingModes {
  text?: boolean;
  image?: boolean;
}

export interface Dimensions {
  height?: string;
  width?: string;
  thickness?: string;
}

export interface ImageLinks {
  smallThumbnail?: string;
  thumbnail: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

export interface PanelizationSummary {
  containsEpubBubbles?: boolean;
  containsImageBubbles?: boolean;
}

export interface SaleInfo {
  country: string;
  saleability: "FOR_SALE" | "NOT_FOR_SALE";
  isEbook: boolean;
  listPrice?: Price;
  retailPrice?: Price;
  buyLink?: string;
}

export interface Price {
  amount?: number;
  currencyCode?: string;
}

export interface AccessInfo {
  country: string;
  viewability: "NO_PAGES" | "PARTIAL" | "FULL";
  embeddable: boolean;
  publicDomain: boolean;
  textToSpeechPermissions: "ALLOWED_FOR_ACCESSIBILITY" | "ALLOWED" | string;
  epub: DocumentAccess;
  pdf: DocumentAccess;
  webReaderLink: string;
  accessViewStatus: "NONE" | "SAMPLE" | string;
  quoteSharingAllowed: boolean;
}

export interface DocumentAccess {
  isAvailable: boolean;
  acsTokenLink?: string;
}

export interface SearchInfo {
  textSnippet?: string;
}
