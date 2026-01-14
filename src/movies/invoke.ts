import { EmbedBuilder, Message } from "discord.js";
import { isSendableChannel } from "../util/typeGuards";
import {
  MOVIES_IMAGES_BASE_URL,
  REGEX_MOVIES_PATTERN,
} from "../consts/constants";
import {
  GenreCode,
  GenresResponse,
  MovieItem,
  PersonItem,
  SearchMultiSearchResponse,
  TMDB,
  TVEpisode,
  TVSeason,
  TVShowItem,
} from "@leandrowkz/tmdb";
import { KEYS } from "../keys";

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

export async function movieInvoke(message: Message): Promise<void> {
  if (!isSendableChannel(message.channel)) return;

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

async function handleMovieResult(
  replyMessage: Message,
  item: MovieItem
): Promise<void> {
  const imageUrl = `${MOVIES_IMAGES_BASE_URL}${item.poster_path}`;
  const genres: string = prettifyGenres(GENRES.movie, item.genre_ids);
  const ratings = `${item.vote_average} / 10.0 (${item.vote_count} ratings)`;

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(item.title)
    .setDescription(item.overview)
    .setImage(imageUrl)
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
  const ratings = `${item.vote_average} / 10.0 (${item.vote_count} ratings)`;
  const footer = `Released on ${item.first_air_date}`;

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(item.name)
    .setDescription(item.overview)
    .setImage(imageUrl)
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

async function handlePersonResult(
  replyMessage: Message,
  item: PersonItem
): Promise<void> {
  console.log(item);
  const imageUrl = `${MOVIES_IMAGES_BASE_URL}${item.profile_path}`;
  const knownFor: string = (item.known_for as unknown as any[])
    .map((i) => (isMovieItem(i) ? i.title : i.name))
    .join(", ");

  const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle(item.name)
    .setImage(imageUrl)
    .addFields(
      {
        name: "Department",
        value: (item as any).known_for_department,
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
