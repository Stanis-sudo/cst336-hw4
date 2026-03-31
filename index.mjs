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
    { name: "Home", url: "/", fileName: 'index' },
    { name: "OS Components", url: "/components", fileName: 'components' },
    { name: "OS Types", url: "/os-types", fileName: 'os-types' },
    { name: "Popular OS", url: "/popular-os", fileName: 'popular-os' },
    { name: "Sys Info", url: "/sys-info", fileName: "sys-info" }
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

// app.get(navLinks[4].url, async (req, res) => {
//         try {
//         let cpuInfo = await si.cpu();
//         let osInfo = await si.osInfo();
//         let biosInfo = await si.bios();
//         let baseboardInfo = await si.baseboard();
//         let systemInfo = await si.system();

//         console.log(cpuInfo);
//         console.log(osInfo);
//         console.log(biosInfo);
//         console.log(baseboardInfo);
//         console.log(systemInfo);

//         res.render(navLinks[4].fileName, {
//             navLinks: getNavLinks(navLinks[4].name),
//             cpuInfo: cpuInfo,
//             osInfo: osInfo,
//             biosInfo: biosInfo,
//             baseboardInfo: baseboardInfo,
//             systemInfo: systemInfo
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error loading OS info");
//     }
// });

app.get(navLinks[4].url, (req, res) => {
    res.render(navLinks[4].fileName, { navLinks: getNavLinks(navLinks[4].name) });
});

app.get('/nodePackage/getData/', async (req, res) => {
    try {
        let cpuInfo = await si.cpu();
        let osInfo = await si.osInfo();
        let biosInfo = await si.bios();
        let baseboardInfo = await si.baseboard();
        let memInfo = await si.mem();
        let memLayoutInfo = await si.memLayout();

        // console.log(cpuInfo);
        // console.log(osInfo);
        // console.log(biosInfo);
        // console.log(baseboardInfo);
        // console.log(memInfo);
        // console.log(memLayoutInfo);

        const totalRam = memLayoutInfo.reduce((sum, stick) => sum + stick.size, 0);

        const stickCount = memLayoutInfo.length;
        const stickSize = memLayoutInfo[0]?.size || 0;
        const type = memLayoutInfo[0]?.type || 'Unknown';
        const speed = memLayoutInfo[0]?.clockSpeed || 'Unknown';

        // Convert bytes → GB
        const totalGB = (totalRam / 1073741824).toFixed(0);
        const stickGB = (stickSize / 1073741824).toFixed(0);

        const ramSummary = `${totalGB} GB (${stickCount} × ${stickGB} GB) ${type} @ ${speed} MHz`;

        res.json({
            cpuInfo: cpuInfo,
            osInfo: osInfo,
            biosInfo: biosInfo,
            baseboardInfo: baseboardInfo,
            ramSummary: ramSummary
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Could not load server info');
    }
});

app.listen(3000, () => {
    console.log('server started');
});