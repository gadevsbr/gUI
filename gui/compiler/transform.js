import { readAttributeContext } from "../rendering/templateCompiler.js";

const DEFAULT_TAGS = ["html"];
const PREFIX_KEYWORDS = new Set([
  "await",
  "case",
  "delete",
  "else",
  "in",
  "instanceof",
  "new",
  "return",
  "throw",
  "typeof",
  "void",
  "yield",
]);
const WRAP_BLOCKING_KEYWORDS = new Set(["await", "yield"]);

function isWhitespace(char) {
  return char === " " || char === "\n" || char === "\r" || char === "\t" || char === "\f";
}

function isDigit(char) {
  return char >= "0" && char <= "9";
}

function isIdentifierStart(char) {
  return (
    (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z") ||
    char === "_" ||
    char === "$"
  );
}

function isIdentifierPart(char) {
  return isIdentifierStart(char) || isDigit(char);
}

function createSyntaxError(message, source, index, id) {
  const line = source.slice(0, index).split("\n").length;
  const column = index - source.lastIndexOf("\n", index - 1);
  const location = id ? `${id}:${line}:${column}` : `${line}:${column}`;
  return new SyntaxError(`[gUI compiler] ${message} at ${location}.`);
}

function consumeLineComment(source, start) {
  let index = start + 2;

  while (index < source.length && source[index] !== "\n") {
    index += 1;
  }

  return index;
}

function consumeBlockComment(source, start, id) {
  const end = source.indexOf("*/", start + 2);

  if (end === -1) {
    throw createSyntaxError("Unterminated block comment", source, start, id);
  }

  return end + 2;
}

function consumeStringLiteral(source, start, id) {
  const quote = source[start];
  let index = start + 1;

  while (index < source.length) {
    const char = source[index];

    if (char === "\\") {
      index += 2;
      continue;
    }

    if (char === quote) {
      return index + 1;
    }

    index += 1;
  }

  throw createSyntaxError("Unterminated string literal", source, start, id);
}

function consumeNumberLiteral(source, start) {
  let index = start;

  while (index < source.length) {
    const char = source[index];

    if (isDigit(char) || char === "_" || char === "." || /[a-fA-FxXoObBeE]/.test(char)) {
      index += 1;
      continue;
    }

    break;
  }

  return index;
}

function consumeIdentifier(source, start) {
  let index = start + 1;

  while (index < source.length && isIdentifierPart(source[index])) {
    index += 1;
  }

  return index;
}

function canStartRegex(previousTokenType) {
  return previousTokenType !== "value";
}

function consumeRegexLiteral(source, start, id) {
  let index = start + 1;
  let inCharacterClass = false;

  while (index < source.length) {
    const char = source[index];

    if (char === "\\") {
      index += 2;
      continue;
    }

    if (char === "[" && !inCharacterClass) {
      inCharacterClass = true;
      index += 1;
      continue;
    }

    if (char === "]" && inCharacterClass) {
      inCharacterClass = false;
      index += 1;
      continue;
    }

    if (char === "/" && !inCharacterClass) {
      index += 1;

      while (index < source.length && /[a-z]/i.test(source[index])) {
        index += 1;
      }

      return index;
    }

    index += 1;
  }

  throw createSyntaxError("Unterminated regular expression literal", source, start, id);
}

function consumeTemplateLiteral(source, start, id, collect = false) {
  const quasis = collect ? [] : null;
  const expressions = collect ? [] : null;
  let chunkStart = start + 1;
  let index = start + 1;

  while (index < source.length) {
    const char = source[index];

    if (char === "\\") {
      index += 2;
      continue;
    }

    if (char === "`") {
      if (collect) {
        quasis.push(source.slice(chunkStart, index));
      }

      return {
        end: index + 1,
        quasis,
        expressions,
      };
    }

    if (char === "$" && source[index + 1] === "{") {
      if (collect) {
        quasis.push(source.slice(chunkStart, index));
      }

      const expression = consumeExpression(source, index + 2, id);

      if (collect) {
        expressions.push(expression.code);
      }

      index = expression.end;
      chunkStart = index;
      continue;
    }

    index += 1;
  }

  throw createSyntaxError("Unterminated template literal", source, start, id);
}

function consumeExpression(source, start, id) {
  let index = start;
  let depth = 1;
  let previousTokenType = "prefix";

  while (index < source.length) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (isWhitespace(char)) {
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      index = consumeLineComment(source, index);
      continue;
    }

    if (char === "/" && nextChar === "*") {
      index = consumeBlockComment(source, index, id);
      continue;
    }

    if (char === "'" || char === "\"") {
      index = consumeStringLiteral(source, index, id);
      previousTokenType = "value";
      continue;
    }

    if (char === "`") {
      index = consumeTemplateLiteral(source, index, id).end;
      previousTokenType = "value";
      continue;
    }

    if (char === "/" && canStartRegex(previousTokenType)) {
      index = consumeRegexLiteral(source, index, id);
      previousTokenType = "value";
      continue;
    }

    if (isIdentifierStart(char)) {
      const end = consumeIdentifier(source, index);
      const word = source.slice(index, end);

      previousTokenType = PREFIX_KEYWORDS.has(word) ? "prefix" : "value";
      index = end;
      continue;
    }

    if (isDigit(char)) {
      index = consumeNumberLiteral(source, index);
      previousTokenType = "value";
      continue;
    }

    if (char === "{") {
      depth += 1;
      previousTokenType = "prefix";
      index += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return {
          code: source.slice(start, index),
          end: index + 1,
        };
      }

      previousTokenType = "value";
      index += 1;
      continue;
    }

    if (char === ")" || char === "]") {
      previousTokenType = "value";
      index += 1;
      continue;
    }

    if (
      char === "(" ||
      char === "[" ||
      char === "," ||
      char === ":" ||
      char === ";" ||
      char === "?" ||
      char === "~"
    ) {
      previousTokenType = "prefix";
      index += 1;
      continue;
    }

    if (source.startsWith("=>", index)) {
      previousTokenType = "prefix";
      index += 2;
      continue;
    }

    if (source.startsWith("?.", index)) {
      previousTokenType = "value";
      index += 2;
      continue;
    }

    if (source.startsWith("++", index) || source.startsWith("--", index)) {
      index += 2;
      continue;
    }

    previousTokenType = "prefix";
    index += 1;
  }

  throw createSyntaxError("Unterminated template expression", source, start, id);
}

function skipWhitespaceAndComments(source, start, id) {
  let index = start;

  while (index < source.length) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (isWhitespace(char)) {
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      index = consumeLineComment(source, index);
      continue;
    }

    if (char === "/" && nextChar === "*") {
      index = consumeBlockComment(source, index, id);
      continue;
    }

    break;
  }

  return index;
}

function findNextTaggedTemplate(source, start, tags, id) {
  let index = start;
  let previousTokenType = "prefix";

  while (index < source.length) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (isWhitespace(char)) {
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      index = consumeLineComment(source, index);
      continue;
    }

    if (char === "/" && nextChar === "*") {
      index = consumeBlockComment(source, index, id);
      continue;
    }

    if (char === "'" || char === "\"") {
      index = consumeStringLiteral(source, index, id);
      previousTokenType = "value";
      continue;
    }

    if (char === "`") {
      index = consumeTemplateLiteral(source, index, id).end;
      previousTokenType = "value";
      continue;
    }

    if (char === "/" && canStartRegex(previousTokenType)) {
      index = consumeRegexLiteral(source, index, id);
      previousTokenType = "value";
      continue;
    }

    if (isIdentifierStart(char)) {
      const end = consumeIdentifier(source, index);
      const identifier = source.slice(index, end);

      if (tags.has(identifier)) {
        const templateStart = skipWhitespaceAndComments(source, end, id);

        if (source[templateStart] === "`") {
          return {
            templateStart,
          };
        }
      }

      previousTokenType = PREFIX_KEYWORDS.has(identifier) ? "prefix" : "value";
      index = end;
      continue;
    }

    if (isDigit(char)) {
      index = consumeNumberLiteral(source, index);
      previousTokenType = "value";
      continue;
    }

    if (char === ")" || char === "]" || char === "}") {
      previousTokenType = "value";
      index += 1;
      continue;
    }

    previousTokenType = "prefix";
    index += 1;
  }

  return null;
}

function hasTopLevelSequence(source, sequence) {
  let index = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  let previousTokenType = "prefix";

  while (index < source.length) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (isWhitespace(char)) {
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      index = consumeLineComment(source, index);
      continue;
    }

    if (char === "/" && nextChar === "*") {
      index = consumeBlockComment(source, index);
      continue;
    }

    if (char === "'" || char === "\"") {
      index = consumeStringLiteral(source, index);
      previousTokenType = "value";
      continue;
    }

    if (char === "`") {
      index = consumeTemplateLiteral(source, index).end;
      previousTokenType = "value";
      continue;
    }

    if (char === "/" && canStartRegex(previousTokenType)) {
      index = consumeRegexLiteral(source, index);
      previousTokenType = "value";
      continue;
    }

    if (braceDepth === 0 && bracketDepth === 0 && parenDepth === 0 && source.startsWith(sequence, index)) {
      return true;
    }

    if (isIdentifierStart(char)) {
      const end = consumeIdentifier(source, index);
      const word = source.slice(index, end);

      previousTokenType = PREFIX_KEYWORDS.has(word) ? "prefix" : "value";
      index = end;
      continue;
    }

    if (isDigit(char)) {
      index = consumeNumberLiteral(source, index);
      previousTokenType = "value";
      continue;
    }

    if (char === "{") {
      braceDepth += 1;
      previousTokenType = "prefix";
      index += 1;
      continue;
    }

    if (char === "}") {
      braceDepth -= 1;
      previousTokenType = "value";
      index += 1;
      continue;
    }

    if (char === "[") {
      bracketDepth += 1;
      previousTokenType = "prefix";
      index += 1;
      continue;
    }

    if (char === "]") {
      bracketDepth -= 1;
      previousTokenType = "value";
      index += 1;
      continue;
    }

    if (char === "(") {
      parenDepth += 1;
      previousTokenType = "prefix";
      index += 1;
      continue;
    }

    if (char === ")") {
      parenDepth -= 1;
      previousTokenType = "value";
      index += 1;
      continue;
    }

    if (source.startsWith("?.", index)) {
      previousTokenType = "value";
      index += 2;
      continue;
    }

    previousTokenType = "prefix";
    index += 1;
  }

  return false;
}

function hasTopLevelKeyword(source, keyword) {
  let index = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  let previousTokenType = "prefix";

  while (index < source.length) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (isWhitespace(char)) {
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      index = consumeLineComment(source, index);
      continue;
    }

    if (char === "/" && nextChar === "*") {
      index = consumeBlockComment(source, index);
      continue;
    }

    if (char === "'" || char === "\"") {
      index = consumeStringLiteral(source, index);
      previousTokenType = "value";
      continue;
    }

    if (char === "`") {
      index = consumeTemplateLiteral(source, index).end;
      previousTokenType = "value";
      continue;
    }

    if (char === "/" && canStartRegex(previousTokenType)) {
      index = consumeRegexLiteral(source, index);
      previousTokenType = "value";
      continue;
    }

    if (isIdentifierStart(char)) {
      const end = consumeIdentifier(source, index);
      const word = source.slice(index, end);

      if (braceDepth === 0 && bracketDepth === 0 && parenDepth === 0 && word === keyword) {
        return true;
      }

      previousTokenType = PREFIX_KEYWORDS.has(word) ? "prefix" : "value";
      index = end;
      continue;
    }

    if (isDigit(char)) {
      index = consumeNumberLiteral(source, index);
      previousTokenType = "value";
      continue;
    }

    if (char === "{") {
      braceDepth += 1;
      previousTokenType = "prefix";
      index += 1;
      continue;
    }

    if (char === "}") {
      braceDepth -= 1;
      previousTokenType = "value";
      index += 1;
      continue;
    }

    if (char === "[") {
      bracketDepth += 1;
      previousTokenType = "prefix";
      index += 1;
      continue;
    }

    if (char === "]") {
      bracketDepth -= 1;
      previousTokenType = "value";
      index += 1;
      continue;
    }

    if (char === "(") {
      parenDepth += 1;
      previousTokenType = "prefix";
      index += 1;
      continue;
    }

    if (char === ")") {
      parenDepth -= 1;
      previousTokenType = "value";
      index += 1;
      continue;
    }

    if (source.startsWith("?.", index)) {
      previousTokenType = "value";
      index += 2;
      continue;
    }

    previousTokenType = "prefix";
    index += 1;
  }

  return false;
}

function isFunctionExpressionSource(source) {
  const trimmed = source.trim();

  if (trimmed.startsWith("function") || trimmed.startsWith("async function")) {
    return true;
  }

  return hasTopLevelSequence(trimmed, "=>");
}

function shouldWrapExpression(source, attributeName) {
  const trimmed = source.trim();

  if (trimmed.length === 0) {
    return false;
  }

  if (attributeName?.startsWith("on:")) {
    return false;
  }

  if (isFunctionExpressionSource(trimmed)) {
    return false;
  }

  for (const keyword of WRAP_BLOCKING_KEYWORDS) {
    if (hasTopLevelKeyword(trimmed, keyword)) {
      return false;
    }
  }

  return true;
}

function transformTemplateLiteral(template, options) {
  let code = "`";
  let changed = false;

  for (let index = 0; index < template.quasis.length; index += 1) {
    const quasi = template.quasis[index];
    code += quasi;

    if (index >= template.expressions.length) {
      continue;
    }

    const originalExpression = template.expressions[index];
    const nested = transformGuiTemplates(originalExpression, options);
    const attributeName = readAttributeContext(quasi);
    const expressionSource = shouldWrapExpression(nested.code, attributeName)
      ? `() => (${nested.code})`
      : nested.code;

    if (nested.changed || expressionSource !== originalExpression) {
      changed = true;
    }

    code += `\${${expressionSource}}`;
  }

  code += "`";

  return {
    code,
    changed,
  };
}

export function transformGuiTemplates(source, options = {}) {
  const tags = new Set(options.tags ?? DEFAULT_TAGS);
  let cursor = 0;
  let code = "";
  let changed = false;

  while (cursor < source.length) {
    const match = findNextTaggedTemplate(source, cursor, tags, options.id);

    if (!match) {
      code += source.slice(cursor);
      break;
    }

    code += source.slice(cursor, match.templateStart);

    const template = consumeTemplateLiteral(source, match.templateStart, options.id, true);
    const transformed = transformTemplateLiteral(template, options);

    code += transformed.code;
    changed = changed || transformed.changed;
    cursor = template.end;
  }

  return {
    code: changed ? code : source,
    changed,
  };
}
