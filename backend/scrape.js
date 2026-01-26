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

  $("script, style, nav, footer, header").remove();

  const text = cleanText($("body").text());

  return {
    id: path === "/" ? "home" : path.replace("/", ""),
    text
  };
}

async function run() {
  const chunks = [];

  for (const page of pages) {
    console.log(`Scraping ${page}`);
    const content = await scrapePage(page);
    chunks.push(content);
  }

  fs.writeFileSync(
    "./data/chunks.json",
    JSON.stringify(chunks, null, 2)
  );

  console.log("✅ Website scraped and saved to data/chunks.json");
}

run();
