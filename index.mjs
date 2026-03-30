import express from 'express';
import fetch from 'node-fetch';
import { get } from 'node:http';
import path from 'node:path';
// const planets = (await import('npm-solarsystem')).default;
const si = (await import('systeminformation')).default;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

var navLinks = [
    { name: "Home", url: "/" , fileName: 'index'},
    { name: "OS Components", url: "/components", fileName: 'components'},
    { name: "OS Types", url: "/os-types", fileName: 'os-types' },
    { name: "Popular OS", url: "/popular-os", fileName: 'popular-os' },
    { name: "OS History", url: "/os-history", fileName: "os-history" }
]

const popularOS = [
    { name: "Windows", title: "Microsoft_Windows" },
    { name: "Linux", title: "Linux" },
    { name: "MacOS", title: "macOS" },
    { name: "Android", title: "Android_(operating_system)" },
    { name: "Ios", title: "IOS" }
];


function getNavLinks(activePage) {
    let result = '';
    for (let link of navLinks) {
        let linkClass = link.name === activePage ? 'class="selected"' : '';
        result += `<a href="${link.url}" ${linkClass}>${link.name}</a>`;
    }
    return result;
}

app.get(navLinks[0].url, async (req, res) => {
    res.render(navLinks[0].fileName, { navLinks: getNavLinks(navLinks[0].name) });
});


app.get(navLinks[1].url, (req, res) => {
    res.render(navLinks[1].fileName, { navLinks: getNavLinks(navLinks[1].name) });
});

app.get(navLinks[2].url, (req, res) => {
    res.render(navLinks[2].fileName, { navLinks: getNavLinks(navLinks[2].name) });
});

app.get(navLinks[3].url, async (req, res) => {
    try {
        const wikiEntries = await Promise.all(
            popularOS.map(async (os) => {
                const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${os.title}`;
                const response = await fetch(wikiUrl);
                const data = await response.json();

                return {
                    key: os.name,
                    value: {
                        extract_html: data.extract_html,
                        title: data.title,
                        thumbnail: data.thumbnail?.source || null
                    }
                };
            })
        );

        const wikiData = Object.fromEntries(
            wikiEntries.map(entry => [entry.key, entry.value])
        );

        res.render(navLinks[3].fileName, {
            navLinks: getNavLinks(navLinks[3].name),
            wikiData
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading page");
    }
});

app.get(navLinks[4].url, async (req, res) => {
        try {
        let cpuInfo = await si.cpu();
        let osInfo = await si.osInfo();

        console.log(cpuInfo);
        console.log(osInfo);

        res.render(navLinks[4].fileName, {
            navLinks: getNavLinks(navLinks[4].name),
            cpuInfo: cpuInfo,
            osInfo: osInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading OS info");
    }
});

app.listen(3000, () => {
    console.log('server started');
});