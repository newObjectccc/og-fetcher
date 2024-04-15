import * as cheerio from "cheerio";
import { ogMap } from "./config/og-map";

export async function fetchHtml(url: string): Promise<string> {
  let htmlString = "";
  try {
    htmlString = await fetch(url).then((res) => res.text());
  } catch (error) {
    console.error("Failed to fetch page: ", error);
  }
  return htmlString;
}

export function parseHtml(html: string): cheerio.CheerioAPI {
  return cheerio.load(html);
}

export function getOpenGraphMeta<T extends typeof ogMap>(
  $: cheerio.CheerioAPI,
  matcher: T = ogMap as T
): Record<string, string> {
  const ogMeta: Record<string, string> = {};
  $("meta[property^='og:']").each((_, el) => {
    const property = $(el).attr("property");
    if (!property || !matcher.includes(property)) return;
    const content = $(el).attr("content");
    if (property && content) {
      ogMeta[property.replace("og:", "")] = content;
    }
  });
  return ogMeta;
}

async function ogFetcher<T>(
  url: string,
  extract?: T extends typeof ogMap ? T : never
): Promise<Record<string, string>> {
  let $;
  try {
    const html = await fetchHtml(url);
    $ = parseHtml(html);
  } catch (err) {
    console.error("Failed to parse html: ", err);
  }
  if (!$) return {};
  return getOpenGraphMeta($, extract);
}

export default ogFetcher;
