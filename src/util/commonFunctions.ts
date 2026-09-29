/**
 * Prepares a string for the markdown code block syntax.
 * 
 * @param string - input string
 * @param syntax - optional language (eg ts, js)
 * @returns The formatted, wrapped string.
 */
export function wrapCodeBlockString(string: unknown, syntax = "") {
  return `\`\`\`${syntax}\n${string}\n\`\`\``;
}
