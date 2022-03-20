const markdownpdf = require('markdown-pdf');

const skillData = [
    { name: 'Fast Speed', engraving: 3, src: 'https://static.loawa.com/seals/090.png' },
    { name: 'Grudge', engraving: 3, src: 'https://static.loawa.com/seals/058.png' },
    { name: 'Cursed Doll', engraving: 3, src: 'https://static.loawa.com/seals/061.png' },
    { name: 'Master of Strike', engraving: 3, src: 'https://static.loawa.com/seals/087.png' },
    { name: 'Reflux', engraving: 3, src: 'https://static.loawa.com/seals/095.png' },
    { name: 'Adrenaline', engraving: 3, src: 'https://static.loawa.com/seals/089.png' },
];

const tableContent = skillData.map(({ name, engraving, src }) => `
<tr>
    <th scope="row">${name}</th>
        <td>${engraving}</td>
        <td>
        <img src="${src}" alt="${name}" width="20" height="20" />
    </td>
</tr>`).join('\n');

const layout = `
<link
href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
rel="stylesheet"
integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
crossorigin="anonymous"
/>

<table class="table">
    <thead>
        <tr>
            <th scope="col">Skill</th>
            <th scope="col">Level</th>
            <th scope="col">Icon</th>
        </tr>
    </thead>
    <tbody>
        ${tableContent}
    </tbody>
</table>
`;

const options = {
    remarkable: {
        html: true,
        xhtmlOut: true,
    },
};

markdownpdf(options)
    .from.string(layout)
    .to('./test.pdf', () => console.log('Done'));