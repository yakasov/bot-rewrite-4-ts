import { Card } from "yakasov-scryfall-api";

export interface OracleResponse {
  object: string;
  total_cards: number;
  has_more: boolean;
  data: Card[];
}