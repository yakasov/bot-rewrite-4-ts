import { Message, SlashCommandBuilder } from "discord.js";

declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, Command>
    }

    export interface Command {
        data: SlashCommandBuilder,
        execute: (interaction: Interaction) => Promise<any> | any
    }
}