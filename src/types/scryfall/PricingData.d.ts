/**
 * The lowest and highest priced printing set and set URL for any given card.
 */
export interface PricingData {
  highestPrice: number;
  highestSet: string;
  highestUrl: string;
  lowestPrice: number;
  lowestSet: string;
  lowestUrl: string;
}
