export function wrapCodeBlockString(string: string, syntax: string = "") {
  return `\`\`\`${syntax}\n${string}\n\`\`\``;
}
