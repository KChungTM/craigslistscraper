const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

async function main(){
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const listings = await scrapListing(page);
    const listingJobDescriptions = await scrapeJobDescriptions(page, listings)
}

async function scrapeJobDescriptions(page, listings){
    for(var i = 0; i<listings.length; i++){
        // CREATES CHROMIUM BROWSWER FOR LISTING PAGE
        await page.goto(listings[i].url);

       //GRABS HTML AND SLEEPS 1 SECOND
        const html = await page.content();
        const $ = cheerio.load(html)

        // SCRAPS JOB DESCRIPTION
        const jobDescription = $("#postingbody").text().replace("QR Code Link to This Post", "").trim();
        listings[i].jobDescription = jobDescription;

        // SCRAPS COMPENSATION
        const compensation = $(".attrgroup > span:nth-child(1) > b").text();
        listings[i].compensation = compensation;

        // PRINTS LISTING INFO
        printInfo(listings[i]);

        await new Promise(r => setTimeout(r, 1000));
      
    }
}

async function scrapListing(page){
    // CREATES CHROMIUM BROWSER W/ PUPPETEER
    await page.goto("https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof");

    // GRABS HTML CONTENTS OF PAGE
    const html = await page.content();
    // PASS HTML INTO PARSER
    const $ = cheerio.load(html);

    const listings = $(".result-info").map((index, element) => {
        // SCRAPS DATA FROM ".result-hood" CLASS
        const neighborhoodElement = $(element).find(".result-hood");
        const neighborhood = $(neighborhoodElement).text().trim().replace(/[()]/g,'');
        // SCRAPS DATA FROM ".result-date" CLASS
        const timeElement = $(element).find(".result-date");
        const datePosted = new Date($(timeElement).attr("datetime"));
        // SCRAPS DATA FROM ".result-title" CLASS
        const titleElement = $(element).find(".result-title");
        const title = $(titleElement).text();
        const url = $(titleElement).attr("href");
        return { title, url, datePosted, neighborhood };
    }).get();
    return listings;
}

function printInfo(listing){
    for (let [key, value] of Object.entries(listing)) {
        console.log(String(key).toUpperCase() + ": " + value);
    }
    console.log("-------------------------------------------------------");
}

main();
