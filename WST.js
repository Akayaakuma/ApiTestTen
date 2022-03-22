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
                runes: [],
                
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
                        SRune : {
                            RuneOne: skillTranslator(skillListElement.querySelector('.skill-tripod-summary > span.d-block.ms-1.text-grade2').textContent),
                            RuneTwo: skillTranslator(skillListElement.querySelector('.skill-tripod-summary > span.d-block.ms-1.text-grade1').textContent),
                            RuneTree: skillTranslator(skillListElement.querySelector('.skill-tripod-summary > span.d-block.ms-1.text-grade4').textContent),
                        },
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
                    singleSkillInfo.runes.push({
                        image: skillListElement.querySelector('img').src,
                        name: skillTranslator(skillListElement.querySelector('strong').innerText),
                        info: skillListElement.querySelector('p span:last-child').innerText,
                    });
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
    console.log(util.inspect(test, false, null, true));
    console.log("Gesammelt")
    console.log(test.skill[0].runes[0].image)

    // neues Zeug 
    const data = fs
        .readFileSync('./layouts/layout.ejs')
        .toString()
        .replace(/[\t\n]/g, '');

    const variables = {
        skills: [
            { name: test.skill[0].skill.name, level: test.skill[0].skill.level, image: test.skill[0].skill.image, srune: test.skill[0].skill.SRune, Gem1: test.skill[0].gems[0].image, rune: test.skill[0].runes[0].image, nrune: test.skill[0].runes[0].name },
            { name: test.skill[1].skill.name, level: test.skill[1].skill.level, image: test.skill[1].skill.image, srune: test.skill[1].skill.SRune, Gem1: test.skill[1].gems[0].image, rune: test.skill[1].runes[0].image, nrune: test.skill[1].runes[0].name },
            { name: test.skill[2].skill.name, level: test.skill[2].skill.level, image: test.skill[2].skill.image, srune: test.skill[2].skill.SRune, Gem1: test.skill[2].gems[0].image, rune: test.skill[2].runes[0].image, nrune: test.skill[2].runes[0].name },
            { name: test.skill[3].skill.name, level: test.skill[3].skill.level, image: test.skill[3].skill.image, srune: test.skill[3].skill.SRune, Gem1: test.skill[3].gems[0].image, rune: test.skill[3].runes[0].image, nrune: test.skill[3].runes[0].name },
            { name: test.skill[4].skill.name, level: test.skill[4].skill.level, image: test.skill[4].skill.image, srune: test.skill[4].skill.SRune, Gem1: test.skill[4].gems[0].image, rune: test.skill[4].runes[0].image, nrune: test.skill[4].runes[0].name },
            { name: test.skill[5].skill.name, level: test.skill[5].skill.level, image: test.skill[5].skill.image, srune: test.skill[5].skill.SRune, Gem1: test.skill[5].gems[0].image, rune: test.skill[5].runes[0].image, nrune: test.skill[5].runes[0].name },
            //{ name: test.skill[6].skill.name, level: test.skill[6].skill.level, image: test.skill[6].skill.image, srune: test.skill[6].skill.SRune, Gem1: test.skill[6].gems[0].image, rune: test.skill[6].runes[0].image, nrune: test.skill[6].runes[0].name },
            //{ name: test.skill[7].skill.name, level: test.skill[7].skill.level, image: test.skill[7].skill.image, srune: test.skill[7].skill.SRune, Gem1: test.skill[7].gems[0].image, rune: test.skill[7].runes[0].image, nrune: test.skill[7].runes[0].name },
        ],
        Stats: [
            { name: test.stats[0].stat, value: test.stats[0].value },
            { name: test.stats[1].stat, value: test.stats[1].value },
            { name: test.stats[2].stat, value: test.stats[2].value },
            { name: test.stats[3].stat, value: test.stats[3].value },
            { name: test.stats[4].stat, value: test.stats[4].value },
            { name: test.stats[5].stat, value: test.stats[5].value },

        ],
        engraving: [
            { name: test.engraving[0].text, lev: test.engraving[0].level, image: test.engraving[0].image },
            { name: test.engraving[1].text, lev: test.engraving[1].level, image: test.engraving[1].image },
            { name: test.engraving[2].text, lev: test.engraving[2].level, image: test.engraving[2].image },
            { name: test.engraving[3].text, lev: test.engraving[3].level, image: test.engraving[3].image },
            { name: test.engraving[4].text, lev: test.engraving[4].level, image: test.engraving[4].image },
            { name: test.engraving[5].text, lev: test.engraving[5].level, image: test.engraving[5].image },

        ],
    };

    const html = ejs.render(data, variables);

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