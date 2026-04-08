import HTMLParser, { HTMLElement } from "node-html-parser";
import { MOVIES_RT_BASE_URL } from "../consts/constants";

async function getRTPage(
  query: string,
  isTVShow: boolean
): Promise<HTMLElement> {
  const sanitisedQuery = query.replace(/[^a-z0-9\s]/gi, "").replace(/\s/g, "_");
  const url = `${MOVIES_RT_BASE_URL}/${isTVShow ? "tv" : "m"}/${sanitisedQuery}`;
  const resultsText: string = await fetch(url).then((response: Response) =>
    response.text()
  );
  return HTMLParser(resultsText);
}

export async function getRTRating(
  query: string,
  isTVShow: boolean
): Promise<string> {
  const parsedHTML: HTMLElement = await getRTPage(query, isTVShow);

  let audienceScore: string | undefined = parsedHTML.querySelector(
    "[slot='audience-score']"
  )?.textContent;
  let criticsScore: string | undefined = parsedHTML.querySelector(
    "[slot='critics-score']"
  )?.textContent;

  if (!audienceScore || audienceScore.length === 0) audienceScore = "--";
  if (!criticsScore || criticsScore.length === 0) criticsScore = "--";

  if (audienceScore.concat(criticsScore) === "----") return "";
  return `RT Critics: ${criticsScore} | RT Audience: ${audienceScore}`;
}
