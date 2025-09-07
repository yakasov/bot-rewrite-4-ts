export interface BooksResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  num_found: number;
  documentation_url: string;
  q: string;
  offset: number | null;
  docs: Book[];
}

export interface Book {
  author_key?: string[];
  author_name?: string[];
  cover_edition_key: string;
  cover_i: number;
  ebook_access: "no_ebook" | "printdisabled" | "borrowable" | "public";
  edition_count: number;
  first_publish_year: number;
  has_fulltext: boolean;
  ia?: string[];
  ia_collection_s?: string[];
  key: string;
  language: string[];
  lending_edition_s?: string;
  lending_identifier_s?: string;
  public_scan_b: boolean;
  title: string;
}

export interface Work extends RevisionHistory {
  title: string;
  key: string;
  authors: {
    author: { key: string };
    type: { key: string };
  }[];
  type: { key: string };
  description?: string | TypeValue;
  covers?: number[];
  subjects?: string[];
}

export interface TypeValue {
  type: string;
  value: string;
}

export interface WorksEditions {
  links: {
    self: string;
    work: string;
  };
  size: number;
  entries: Edition[];
}

export interface Edition extends RevisionHistory {
  works: {
    key: string;
  }[];
  title: string;
  publishers: string[];
  key: string;
  type: {
    key: string;
  };
  identifiers: Identifiers;
  covers: number[];
  isbn_13?: string[];
  isbn_10?: string[];
  oclc_numbers?: string[];
  contributors?: Contributor[];
  by_statement?: string;
  languages?: {
    key: string;
  }[];
  physical_format?: string;
  pagination?: string;
  publish_date?: string;
  source_records?: string[];
  number_of_pages?: number;
  subjects: string[];
  edition_name?: string;
  first_sentence?: TypeValue;
  series?: string[];
  classifications?: unknown;
  lc_classifications?: string[];
  physical_dimensions?: string;
  publish_places?: string[];
  publish_country?: string;
  subtitle?: string;
  local_id?: string[];
  ocaid?: string;
  translation_of?: string;
  other_titles?: string[];
  work_titles?: string[];
  contributions?: string[];
  dewey_decimal_class?: string[];
  weight?: string;
  uri_descriptions?: string[];
  uris?: string[];
  notes?: string;
}

export interface Identifiers {
  bookbrainz?: string[];
  amazon?: string[];
  goodreads?: string[];
  musicbrainz?: string[];
  librarything?: string[];
  overdrive?: string[];
  wikidata?: string[];
}

export interface Contributor {
  role: string;
  name: string;
}

export interface RevisionHistory {
  latest_revision: number;
  revision: number;
  created: TypeValue;
  last_modified: TypeValue;
}

export interface Cover {
  id: number;
  category_id: number;
  olid: string;
  filename: string;
  author: string;
  ip: string;
  source_url: string;
  source?: string;
  isbn?: string;
  created: string;
  last_modified: string;
  archived: boolean;
  failed: boolean;
  width: number;
  height: number;
  filename_s: string;
  filename_m: string;
  filename_l: string;
  isbn13?: string;
  uploaded: boolean;
  deleted: boolean;
  filename_old?: string;
}
