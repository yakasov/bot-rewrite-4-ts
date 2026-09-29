/** Used for tracking chances of responses being sent. */
export interface ChanceResponse {
  /** The cumulative chance, i.e the total of the responses before this one in the table. */
  chance: number;

  /** The actual response. */
  string: string;

  /** Whether to use .reply() or .react() */
  type: "message" | "reaction";

  /** User ID for when the response only works for a specific user. */
  targetUserId?: string;
}
