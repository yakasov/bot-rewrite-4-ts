export namespace OpenLibraryTypes {
  export interface Response {
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
    author_key: string[];
    author_name: string[];
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

  export interface Work {
    title: string;
    key: string;
    authors: {
      author: { key: string };
      type: { key: string };
    }[];
    type: { key: string };
    description?: string | {
      type: string;
      value: string;
    };
    covers?: number[];
    subjects?: string[];
    latest_revision: number;
    revision: number;
    created: {
      type: string;
      value: string;
    };
    last_modified: {
      type: string;
      value: string;
    }
  }
}