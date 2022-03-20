const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const dictionary = require("./Translate.json")
const { map } = require('cheerio/lib/api/traversing')

// const browser = await puppeteer.launch({ headless: false });

async function screenshotWebPage(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://learnwebcode.github.io/practice-requests/")
    await page.screenshot({ path: "test.png" }) // await page.screenshot({ path: "test.png" , fullPage: true })
    await browser.close()
}

async function getTextbsp(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://learnwebcode.github.io/practice-requests/")

    const names = await page.evaluate(() =>{
        return Array.from(document.querySelectorAll("body > div > div > div > strong")).map(x => x.textContent)
    })
    await fs.writeFile("names.txt", names.join("\r\n"))

    await browser.close()
}

async function getText(){
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.goto("https://loawa.com/char/%EB%9D%BC%EB%B8%94%EB%A3%A8%EC%86%8C%EC%84%9C")

    //const names = await page.evaluate(() =>{
    //    return Array.from(document.querySelectorAll("#char-app > div > div.char-layout.mt-2 > div.main-wrap > ul > li > button")).map(x => x.textContent)
    //})
    //await fs.writeFile("Test.txt", names.join("\r\n"))

    const werte = await page.evaluate(() =>{
        //return Array.from(document.querySelectorAll("$#abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div")).map(x => x.textContent)  // #abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child({})
        const ausgabe = [];
        for (let i = 4; i < 7; i++) {
            ausgabe.push(Array.from(document.querySelectorAll(`#abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child(${i})`)).map(x => x.textContent));
          }
        return ausgabe // #abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child({})
    })
    await fs.writeFile("skills.txt", werte.join("\r\n"))

    const [button] = await page.$x("//button[contains(., '스킬')]");

    if (button) {
        await button.click();
    }

    //await browser.close()
}

async function get_stats(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://loawa.com/char/%EC%A0%9C%EC%9E%90") //https://loawa.com/char/%EB%9D%BC%EB%B8%94%EB%A3%A8%EC%86%8C%EC%84%9C
    
    const stats = await page.evaluate(() =>{
        const ausgabe = [];
        for (let ii = 4;ii < 7; ii++){
            for (let i = 1; i < 3; i++) {
                ausgabe.push(Array.from(document.querySelectorAll(`#abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child(${ii}) > div:nth-child(${i}) > span > span.--title`)).map(x => x.textContent));
                ausgabe.push(Array.from(document.querySelectorAll(`#abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child(${ii}) > div:nth-child(${i}) > span > span.--value`)).map(x => x.textContent));
            }
        }
        return ausgabe  
    })
    await fs.writeFile("werte_right_kr.txt", stats.join("\r\n"))

    const engraving = await page.evaluate(() =>{
        const ausgabe = [];
        for (let i = 1; i < 7; i++) {
            ausgabe.push(Array.from(document.querySelectorAll(`#abasic-tab > div > div.qul-box.qul-box-3.col > div > div.row.char-equip-engrave > div:nth-child(${i}) > span`)).map(x => x.textContent));
            ausgabe.push(Array.from(document.querySelectorAll(`#abasic-tab > div > div.qul-box.qul-box-3.col > div > div.row.char-equip-engrave > div:nth-child(${i}) > img`)).map(x => x.src));
            ausgabe.push(Array.from(document.querySelectorAll(`#abasic-tab > div > div.qul-box.qul-box-3.col > div > div.row.char-equip-engrave > div:nth-child(${i})`)).map(x => x.textContent));
          }
        return ausgabe  
    })
    await fs.writeFile("werte_eng_kr.txt", engraving.join("\r\n"))

    const [button] = await page.$x("//button[contains(., '스킬')]");

    if (button) {
        await button.click();
    }

    const skills = await page.evaluate(() =>{
        const ausgabe = [];
        for(let ii = 2; ii < 10; ii++){
            for (let i = 1; i < 4; i++) {
                ausgabe.push(Array.from(document.querySelectorAll(`#char-app > div > div.char-layout.mt-2 > div.main-wrap > div > div > div > div > div:nth-child(${ii}) > div:nth-child(${i})`)).map(x => x.textContent));
                ausgabe.push(Array.from(document.querySelectorAll(`#char-app > div > div.char-layout.mt-2 > div.main-wrap > div > div > div > div > div:nth-child(${ii}) > div:nth-child(${i}) > img`)).map(x => x.src));            
            }
        }
        return ausgabe  
    })
    await fs.writeFile("werte_Skills_kr.txt", skills.join("\r\n"))

    await browser.close()
    console.info(stats.map(translate))
    console.info(engraving.map(translate))
    return {stats : stats.map(translate), engraving : engraving, skill : skills};
}
//get_stats()

function translate(input) {
    if (!(input in dictionary.stats)) return input;
    return dictionary[input];
  }

async function main(){
    
    var values = await get_stats()
    //console.info(values);
}
//console.info(translate("치명"))
main()
