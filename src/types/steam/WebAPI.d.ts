export interface WebAPIResponse<T> {
  response: T;
}

export interface ResolveVanityURL {
  steamid?: string;
  success: 0 | 1;
}