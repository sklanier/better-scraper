const express = require('express'); // Adding Express
const app = express(); // Initializing Express
const fs = require("fs");
const puppeteer = require('puppeteer'); // Adding Puppeteer
const chalk = require('chalk');
const json2csv = require("csvjson-json2csv");

const error = chalk.bold.red;
const success = chalk.keyword("green");

app.get('/', (req, res) => { 
const getSchedule = async () => {
    try {
        // open the headless browser
        let browser = await puppeteer.launch({ 
        headless: true,
        dumpio: false
        });
        // open a new page
        let page = await browser.newPage();
        // enter url in page
        await page.goto(`https://www.bovada.lv/sports/basketball/college-basketball`);
        await page.waitForSelector("div.next-events-bucket");

        let schedule = await page.evaluate(() => {
        let nextEvents = document.querySelector("div.next-events-bucket");
        let rowList = nextEvents.querySelectorAll("section.coupon-container.multiple.inline");
        
        let eventList = [];
        for (let i=0;i<rowList.length;i++){
            let teamNames = rowList[i].querySelectorAll("h4.competitor-name");
            let metrics = rowList[i].querySelectorAll("button.bet-btn");
            eventList[i] = {
            team1: teamNames.length > 0 ? teamNames[0].innerText.trim() : " ",
            team2: teamNames.length > 0 ? teamNames[1].innerText.trim() : " ",
            spread: metrics[0].innerText.trim() + " / " + metrics[1].innerText.trim(),
            total: metrics[2].innerText.trim() + " / " + metrics[3].innerText.trim()
            };
        }
        return eventList;
        });
        fs.writeFile("d1daily.csv", json2csv(schedule), (err) => {
            if (err) throw err;
            console.log("Saved!");
        });
        
        console.log(success("Browser Closed"));
        } catch (err) {
        // Catch and display errors
        console.log(error(err));
        await browser.close();
        console.log(error("Browser Closed"));
        }
    };
getSchedule();
res.sendFile(__dirname + '/d1daily.csv');
});

// Making Express listen on port 7000
app.listen(7000, function() {
    console.log('Running on port 7000.');
});