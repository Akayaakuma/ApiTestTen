const ejs = require('ejs');
const fs = require('fs');
const markdownpdf = require('markdown-pdf');

const data = fs
    .readFileSync('./layouts/layout.ejs')
    .toString()
    .replace(/[\t\n]/g, '');

const variables = {
    skills: [
        { name: 'Skill 1', level: 1, image: 'https://via.placeholder.com/50x50' },
        { name: 'Skill 2', level: 2, image: 'https://via.placeholder.com/50x50' },
        { name: 'Skill 3', level: 3, image: 'https://via.placeholder.com/50x50' },
        { name: 'Skill 4', level: 4, image: 'https://via.placeholder.com/50x50' },
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