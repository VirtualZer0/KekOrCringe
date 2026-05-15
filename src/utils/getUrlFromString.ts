// Matches URLs in chat. Accepts three forms:
//   1. With protocol:  https://foo.com/bar
//   2. With www.:      www.foo.com/bar
//   3. Bare platform:  youtu.be/x, youtube.com/x, tiktok.com/x, vm.tiktok.com/x,
//                      vt.tiktok.com/x, m.tiktok.com/x, clips.twitch.tv/x,
//                      twitch.tv/x, m.twitch.tv/x
// Anchored by start-of-string or whitespace/punctuation to avoid matching
// substrings inside other words (e.g., "mytiktok.com/x" should not match).
const URL_REGEX =
  /(?:^|[\s,(<>\]["'])((?:https?:\/\/|www\.)\S+|(?:youtu\.be|clips\.twitch\.tv|(?:vm|vt|m)\.tiktok\.com|m\.twitch\.tv|tiktok\.com|youtube\.com|twitch\.tv)\/\S+)/gi;

export const getUrlFromString = (text: string): string[] | null => {
  const matches = [...text.matchAll(URL_REGEX)].map((m) => m[1]);
  return matches.length > 0 ? matches : null;
};
