import sanitizeHtml from "sanitize-html";

// HTML authored in SunEditor (module text + assignment description) is stored
// in the database and later rendered with dangerouslySetInnerHTML, so it must
// be sanitized BEFORE it is saved. This mirrors the DOMPurify-default config
// used on the client: formatting survives, active content does not.
//
// Allowed: the formatting/structure tags the editor produces (plus the
// harmless text-level tags sanitize-html allows by default), safe inline
// styles, and links with http/https/mailto schemes. The class attribute is
// allowed because SunEditor's paragraphStyle button emits classes
// (__se__p-*); classes cannot execute code.
//
// NOT allowed: script/style content, event handlers, javascript: URLs,
// iframes (video embeds are a separate youtubeId field, never part of this
// HTML), and images (the editor has no image button).
//
// NOTE: this only covers content saved after this change. Rows already in
// the database are left untouched; the client sanitizes on render.

const COLOR_VALUE = [
  /^#[0-9a-f]{3,8}$/i,
  /^rgba?\(\s*\d{1,3}\s*(,\s*\d{1,3}\s*){2}(,\s*(0|1|0?\.\d+))?\s*\)$/i,
  /^[a-z]+$/i,
];
const FONT_SIZE_VALUE = /^\d+(\.\d+)?(px|pt|em|rem|%)$/;
const INDENT_VALUE = /^-?\d+(\.\d+)?(px|pt|em|rem|%)$/;

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags
    .filter((tag) => tag !== "img")
    // strike/del: what the editor's strikeThrough produces in some browsers.
    .concat(["strike", "del"]),
  allowedAttributes: {
    "*": ["style", "class"],
    a: ["href", "title", "target", "rel"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan", "scope"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // SunEditor output styles only: fontSize, align, indent/outdent, plus the
  // color/decoration props pasted content may carry. Anything else (url(),
  // expression(), position, ...) is dropped.
  allowedStyles: {
    "*": {
      color: COLOR_VALUE,
      "background-color": COLOR_VALUE,
      "text-align": [/^(left|right|center|justify|start|end)$/],
      "font-size": [FONT_SIZE_VALUE],
      "font-family": [/^[\w\s,'"-]+$/],
      "font-weight": [/^(normal|bold|bolder|lighter|[1-9]00)$/],
      "font-style": [/^(normal|italic|oblique)$/],
      "text-decoration": [/^(none|underline|overline|line-through)$/],
      "margin-left": [INDENT_VALUE],
      "margin-right": [INDENT_VALUE],
    },
  },
  disallowedTagsMode: "discard",
};

// Generic passthrough: null/undefined/"" come back exactly as they went in,
// so optional DTO fields keep their meaning (null = explicit NULL, undefined
// = field omitted) and Prisma create/update semantics stay unchanged.
export function sanitizeUserHtml<T extends string | null | undefined>(
  dirty: T
): T {
  if (typeof dirty !== "string" || dirty === "") return dirty;
  return sanitizeHtml(dirty, SANITIZE_OPTIONS) as T;
}
