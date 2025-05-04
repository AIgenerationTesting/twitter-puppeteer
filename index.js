const express = require("express");
const { chromium } = require("playwright");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/tweet", async (req, res) => {
  const tweet = req.body.tweet;
  if (!tweet) return res.status(400).send("Tweet text missing.");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"]
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://twitter.com/login", { waitUntil: "domcontentloaded" });

    await page.fill('input[name="text"]', process.env.TWITTER_USERNAME);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    await page.fill('input[name="password"]', process.env.TWITTER_PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForNavigation();

    await page.goto("https://twitter.com/compose/tweet");
    await page.waitForSelector('div[aria-label="Tweet text"]');
    await page.type('div[aria-label="Tweet text"]', tweet);
    await page.click('div[data-testid="tweetButtonInline"]');

    await browser.close();
    res.send("Tweet posted!");
  } catch (error) {
    await browser.close();
    console.error("Tweet failed:", error);
    res.status(500).send("Tweet failed.");
  }
});

app.listen(3000, () => {
  console.log("Playwright server running");
});
