/* eslint-disable @typescript-eslint/no-non-null-assertion */

import HTMLParser, { HTMLElement } from "node-html-parser";
import { URL_DEADLOCK_FORUM } from "../consts/constants";
import { BotContext } from "../types/BotContext";
import { Guild, TextChannel } from "discord.js";

interface ATag extends HTMLElement {
  href: string;
}

let lastUrl: string | null = null;

export async function checkDeadlockChangelog(
  context: BotContext
): Promise<void> {
  const profileText: string = await fetch(URL_DEADLOCK_FORUM).then(
    (response: Response) => response.text()
  );
  const parsedHTML: HTMLElement = HTMLParser(profileText);
  const lastPost: HTMLElement | null = parsedHTML.querySelector(".contentRow");

  if (!lastPost) {
    console.warn("Last Deadlock fetch was seemingly unsuccessful!");
    return;
  }

  const aTag: ATag = (lastPost.querySelector("h3 > a") as ATag);
  const postKey: string = aTag.href.split("#")[1];

  if (!aTag.innerText.includes("Update")) return;

  if (lastUrl !== aTag.href) {
    if (!lastUrl) {
      lastUrl = aTag.href;
      return;
    }

    const postText: string = await fetch(aTag.href).then(
      (response: Response) => response.text()
    );
    const parsedPostText: HTMLElement = HTMLParser(postText);
    const lastUpdate: HTMLElement = parsedPostText.querySelector(
      `article[data-content=${postKey}]`
    )!;
    const lastUpdateContent: string = lastUpdate.querySelector(".bbWrapper")!.innerText;

    const guild: Guild = await context.client.guilds.fetch(
      context.config.ids.mainGuild
    );

    if (!guild) {
      console.error(`Guild not found with ID: ${context.config.ids.mainGuild}`);
      return;
    }

    const deadlockChannel: TextChannel | null = (await guild.channels.fetch(
      "271381095990296576"
    )) as TextChannel | null;

    if (!deadlockChannel || !deadlockChannel.isTextBased()) {
      console.error(
        `Deadlock channel not found or not text-based in guild ${guild.id} (${guild.name})`
      );
      return;
    }

    await deadlockChannel.send(`# NEW POST\n${lastUpdateContent}`);
  }
}
