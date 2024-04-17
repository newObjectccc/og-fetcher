/**
 * @module @vesper/og-fetcher
 *
 * this fetcher can help you to get the website open-graph metadata
 * depends on your configuration. you can use it in browser or node runtime.
 *
 * ```ts
 * import ogFetcher from "@vesper/og-fetcher";
 * ogFetcher("https://www.example.com").then(console.log);
 * ```
 *
 */
import * as cheerio from "cheerio";
import type { OgMapType } from "./config/og-map";
import { ogMap } from "./config/og-map";

/**
 * [async fetchHtml description]
 *
 * @param   {string<string>}   url  [url example: 'https://www.example.com']
 *
 * @return  {Promise<string>}       [return html string or empty string if failed to fetch]
 */
export async function fetchHtml(url: string): Promise<string> {
  /** get html string via fetch api */
  const htmlString = await fetch(url, { mode: "no-cors" })
    .then((res) => res.text())
    .catch((err) => {
      console.error("Failed to fetch page: ", err);
      return "";
    });
  return htmlString;
}

/**
 * [CheerioAPI description]
 *
 * @param {string} [html string]
 *
 * @return {cheerio.CheerioAPI} [return cheerio object]
 */
export function parseHtml(html: string): cheerio.CheerioAPI {
  /** transform html string to cheerio object */
  return cheerio.load(html);
}

/**
 * [export getOpenGraphMeta description]
 *
 * @param   {cheerio.CheerioAPI}  $        [cheerio object]
 * @param   {T}                   matcher  [match any of the ogMap keys]
 *
 * @return  {<T>}     [return description]
 */
export function getOpenGraphMeta<T extends typeof ogMap>(
  $: cheerio.CheerioAPI,
  matcher: T = ogMap as T
): Record<string, string> {
  const ogMeta: Record<string, string> = {};
  const metaWithOg = $("meta[property^='og:']");
  console.log("🚀 ~ metaWithOg:", metaWithOg);
  metaWithOg.each((_, el) => {
    const property = $(el).attr("property");
    console.log("🚀 ~ $ ~ property:", property);
    if (!property || !matcher.includes(property as any)) return;
    const content = $(el).attr("content");
    if (property && content) {
      ogMeta[property.replace("og:", "")] = content;
    }
  });
  return ogMeta;
}

/**
 * [async ogFetcher description]
 *
 * @param   {string}  url      [url example: 'https://www.example.com']
 * @param   {T extends typeof ogMap}       extract  [match any of the ogMap keys]
 *
 * @return  {<T>}     [return description]
 */
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
export type { OgMapType };
