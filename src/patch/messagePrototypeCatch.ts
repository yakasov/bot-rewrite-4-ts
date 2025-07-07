import {
  Message,
  MessagePayload,
  MessageReplyOptions,
  OmitPartialGroupDMChannel,
} from "discord.js";

export function messagePrototypeCatch() {
  const superReply = Message.prototype.reply;
  const superDelete = Message.prototype.delete;

  Message.prototype.reply = function (
    this: Message,
    options: string | MessagePayload | MessageReplyOptions
  ): Promise<OmitPartialGroupDMChannel<Message<any>>> {
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

      return superReply.call(this, {
        ...options,
        failIfNotExists: false,
      });
    } catch (err: any) {
      console.error(err?.message);
      return Promise.reject(err);
    }
  };

  Message.prototype.delete = function (
    this: Message
  ): Promise<OmitPartialGroupDMChannel<Message<any>>> {
    try {
      return superDelete.call(this);
    } catch (err: any) {
      console.error(err?.message);
      return Promise.reject(err);
    }
  };
}
