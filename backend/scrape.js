import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://harmonyaestheticswellness.com";

const pages = [
  "/",
  "/about",
  "/services",
  "/contact"
];

function cleanText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\t\n\r]+/g, " ")
    .trim();
}

async function scrapePage(path) {
  const url = `${BASE_URL}${path}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  $("script, style, nav").remove();

  const text = cleanText($("body").text());

  return {
    title: path === "/" ? "Home" : path.replace("/", ""),
    url,
    content: text
  };
}

async function run() {
  const pagesData = [];

  for (const page of pages) {
    console.log(`Scraping ${page}`);
    const content = await scrapePage(page);
    pagesData.push(content);
  }

  fs.writeFileSync(
    "./data/pages.json",
    JSON.stringify(pagesData, null, 2)
  );

  console.log("✅ Website scraped and saved to data/pages.json");
}

run();
