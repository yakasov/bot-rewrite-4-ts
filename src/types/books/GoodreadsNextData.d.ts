export interface Ref {
  __ref: string;
}

export interface NextData {
  props: Props;
  page: string;
  query: Query;
  buildId: string;
  isFallback: boolean;
  isExperimentalCompile: boolean;
  gssp: boolean;
  locales: [string];
  scriptloader: [unknown];
}

export interface Props {
  pageProps: PageProps;
  __N_SSP: boolean;
}

export interface PageProps {
  apolloState: ApolloState;
  params: Query;
  query: Query;
  jwtToken: unknown;
  dataSource: string;
  authContextParams: {
    signedIn: boolean;
    customerId: unknown;
    legacyCustomerId: unknown;
    role: string;
  };
  userAgentContextParams: {
    isWebView: unknown;
  };
  userAgent: string;
}

export interface Query {
  book_id: string;
}

export interface ApolloState {
  ROOT_QUERY: Query;
  [k: `User:${string}`]: UserHeader;
  [k: `Contributor:${string}`]: ContributorHeader;
  [k: `Book:${string}`]: BookHeader;
  [k: `Work:${string}`]: WorkHeader;
  [k: `Review:${string}`]: ReviewHeader;
}

export interface Query {
  __typename: "Query";
  getSiteHeaderBanner: SiteHeaderBanner;
  [k: `getBookByLegacyId(${string})`]: Ref;
  [k: `getPageBanner(${string})`]: PageBanner;
  [k: `getSocialSignals(${string})`]: [SocialSignal];
  getReviews: BookReviewsConnection;
}

export interface SiteHeaderBanner {
  __typename: "SiteHeaderBanner";
  altText: string;
  clickthroughUrl: string;
  desktop1xPhoto: string;
  desktop2xPhoto: string;
  mobile1xPhoto: string;
  mobile2xPhoto: string;
  siteStripColor: string;
}

export interface PageBanner {
  __typename: "PageBanner";
  type: unknown;
  message: unknown;
}

export interface SocialSignal {
  __typename: "SocialSignal";
  name: "CURRENTLY_READING" | "TO_READ";
  count: number;
  shelfPhrase: "are currently reading" | "want to read";
  userPhrase: string;
  users: [SocialSignalUserEdge];
}

export interface SocialSignalUserEdge {
  __typename: "SocialSignalUserEdge";
  node: User;
}

export interface User {
  __typename: "User";
  name: string;
  imageUrlSquare: string;
}

export interface BookReviewsConnection {
  __typename: "BookReviewsConnection";
  totalCount: number;
  edges: [BookReviewsEdge];
  pageInfo: PageInfo;
}

export interface BookReviewsEdge {
  __typename: "BookReviewsEdge";
  node: Ref;
}

export interface PageInfo {
  __typename: "PageInfo";
  prevPageToken: string;
  nextPageToken: string;
}

export interface UserHeader {
  __typename: "User";
  legacyId: number;
  viewerRelationshipStatus: unknown;
  followersCount: number;
  id: number;
}

export interface ContributorHeader {
  __typename: "Contributor";
  id: string;
  legacyId: number;
  name: string;
  description: string;
  isGrAuthor: boolean;
  works: ContributorWorksConnection;
  profileImageUrl: string;
  webUrl: string;
  viewerIsFollowing: unknown;
  followers: ContributorFollowersConnection;
  user: Ref;
}

export interface ContributorWorksConnection {
  __typename: "ContributorWorksConnection";
  totalCount: number;
}

export interface ContributorFollowersConnection {
  __typename: "ContributorFollowersConnection";
  totalCount: number;
}

export interface BookHeader {
  __typename: "Book";
  id: string;
  legacyId: number;
  webUrl: string;
  viewerShelving: unknown;
  title: string;
  titleComplete: string;
  description: string;
  [k: `description(${string})`]: string;
  primaryContributorEdge: BookContributorEdge;
  secondaryContributorEdges: [unknown];
  imageUrl: string;
  bookSeries: [unknown];
  bookGenres: [BookGenre];
  details: BookDetails;
  work: Ref;
  [k: `links(${string})`]: BookLinks;
  reviewEditUrl: string;
  featureFlags: FeatureFlags;
}

export interface BookContributorEdge {
  __typename: "BookContributorEdge";
  node: Ref;
  role: string;
}

export interface BookLinks {
  __typename: "BookLinks";
  primaryAffiliateLink: unknown;
  secondaryAffiliateLinks: [BookLink];
  libraryLinks: [unknown];
  overflowPageUrl: string;
  seriesLink: unknown;
}

export interface FeatureFlags {
  __typename: "FeatureFlags";
  hideAds: boolean;
  noIndex: boolean;
  noReviews: boolean;
  noNewRatings: boolean;
  noNewTextReviews: boolean;
}

export interface BookGenre {
  __typename: "BookGenre";
  genre: Genre;
}

export interface Genre {
  __typename: "Genre";
  name: string;
  webUrl: string;
}

export interface BookDetails {
  __typename: "BookDetails";
  asin: unknown;
  format: string;
  numPages: number;
  publicationTime: number;
  publisher: string;
  isbn: unknown;
  isbn13: unknown;
  language: Language;
}

export interface Language {
  __typename: "Language";
  name: string;
}

export interface BookLink {
  __typename: "BookLink";
  name: string;
  url: string;
  ref: string;
}

export interface WorkHeader {
  __typename: "Work";
  id: string;
  legacyId: number;
  bestBook: Ref;
  choiceAwards: [unknown];
  details: WorkDetails;
}

export interface WorkDetails {
  __typename: "WorkDetails";
  webUrl: string;
  shelvesUrl: string;
  publicationTime: number;
  originalTitle: string;
  awardsWon: [Award];
  places: [unknown];
  characters: [Character];
  stats: BookOrWorkStats;
  [k: `quotes(${string})`]: ResourceQuotesConnection;
  [k: `questions(${string})`]: ResourceQuestionsConnection;
  [k: `topics(${string})`]: ResourceTopicsConnection;
  viewerShelvings: unknown;
  viewerShelvingsUrl: string;
  featuredKNH: FeaturedKNHCollectionConnection;
  giveaways: unknown;
  editions: BooksConnection;
}

export interface Award {
  __typename: "Award";
  name: string;
  webUrl: string;
  awardedAt: number;
  category: string;
  designation: string;
}

export interface Character {
  __typename: "Character";
  name: string;
  webUrl: string;
}

export interface BookOrWorkStats {
  __typename: "BookOrWorkStats";
  averageRating: number;
  ratingsCounts: number;
  ratingsCountDist: [number];
  textReviewsCount: number;
  textReviewsLanguageCounts: [TextReviewLanguageCount];
}

export interface ResourceQuotesConnection {
  __typename: "ResourceQuotesConnection";
  webUrl: string;
  totalCount: number;
}

export interface ResourceQuestionsConnection {
  __typename: "ResourceQuestionsConnection";
  totalCount: number;
  webUrl: string;
}

export interface ResourceTopicsConnection {
  __typename: "ResourceTopicsConnection";
  webUrl: string;
  totalCount: number;
}

export interface FeaturedKNHCollectionConnection {
  __typename: "FeaturedKNHCollectionConnection";
  totalCount: number;
  edges: [unknown];
}

export interface BooksConnection {
  __typename: "BooksConnection";
  webUrl: string;
}

export interface TextReviewLanguageCount {
  __typename: "TextReviewLanguageCount";
  count: number;
  isoLanaugeCode: string;
}

export interface ReviewHeader {
  __typename: "Review";
  id: string;
  creator: Ref;
  recommendFor: string;
  updatedAt: number;
  createdAt: number;
  spoilerStatus: boolean;
  lastRevisionAt: number;
  text: string;
  rating: number;
  shelving: Shelving;
  likeCount: number;
  viewerHasLiked: unknown;
  commentCount: number;
}

export interface Shelving {
  __typename: "Shelving";
  shelf: Shelf;
  taggings: [unknown];
  webUrl: string;
}

export interface Shelf {
  __typename: "Shelf";
  name: string;
  displayname: string;
  editable: boolean;
  default: boolean;
  actionType: unknown;
  sortOrder: unknown;
  webUrl: string;
}
