import { EmbedBuilder, Message } from "discord.js";
import { isSendableChannel } from "../util/typeGuards";
import {
  MOVIES_IMAGES_BASE_URL,
  MOVIES_IMDB_BASE_URL,
  REGEX_MOVIES_PATTERN,
} from "../consts/constants";
import {
  GenreCode,
  GenresResponse,
  Movie,
  MovieItem,
  Person,
  PersonItem,
  SearchMultiSearchResponse,
  TMDB,
  TVEpisode,
  TVSeason,
  TVShow,
  TVShowItem,
} from "@leandrowkz/tmdb";
import { KEYS } from "../keys";
import { getRTRating } from "./rottenTomatoesScores";

interface Genres {
  movie: GenresResponse | undefined;
  tv: GenresResponse | undefined;
}

const tmdb = new TMDB({ apiKey: KEYS.TMDB_TOKEN ?? "" });
const GENRES: Genres = {
  movie: undefined,
  tv: undefined,  
};

function isMovieItem(
  item: MovieItem | TVShowItem | PersonItem
): item is MovieItem {
  return "title" in item && "release_date" in item;
}

function isTVShowItem(
  item: MovieItem | TVShowItem | PersonItem
): item is TVShowItem {
  return "name" in item && "first_air_date" in item;
}

function isPersonItem(
  item: MovieItem | TVShowItem | PersonItem
): item is PersonItem {
  return "known_for_department" in item;
}

async function initialiseGenres(): Promise<void> {
  if (!GENRES.movie) {
    GENRES.movie = await tmdb.genres.movie();
    GENRES.tv = await tmdb.genres.tv();
  }
}

function prettifyGenres(
  genres: GenresResponse | undefined,
  ids: GenreCode[] | undefined
): string {
  if (!genres || !ids) return "Unknown";
  return ids.map((i) => genres.genres.find((g) => g.id === i)?.name).join(", ");
}

/**
 * Handles TMDB invocation and subsequent functions.
 * 
 * @param message 
 */
export async function movieInvoke(message: Message): Promise<void> {
  if (!isSendableChannel(message.channel) ||!KEYS.TMDB_TOKEN) return;
  initialiseGenres();

  const promises: Promise<void>[] = [];
  let match: RegExpMatchArray | null = null;

  while ((match = REGEX_MOVIES_PATTERN.exec(message.content)) !== null) {
    const query: string | undefined = match.groups?.query?.trim();
    const season: string | undefined = match.groups?.season?.trim();
    const episode: string | undefined = match.groups?.episode?.trim();

    if (!query) continue;

    promises.push(querySearch(message, query, season, episode));
  }

  await Promise.all(promises);
}

/**
 * Performs a general TMDB search for a piece of media, where we don't know the result type yet. Delegates to different functions for different replies.
 * 
 * @param message 
 * @param query - the input string
 * @param season - if a season has been specified and the result is a TV Show, it will research using this season
 * @param episode - if an episode has been specified and the result is a TV Show, it will research using this episode
 */
async function querySearch(
  message: Message,
  query: string,
  season: string | undefined,
  episode: string | undefined
): Promise<void> {
  const replyMessage: Message = await message.reply(`Fetching ${query}...`);

  const searchResults: SearchMultiSearchResponse =
    await tmdb.search.multiSearch({
      query: query,
    });
  const topResult: MovieItem | TVShowItem | PersonItem | undefined =
    searchResults.results[0];

  if (topResult) {
    if (isMovieItem(topResult)) {
      await handleMovieResult(replyMessage, topResult);
      return;
    } else if (isTVShowItem(topResult)) {
      await handleTVShowResult(replyMessage, topResult, season, episode);
      return;
    } else if (isPersonItem(topResult)) {
      await handlePersonResult(replyMessage, topResult);
      return;
    }
  }

  await replyMessage.edit("No results, wha");
}

/**
 * Creates an embed for movie results from TMDB.
 * 
 * @param replyMessage - the fetching message the bot sent before querying
 * @param item - the movie item from TMDB
 */
async function handleMovieResult(
  replyMessage: Message,
  item: MovieItem
): Promise<void> {
  const imageUrl = `${MOVIES_IMAGES_BASE_URL}${item.poster_path}`;
  const genres: string = prettifyGenres(GENRES.movie, item.genre_ids);
  const [RTRatings, url] = await Promise.all([
    getRTRating(item.title, false),
    getIMDBURL(async () => tmdb.movies.details(item.id), "title"),
  ]);
  const ratings = `${item.vote_average} / 10.0 (${item.vote_count} ratings)\n${RTRatings}`;

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(item.title)
    .setDescription(item.overview)
    .setImage(imageUrl)
    .setURL(url)
    .addFields(
      {
        name: "Genres",
        value: genres,
      },
      {
        name: "Ratings",
        value: ratings,
      }
    );

  await replyMessage.edit({
    content: null,
    embeds: [embed],
  });
}

/**
 * Creates an embed for TV Show results from TMDB.
 * 
 * @param replyMessage - the fetching message the bot sent before querying
 * @param item - the TV Show item from TMDB
 */
async function handleTVShowResult(
  replyMessage: Message,
  item: TVShowItem,
  season: string | undefined,
  episode: string | undefined
): Promise<void> {
  if (season) {
    if (episode) {
      const episodeResult: TVEpisode = await tmdb.tvEpisodes.details(
        item.id,
        parseInt(season),
        parseInt(episode)
      );
      await handleTVEpisodeResult(replyMessage, episodeResult);
      return;
    }

    const seasonResult: TVSeason = await tmdb.tvSeasons.details(
      item.id,
      parseInt(season)
    );
    await handleTVSeasonResult(replyMessage, seasonResult);
    return;
  }

  const imageUrl = `${MOVIES_IMAGES_BASE_URL}${item.poster_path}`;
  const genres: string = prettifyGenres(GENRES.tv, item.genre_ids);
  const [RTRatings, url] = await Promise.all([
    getRTRating(item.name, true),
    getIMDBURL(async () => tmdb.tvShows.details(item.id), "title"),
  ]);
  const ratings = `${item.vote_average} / 10.0 (${item.vote_count} ratings)\n${RTRatings}`;
  const footer = `Released on ${item.first_air_date}`;

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(item.name)
    .setDescription(item.overview)
    .setImage(imageUrl)
    .setURL(url)
    .addFields(
      {
        name: "Genres",
        value: genres,
      },
      {
        name: "Ratings",
        value: ratings,
      }
    )
    .setFooter({ text: footer });

  await replyMessage.edit({
    content: null,
    embeds: [embed],
  });
}

/**
 * Creates an embed for TV Season results from TMDB.
 * 
 * @param replyMessage - the fetching message the bot sent before querying
 * @param item - the TV Season item from TMDB
 */
async function handleTVSeasonResult(
  replyMessage: Message,
  item: TVSeason
): Promise<void> {
  const imageUrl = `${MOVIES_IMAGES_BASE_URL}${item.poster_path}`;
  const footer = `Season ${item.season_number}, ${item.episodes.length} episodes\nAired on ${item.air_date}`;

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(item.name)
    .setDescription(item.overview)
    .setImage(imageUrl)
    .setFooter({ text: footer });

  await replyMessage.edit({
    content: null,
    embeds: [embed],
  });
}

/**
 * Creates an embed for TV Episode results from TMDB.
 * 
 * @param replyMessage - the fetching message the bot sent before querying
 * @param item - the TV Episode item from TMDB
 */
async function handleTVEpisodeResult(
  replyMessage: Message,
  item: TVEpisode
): Promise<void> {
  const imageUrl = `${MOVIES_IMAGES_BASE_URL}${item.still_path}`;
  const footer = `Season ${item.season_number}, Episode ${item.episode_number}\nAired on ${item.air_date}`;

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(item.name)
    .setDescription(item.overview)
    .setImage(imageUrl)
    .addFields({
      name: "Guest Stars",
      value: item.guest_stars.map((s) => s.name).join(", "),
    })
    .setFooter({ text: footer });

  await replyMessage.edit({
    content: null,
    embeds: [embed],
  });
}

/**
 * Creates an embed for people results from TMDB.
 * 
 * @param replyMessage - the fetching message the bot sent before querying
 * @param item - the Person item from TMDB
 */
async function handlePersonResult(
  replyMessage: Message,
  item: PersonItem
): Promise<void> {
  const imageUrl = `${MOVIES_IMAGES_BASE_URL}${item.profile_path}`;
  const url = await getIMDBURL(
    async () => tmdb.people.details(item.id),
    "name"
  );

  let knownFor = "N/A";
  if (item.known_for) {
    knownFor = (item.known_for as unknown as (MovieItem | TVShowItem)[])
      .map((i) => (isMovieItem(i) ? i.title : i.name))
      .join(", ");
  }

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(item.name)
    .setImage(imageUrl)
    .setURL(url)
    .addFields(
      // Because PersonItem is Pick<Person, ...> it doesn't know known_for_department is actually on PersonItem
      {
        name: "Department",
        value: (item as Person).known_for_department,
      },
      {
        name: "Known For",
        value: knownFor,
      }
    );

  await replyMessage.edit({
    content: null,
    embeds: [embed],
  });
}

/**
 * Get an IMDB URL based on the type of object provided.
 * 
 * @param searchFunc - the logic to use when finding the URL on an object
 * @param type - the key of the URL
 * @returns 
 */
async function getIMDBURL(
  searchFunc: () => Promise<Movie | Person | TVShow>,
  type: string
): Promise<string> {
  const item = await searchFunc();

  if ("seasons" in item) {
    return item.homepage ?? MOVIES_IMDB_BASE_URL;
  }

  return `${MOVIES_IMDB_BASE_URL}${type}/${item.imdb_id}`;
}
