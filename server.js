const express = require('express');
const puppeteer = require("puppeteer");
let { id, pass } = require("./secret");
let dataFile = require("./data");

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/start-automation', async (req, res) => {
    let status = 'Automation Started';
    try {
        await startPuppeteerAutomation();
        status = 'Automation Completed';
    } catch (error) {
        status = 'Automation Failed';
        console.error(error);
    }
    res.send({ status });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function startPuppeteerAutomation() {
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });

    let pages = await browser.pages();
    let tab = pages[0];
    await tab.goto("https://internshala.com/");

    // Rest of your Puppeteer code...
    await tab.waitForSelector("button.login-cta", { visible: true });
    await tab.click("button.login-cta");

    await tab.waitForSelector("#modal_email", { visible: true });
    await tab.type("#modal_email", id);
    await tab.type("#modal_password", pass);

    await tab.click("#modal_login_submit");

    await tab.waitForNavigation({ waitUntil: "networkidle2" });
    await tab.waitForSelector("a#internships_new_superscript", { visible: true});
    await tab.click("a#internships_new_superscript");
    await tab.waitForNavigation({ waitUntil: "networkidle2" });

    await tab.waitForSelector("input#matching_preference", { visible: true});
    await tab.click("input#matching_preference");
    await tab.waitForNavigation({ waitUntil: "networkidle2" });

    let profile_options = await tab.$$(".profile_options a");
    let app_urls = [];
    for (let i = 0; i < profile_options.length; i++) {
        let url = await tab.evaluate(function (ele) {
            return ele.getAttribute("href");
        }, profile_options[i]);
        app_urls.push(url);
    }

    await tab.goto("https://internshala.com" + app_urls[1]);

    await tab.waitForSelector("#graduation-tab .ic-16-plus", { visible: true });
    await tab.click("#graduation-tab .ic-16-plus");
    await graduation(dataFile[0]);

    await tab.waitForSelector(".next-button", { visible: true });
    await tab.click(".next-button");

    await training(dataFile[0]);

    await tab.waitForSelector(".next-button", { visible: true });
    await tab.click(".next-button");

    await tab.waitForSelector(".btn.btn-secondary.skip.skip-button", { visible: true });
    await tab.click(".btn.btn-secondary.skip.skip-button");

    await workSample(dataFile[0]);

    await tab.waitForSelector("#save_work_samples", { visible: true });
    await tab.click("#save_work_samples");

    await application(dataFile[0]);

    await browser.close();
    console.log('Automation Status: Completed');
}

async function graduation(data) {
    await tab.waitForSelector("#degree_completion_status_pursuing", { visible: true });
    await tab.click("#degree_completion_status_pursuing");

    await tab.waitForSelector("#college", { visible: true });
    await tab.type("#college", data["College"]);

    await tab.waitForSelector("#start_year_chosen", { visible: true });
    await tab.click("#start_year_chosen");
    await tab.waitForSelector(".active-result[data-option-array-index='5']", { visible: true });
    await tab.click(".active-result[data-option-array-index='5']");

    await tab.waitForSelector("#end_year_chosen", { visible: true });
    await tab.click('#end_year_chosen');
    await tab.waitForSelector("#end_year_chosen .active-result[data-option-array-index='6']", { visible: true });
    await tab.click("#end_year_chosen .active-result[data-option-array-index='6']");

    await tab.waitForSelector("#degree", { visible: true });
    await tab.type("#degree", data["Degree"]);

    await tab.waitForSelector("#stream", { visible: true });
    await tab.type("#stream", data["Stream"]);

    await tab.waitForSelector("#performance-college", { visible: true });
    await tab.type("#performance-college", data["Percentage"]);

    await tab.click("#college-submit");
}

async function training(data) {
    await tab.waitForSelector(".experiences-tabs[data-target='#training-modal'] .ic-16-plus", { visible: true });
    await tab.click(".experiences-tabs[data-target='#training-modal'] .ic-16-plus");

    await tab.waitForSelector("#other_experiences_course", { visible: true });
    await tab.type("#other_experiences_course", data["Training"]);

    await tab.waitForSelector("#other_experiences_organization", { visible: true });
    await tab.type("#other_experiences_organization", data["Organization"]);

    await tab.click("#other_experiences_location_type_label");

    await tab.click("#other_experiences_start_date");
    await tab.waitForSelector(".ui-state-default[href='#']", { visible: true });
    let date = await tab.$$(".ui-state-default[href='#']");
    await date[0].click();
    await tab.click("#other_experiences_is_on_going");

    await tab.waitForSelector("#other_experiences_training_description", { visible: true });
    await tab.type("#other_experiences_training_description", data["description"]);

    await tab.click("#training-submit");
}

async function workSample(data) {
    await tab.waitForSelector("#other_portfolio_link", { visible: true });
    await tab.type("#other_portfolio_link", data["link"]);
}

async function application(data) {
    await tab.goto("https://internshala.com/the-grand-summer-internship-fair");

    await tab.waitForSelector(".btn.btn-primary.campaign-btn.view_internship", { visible: true });
    await tab.click(".btn.btn-primary.campaign-btn.view_internship");

    await tab.waitForSelector(".view_detail_button", { visible: true });
    let details = await tab.$$(".view_detail_button");
    let detailUrl = [];
    for (let i = 0; i < 3; i++) {
        let url = await tab.evaluate(function (ele) {
            return ele.getAttribute("href");
        }, details[i]);
        detailUrl.push(url);
    }

    for (let i of detailUrl) {
        await apply(i, data);
    }
}

async function apply(url, data) {
    await tab.goto("https://internshala.com" + url);

    await tab.waitForSelector(".btn.btn-large", { visible: true });
    await tab.click(".btn.btn-large");

    await tab.waitForSelector("#application_button", { visible: true });
    await tab.click("#application_button");

    await tab.waitForSelector(".textarea.form-control", { visible: true });
    let ans = await tab.$$(".textarea.form-control");

    for (let i = 0; i < ans.length; i++) {
        if (i == 0) {
            await ans[i].type(data["hiringReason"]);
        } else if (i == 1) {
            await ans[i].type(data["availability"]);
        } else {
            await ans[i].type(data["rating"]);
        }
    }

    await tab.click(".submit_button_container");
}

// main();