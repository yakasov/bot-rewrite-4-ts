import HTMLParser, { HTMLElement } from "node-html-parser";
import { URL_DEADLOCK_FORUM, URL_DEADLOCK_YOSHI } from "../consts/constants";
import { BotContext } from "../types/BotContext";
import { Guild, TextChannel } from "discord.js";

type nHTMLElement = HTMLElement | null | undefined;

let lastUrl: string | null = null;

export async function checkDeadlockForum(context: BotContext): Promise<void> {
  const profileText: string = await fetch(URL_DEADLOCK_YOSHI).then(
    (response: Response) => response.text()
  );
  const parsedHTML: HTMLElement = HTMLParser(profileText);
  const lastPost: nHTMLElement = parsedHTML.querySelector(".contentRow");

  if (!lastPost) {
    console.warn("Last Deadlock fetch was seemingly unsuccessful!");
    return;
  }

  const aTag: nHTMLElement = lastPost.querySelector("h3 > a");

  if (!aTag) return;

  const href: string = aTag.rawAttrs.replace('href="', "").replace('"', "");
  const postKey: string = href.split("/")[3];

  if (!aTag.innerText.includes("Update")) return;

  if (lastUrl !== href) {
    // Don't post on reboot
    if (!lastUrl) {
      lastUrl = href;
      return;
    }

    const postText: string = await fetch(URL_DEADLOCK_FORUM + href).then(
      (response: Response) => response.text()
    );
    const parsedPostText: HTMLElement = HTMLParser(postText);
    const lastUpdate: nHTMLElement = parsedPostText.querySelector(
      `article[data-content=${postKey}]`
    );

    const lastUpdateWrapper: nHTMLElement =
      lastUpdate?.querySelector(".bbWrapper");

    let lastUpdateContent;
    const codeBlock: nHTMLElement =
      lastUpdateWrapper?.querySelector(".bbCodeBlock");
    if (codeBlock) {
      lastUpdateContent = codeBlock.attributes["data-url"];
    } else {
      lastUpdateContent = lastUpdateWrapper?.innerText;
    }

    if (!lastUpdateContent) return;

    const guild: Guild = await context.client.guilds.fetch(
      context.config.ids.mainGuild
    );

    if (!guild) {
      console.error(`Guild not found with ID: ${context.config.ids.mainGuild}`);
      return;
    }

    const deadlockChannel: TextChannel | null = (await guild.channels.fetch(
      "1507294074158190692"
    )) as TextChannel | null;

    if (!deadlockChannel || !deadlockChannel.isTextBased()) {
      console.error(
        `Deadlock channel not found or not text-based in guild ${guild.id} (${guild.name})`
      );
      return;
    }

    await deadlockChannel.send(`# NEW YOSHI POST\n${lastUpdateContent}`);
  }

  lastUrl = href;
}
