const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");

class Scrapper {
  constructor(url) {
    this.url = url;
    this.properties = [];
  }

  async executer() {
    await this.getHtml();
    return this.properties;
  }

  async launchBrowser() {
    const browser = await puppeteer.launch({
      headless: false,
      args: [`--window-size=${1280},${1024}`],
    });
    return browser;
  }

  async getHtml() {
    const browser = await this.launchBrowser();

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    console.log(this.url);
    await page.goto(this.url, {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(6000);

    const html = await page.evaluate(() => document.documentElement.outerHTML);
    this.properties = this.parseData(html);
    await browser.close();
  }

  parseData(html) {
    const dom = new JSDOM(html);
    const sections = dom.window.document.querySelectorAll(
      ".listing-search-item--list"
    );
    let properties = [];
    for (let i = 0; i < sections.length; i++) {
      properties.push({
        title: sections[i]
          .querySelector(".listing-search-item__title")
          .textContent.trim(),
        address: sections[i]
          .querySelector(".listing-search-item__sub-title")
          .textContent.trim(),
        price: sections[i]
          .querySelector(".listing-search-item__price")
          .textContent.trim(),
        features: {
          area: sections[i]
            .querySelector(".illustrated-features__item--surface-area")
            .textContent.trim(),
          rooms: sections[i]
            .querySelector(".illustrated-features__item--number-of-rooms")
            .textContent.trim(),
          interior:
            sections[i].getElementsByClassName(
              "illustrated-features__item--interior"
            )[0] === undefined
              ? null
              : sections[i]
                  .getElementsByClassName(
                    "illustrated-features__item--interior"
                  )[0]
                  .textContent.trim(),
        },
        link: `https://www.pararius.com${
          sections[i].querySelector(".listing-search-item__link--title").href
        }`,
      });
    }
    return properties;
  }
}

const main = async (city = "amsterdam") => {
  const pptr = new Scrapper(`https://www.pararius.com/apartments/${city}`);
  const properties = await pptr.executer();
  console.log(properties);
};

main("zwolle");
