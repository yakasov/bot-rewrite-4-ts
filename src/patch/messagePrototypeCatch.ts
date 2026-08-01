import {
  Message,
  MessagePayload,
  MessageReplyOptions,
  OmitPartialGroupDMChannel,
} from "discord.js";

/**
 * Adds try/catch to Message.reply and Message.delete.
 * Without this, the bot will fully crash if these fail.
 * In this instance, an error will be spit out and the bot will continue.
 */
export function messagePrototypeCatch(): void {
  const superReply = Message.prototype.reply;
  const superDelete = Message.prototype.delete;

  Message.prototype.reply = async function (
    this: Message,
    options: string | MessagePayload | MessageReplyOptions
  ): Promise<OmitPartialGroupDMChannel<Message<boolean>>> {
    try {
      if (typeof options === "string") {
        return superReply.call(this, {
          content: options,
          failIfNotExists: false,
        });
      }

      if (options instanceof MessagePayload) {
        return superReply.call(this, options);
      }

      return await superReply.call(this, {
        ...options,
        failIfNotExists: false,
      });
    } catch (err: unknown) {
      console.error(err);
      return Promise.reject(err);
    }
  };

  Message.prototype.delete = async function (
    this: Message
  ): Promise<OmitPartialGroupDMChannel<Message<boolean>>> {
    try {
      return await superDelete.call(this);
    } catch (err: unknown) {
      console.error(err);
      return Promise.reject(err);
    }
  };
}
