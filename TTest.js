const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const dictionary = require("./Translate.json")

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function test(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://loawa.com/char/%EB%9D%BC%EB%B8%94%EB%A3%A8%EC%86%8C%EC%84%9C")
    await sleep(2000);
    const [button] = await page.$x("//button[contains(., '스킬')]");
    if (button) {
        await button.click();
    }
    await sleep(1000);

    const skills = await page.evaluate(() =>{
        const ausgabe = [];
        for(let i = 2;i < 10; i++){
        const parent = document.querySelector(
            `#char-app > div > div.char-layout.mt-2 > div.main-wrap > div > div > div > div > div:nth-child(${i})`
        );
        const SkillImage = parent.querySelector('img').src;
        const SkillName = parent.querySelector('strong').textContent;
        const SkillLevelkind = parent.querySelector('div.--title');
        const SkillLevel = parseInt(SkillLevelkind.innerText.split(':').pop().trim());
        const SRuneOne = parent.querySelector('span.d-block.ms-1.text-grade2').textContent;
        const SRuneTwo = parent.querySelector('span.d-block.ms-1.text-grade1').textContent;
        const SRuneTree = parent.querySelector('span.d-block.ms-1.text-grade4').textContent;

        const GemImage = document.querySelector(`#char-app > div > div.char-layout.mt-2 > div.main-wrap > div > div > div > div > div:nth-child(${i}) > div:nth-child(2) > img`).src;   
        
        //const RuneName = parent.querySelector('div:nth-child(3) > strong').textContent;
        //const RuneImage = parent.querySelector('div:nth-child(3) > img').src;

        ausgabe[i-2] = { SkillName, SkillImage, SkillLevel, SRuneOne, SRuneTwo, SRuneTree, GemImage };
        }
        return ausgabe  
    })
    
    await browser.close()

    länge = skills.length;
    for (let i = 0; i < länge; i++){
        skills[i].SkillName = dictionary['Skills-Sorc'][skills[i].SkillName]
        skills[i].SRuneOne = dictionary.Rune[skills[i].SRuneOne]
        skills[i].SRuneTwo = dictionary.Rune[skills[i].SRuneTwo]
        skills[i].SRuneTree = dictionary.Rune[skills[i].SRuneTree]
    }

    console.log(skills)
}
test()