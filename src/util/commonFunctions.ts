export function wrapCodeBlockString(string: string, syntax = "") {
  return `\`\`\`${syntax}\n${string}\n\`\`\``;
}
