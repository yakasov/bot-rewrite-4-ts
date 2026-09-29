/* eslint-disable */

import { SlashCommandBuilder } from "discord.js";

/** 
 * This is an override to some discord.js types to allow for better compatibility.
 * 
 * Specifically, it exposes commands as a Collection on Client, and also defines what a Command is.
 */
declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, Command>
    }

    export interface Command {
        data: SlashCommandBuilder,
        execute: (interaction: ChatInputCommandInteraction, context?: BotContext) => Promise<any> | any;
    }
}