const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const dictionary = require("./Translate.json")
const { map, index } = require('cheerio/lib/api/traversing')

// const browser = await puppeteer.launch({ headless: false });

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
    await sleep(1000);
    const stats = await page.evaluate(() =>{
        const ausgabe = [];
        x = 0
        for (let ii = 4;ii < 7; ii++){
            for (let i = 1; i < 3; i++) {
                //ausgabe.push(Array.from(document.querySelectorAll(`#abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child(${ii}) > div:nth-child(${i}) > span > span.--title`)).map(x => x.textContent));
                //ausgabe.push(Array.from(document.querySelectorAll(`#abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child(${ii}) > div:nth-child(${i}) > span > span.--value`)).map(x => x.textContent));
                
                const parent = document.querySelector(
                    `#abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child(${ii}) > div:nth-child(${i})`
                );
                const stat = parent.querySelector('span.--title').textContent;
                const value = parent.querySelector('span.--value').textContent;

                ausgabe[x] = {stat, value};
                x++
            }
        }
        return ausgabe  
    })
    await fs.writeFile("werte_right_kr.txt", stats.join("\r\n"))

    const engraving = await page.evaluate(() =>{
        const skillInfos = [];
        for (let i = 1; i < 7; i++) {
            const parent = document.querySelector(
                `#abasic-tab > div > div.qul-box.qul-box-3.col > div > div.row.char-equip-engrave > div:nth-child(${i})`
            );
            const text = parent.querySelector('span').textContent;
            const image = parent.querySelector('img').src;
            const level = parseInt(parent.innerText.split('').pop()); // funktioniert nur wenn das level immer einstellig bleibt

            skillInfos[i-1] = { text, image, level };
        }
        return skillInfos;  
    })
    
    //await fs.writeFile("werte_eng_kr.txt", engraving.join("\r\n"))

    const [button] = await page.$x("//button[contains(., '스킬')]");

    if (button) {
        await button.click();
    }
    await sleep(1000);
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
    //console.info(stats.map(translate))

    
    länge = engraving.length;
    for (let i = 0; i < länge; i++){
        engraving[i].text = dictionary.Engraving[engraving[i].text]
    }
    
    länge = stats.length;
    for (let i = 0; i < länge; i++){
        stats[i].stat = dictionary.Stats[stats[i].stat]
    }

    return {stats : stats, engraving : engraving, skill : skills};
}
//get_stats()

function translate(input) {
    if (!(input in dictionary.Stats)) return input;
    return dictionary[input];
  }

async function main(){
    
    var test = await get_stats()
    console.log(test)
    //console.info(values);
}
//console.info(translate("치명"))
main()
