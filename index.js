const express = require("express");
const puppeteer = require("puppeteer-core");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/tweet", async (req, res) => {
  const tweet = req.body.tweet;
  if (!tweet) return res.status(400).send("Tweet text missing.");

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();

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
  } catch (error) {
    await browser.close();
    console.error("Tweet failed:", error);
    res.status(500).send("Tweet failed.");
  }
});

app.listen(3000, () => {
  console.log("Server running");
});
