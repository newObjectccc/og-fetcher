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
  let htmlString = "";
  try {
    htmlString = await fetch(url).then((res) => res.text());
  } catch (error) {
    console.error("Failed to fetch page: ", error);
  }
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
  $("meta[property^='og:']").each((_, el) => {
    const property = $(el).attr("property");
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
