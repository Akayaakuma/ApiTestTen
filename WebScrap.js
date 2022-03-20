const puppeteer = require('puppeteer')
const fs = require('fs/promises')

async function get_stats(){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://loawa.com/char/%EC%A0%9C%EC%9E%90") //https://loawa.com/char/%EB%9D%BC%EB%B8%94%EB%A3%A8%EC%86%8C%EC%84%9C
    
    const stats = await page.evaluate(() =>{
        const ausgabe = [];
        for (let i = 4; i < 7; i++) {
            ausgabe.push(Array.from(document.querySelectorAll(`#abasic-tab > div > div.qul-box.qul-box-1.col-5.col-sm-5.col-md-4 > div > div:nth-child(${i})`)).map(x => x.textContent));
          }
        return ausgabe  
    })
    await browser.close()
    return stats
}

async function main(){
    console.info(await get_stats());
}
main()