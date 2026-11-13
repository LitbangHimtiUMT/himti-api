import sanitizeHtml from "sanitize-html";

// PINNED: sanitize-html stays on 2.17.1 (exact, no caret) on purpose.
// 2.17.2+ pulls htmlparser2 10/12, which is ESM-only, and the Vercel
// Functions loader rejects require() of ES modules (ERR_REQUIRE_ESM) at
// every Node version — the 2026-11-13 production outage. 2.17.1 is the
// last version with a fully CommonJS tree (htmlparser2 8.x). Do NOT
// upgrade past it without verifying the whole tree stays require()-able
// from CommonJS under Node 18 (the strictest local proxy for the Vercel
// loader). @types/sanitize-html is pinned to 2.13.0 for the same reason:
// 2.16.x depends on htmlparser2 ^12.
//
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
// HTML), and images (the editor has no image button). Links that open in a
// new tab always get rel="noopener noreferrer" (see transformTags below) so
// a pasted link cannot get window.opener access to the LMS tab.
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
  // A pasted link with target="_blank" and no rel would give the new page
  // window.opener access. Force the safe rel tokens, keeping any rel tokens
  // the author already set.
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target !== "_blank") return { tagName, attribs };
      const rel = new Set(
        (attribs.rel || "").split(/\s+/).filter(Boolean)
      );
      rel.add("noopener");
      rel.add("noreferrer");
      return { tagName, attribs: { ...attribs, rel: [...rel].join(" ") } };
    },
  },
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
