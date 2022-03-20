const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const dictionary = require("./Translate.json")

async function test(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://loawa.com/char/%EB%9D%BC%EB%B8%94%EB%A3%A8%EC%86%8C%EC%84%9C")
    const infos = await page.evaluate(() =>{
        const skillInfos = [];
        for (let i=1; i<5;i++) {
          const parent = document.querySelector(`#abasic-tab > div > div.qul-box.qul-box-3.col > div > div.row.char-equip-engrave > div:nth-child(${i})`);
          const text = parent.querySelector("span").textContent;
          const image = parent.querySelector("img").src;
          const level = parseInt(parent.innerText.split("").pop()); // funktioniert nur wenn das level immer einstellig bleibt

          skillInfos[i] = {text, image, level};
        }
        return skillInfos
    });
    console.log(infos)
    

    // verwenden kannste das dann so:
    // index => 0-based index vom skill
    infos[index].text;

    // kannst das auch einfacher in loops oder map funktionen verwenden:
    const template = skillInfos.map(info => {
      return `<tr><td>${info.name}</td><td>${info.level}</td><td>${info.image}</td></tr>`
    });

    // oder in der console als tabelle formatiert ausgeben lassen:
    console.table(skillInfos)
}
test()