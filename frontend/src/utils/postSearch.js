export function normalizePostSearchQuery(query) {
  return String(query ?? "")
    .trim()
    .toLocaleLowerCase("ru-RU");
}

export function postMatchesQuery(post, query) {
  const needle = normalizePostSearchQuery(query);
  if (!needle) return true;
  const haystack = String(post?.content ?? "").toLocaleLowerCase("ru-RU");
  return haystack.includes(needle);
}

export function filterPostsByQuery(posts, query) {
  const needle = normalizePostSearchQuery(query);
  if (!needle) return posts;
  return posts.filter((post) => postMatchesQuery(post, needle));
}

/** Split text into segments for highlight rendering (case-insensitive). */
export function splitTextByQuery(text, query) {
  const raw = String(text ?? "");
  const needle = normalizePostSearchQuery(query);
  if (!needle || !raw) {
    return [{ text: raw, match: false }];
  }

  const segments = [];
  const lower = raw.toLocaleLowerCase("ru-RU");
  let start = 0;

  while (start < raw.length) {
    const idx = lower.indexOf(needle, start);
    if (idx === -1) {
      segments.push({ text: raw.slice(start), match: false });
      break;
    }
    if (idx > start) {
      segments.push({ text: raw.slice(start, idx), match: false });
    }
    segments.push({
      text: raw.slice(idx, idx + needle.length),
      match: true,
    });
    start = idx + needle.length;
  }

  return segments.length ? segments : [{ text: raw, match: false }];
}
