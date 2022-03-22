const dictionary = require("./Translate.json")
const puppeteer = require('puppeteer')
const util = require("util");
const ejs = require('ejs');
const fs = require('fs');
const markdownpdf = require('markdown-pdf');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function get_stats(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://loawa.com/char/%EB%9D%BC%EB%B8%94%EB%A3%A8%EC%86%8C%EC%84%9C") //https://loawa.com/char/%EB%9D%BC%EB%B8%94%EB%A3%A8%EC%86%8C%EC%84%9C
    await sleep(1000);
    const stats = await page.evaluate((dictionary) =>{
        function getTranslator(namespace) {
            return function(string) {
                if (!(string in dictionary[namespace])) return string;
                return dictionary[namespace][string];
            }
        }
        const skillTranslator = getTranslator("Stats");
        const ausgabe = [];
        x = 0
        for (let ii = 4;ii < 7; ii++){
            for (let i = 1; i < 3; i++) {
                const parent = document.querySelector(
                    `#abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child(${ii}) > div:nth-child(${i})`
                );
                const stat = skillTranslator(parent.querySelector('span.--title').textContent);
                const value = skillTranslator(parent.querySelector('span.--value').textContent);

                ausgabe[x] = {stat, value};
                x++
            }
        }
        return ausgabe  
    },dictionary)

    const engraving = await page.evaluate((dictionary) =>{
        function getTranslator(namespace) {
            return function(string) {
                if (!(string in dictionary[namespace])) return string;
                return dictionary[namespace][string];
            }
        }
        const skillTranslator = getTranslator("Engraving");
        const skillInfos = [];
        for (let i = 1; i < 7; i++) {
            const parent = document.querySelector(
                `#abasic-tab > div > div.qul-box.qul-box-3.col > div > div.row.char-equip-engrave > div:nth-child(${i})`
            );
            const text = skillTranslator(parent.querySelector('span').textContent);
            const image = parent.querySelector('img').src;
            const level = parseInt(parent.innerText.split('').pop()); // funktioniert nur wenn das level immer einstellig bleibt

            skillInfos[i-1] = { text, image, level };
        }
        return skillInfos;  
    },dictionary)

    const [button] = await page.$x("//button[contains(., '스킬')]");

    if (button) {
        await button.click();
    }
    await sleep(1000);
    const skills = await page.evaluate((dictionary) =>{
        const skillData = []; // array for final data

        const skillItems = document.querySelectorAll('#char-app .char-skill-item'); // contains all main skill boxes

        skillItems.forEach((skillItem) => {
            function getTranslator(namespace) {
                return function(string) {
                    if (!(string in dictionary[namespace])) return string;
                    return dictionary[namespace][string];
                }
            }
            // place to store info about the currently processed skill
            const singleSkillInfo = {
                skill: {},
                gems: [],
                rune: {},  
            };

            // contains the info rows of the current skill item (skill, runes, gems)
            skillItem.querySelectorAll('.media').forEach((skillListElement, index) => {
                // check which kind of element this is
            
                // if its the first itteration of the loop, its the skill
                if (index === 0) {
                    const skillTranslator = getTranslator("Skills-Sorc");
                    singleSkillInfo.skill = {
                        image: skillListElement.querySelector('img').src,
                        name: skillTranslator(skillListElement.querySelector('.--name').innerText),
                        level: parseInt(skillListElement.querySelector('.--title').innerText.split(':').pop().trim()),
                        rune : [
                            skillTranslator(skillListElement.querySelector('.skill-tripod-summary > span.d-block.ms-1.text-grade2').textContent),
                            skillTranslator(skillListElement.querySelector('.skill-tripod-summary > span.d-block.ms-1.text-grade1').textContent),
                            skillTranslator(skillListElement.querySelector('.skill-tripod-summary > span.d-block.ms-1.text-grade4').textContent),
                        ],
                    };
                }

                // check if element is a gem (if the row contains an element with the class .text-grade5 its a gem)
                else if (skillListElement.querySelectorAll('.text-grade5').length > 0) {
                    const skillTranslator = getTranslator("Gem");
                    const nameText = skillListElement.querySelector('.text-grade5').innerText;
                    const [level, name] = /([0-9]+)(.+)/.exec(nameText).slice(1, 3);

                    const infoText = skillListElement.querySelector('p span:last-child').innerText;
                    const [infoValue, infoName] = /([0-9]+.[0-9]+)% (.+)$/.exec(infoText).slice(1, 3);

                    singleSkillInfo.gems.push({
                        image: skillListElement.querySelector('img').src,
                        name: skillTranslator(name),
                        level,
                        info: {
                            value: infoValue,
                            name: skillTranslator(infoName)
                        },
                    });
                }

                // if its not the skill and not a gem, its a rune
                else {
                    const skillTranslator = getTranslator("Runen");
                    singleSkillInfo.rune = {
                        image: skillListElement.querySelector('img').src,
                        name: skillTranslator(skillListElement.querySelector('strong').innerText),
                        info: skillListElement.querySelector('p span:last-child').innerText,
                    };
                }
            });
            skillData.push(singleSkillInfo);
        });
        return skillData
    },dictionary);

    await browser.close()

    return {stats : stats, engraving : engraving, skill : skills};
}

async function main(){ 
    var test = await get_stats()
    //console.log(util.inspect(test, false, null, true));
    console.log("Gesammelt")
    //console.log(test.skill.skill)
    //test.skill.forEach(skill => console.log(skill.skill));
    //console.log(JSON.stringify(test));

    // neues Zeug 
    const data = fs
        .readFileSync('./layouts/layout.ejs')
        .toString()
        .replace(/[\t\n]/g, '');

    const html = ejs.render(data, test);

    const options = {
        remarkable: {
            html: true,
            xhtmlOut: true,
        },
    };

    markdownpdf(options)
    .from.string(html)
    .to('./test.pdf', () => console.log('Done'));
}

main()