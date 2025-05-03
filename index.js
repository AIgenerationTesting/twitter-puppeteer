const express = require("express");
const puppeteer = require("puppeteer");
require("dotenv").config();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/tweet", async (req, res) => {
  const tweet = req.body.tweet;
  if (!tweet) return res.status(400).send("Tweet text missing.");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://twitter.com/login", { waitUntil: "networkidle2" });

    await page.type('input[name="text"]', process.env.TWITTER_USERNAME);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    await page.type('input[name="password"]', process.env.TWITTER_PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    await page.goto("https://twitter.com/compose/tweet", { waitUntil: "networkidle2" });
    await page.waitForSelector('div[aria-label="Tweet text"]');

    await page.type('div[aria-label="Tweet text"]', tweet);
    await page.click('div[data-testid="tweetButtonInline"]');

    await browser.close();
    res.send("Tweet posted!");
  } catch (err) {
    console.error("Tweet failed:", err);
    await browser.close();
    res.status(500).send("Tweet failed.");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
