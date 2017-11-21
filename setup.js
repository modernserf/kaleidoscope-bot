const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const baseURL = 'https://web.archive.org/web/20130524161815fw_/http://www.kaleidoscope.net:80/cgi-bin/'

function get(url, options = {}) {
    options.url = url
    return new Promise((resolve, reject) => request.get(options, (err, _, body) => {
        if (err) { reject(err) } else { resolve(body) }
    }))
}

function sleep(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout))
}

function sequence (timeout, thunks) {
    const [head, ...tail] = thunks
    if (!tail.length) { return head().then((result) => [result]) }

    return head().then((headResult) =>
        sleep(timeout).then(() =>
            sequence(timeout, tail).then((tailResults) =>
                [headResult].concat(tailResults))))
}

function matchHrefs(body, pattern) {
    const $ = cheerio.load(body)
    return $('a').map((i, el) => $(el).attr('href')).get()
        .filter((href) => href.match(pattern))
}

function getArchivePages (body) {
    const archiveLinks = matchHrefs(body, /schemes.cgi\?archive=\w/)
    console.log("links", archiveLinks)
    return archiveLinks
}

function getAuthorPages (body) {
    const authorLinks = matchHrefs(body, /schemes.cgi\?author=\w+/)
    console.log("authors", authorLinks)
    return authorLinks
}

function flatten (arrs) {
    return arrs.reduce((l, r) => l.concat(r))
}

function getImageName (src) {
    return src.match(/screensnapz\/(.+.gif)$/)[1]
}

function saveImage (src, name) {
    request('https://web.archive.org' + src).pipe(fs.createWriteStream('img/' + name))
    runQueue()
}

function saveResults (data) {
    const str = ',\n' + JSON.stringify(data)
    fs.appendFile('output.json', str, (err) => {
        if (err) { console.error(err) }
    })
}

function getThemeData (body) {
    const $ = cheerio.load(body)
    const authorName = $('title').text().replace('Creations by ', '')
    return $('table[width="549"]')
        .filter((i, el) => $(el).find('table[width="255"]').length)
        .map((i, table) => {
            const themeName = $(table).find('table[width="255"] font[size="5"]').text().trim()

            const imageSrc = $(table).find('img')
                .map((i, img) => $(img).attr('src')).get()
                .find((src) => src.match(/screensnapz/))

            console.log({ themeName, imageSrc, authorName })
            return { themeName, imageSrc, authorName }
         }).get()
}

function run() {
    console.log('starting...')
    get(baseURL + 'schemes.cgi')
    .then(getArchivePages)
    .then((archiveLinks) => {
        const pageThunks = archiveLinks.map((link) => () => {
            console.log('fetching page', link)
            return get(baseURL + link).then(getAuthorPages)
        })
        return sequence(1000, pageThunks)
    })
    .then((authorPages) => {
        authorPages = flatten(authorPages)
        console.log({authorPages})
        const themeThunks = authorPages.map((authorLink) => () => {
            console.log('fetching page', authorLink)
            return get(baseURL + authorLink).then(getThemeData).then((themes) =>
                themes.map((themeData) => Object.assign({ authorLink }, themeData)))
        })
        return sequence(1000, themeThunks)
    })
    .then((results) => {
        results = flatten(results)
        console.log('writing data')
        fs.writeFileSync('output.json', JSON.stringify({ results }))
        return results
    }).then((results) => {
        console.log({ results })
        const imageThunks = results.map(({ imageSrc }) => () => {
            const filename = 'img/' + getImageName(imageSrc)
            // don't download image if it was already downloaded successfully
            if (fs.existsSync(filename)) { return Promise.resolve() }

            console.log('downloading', imageSrc)
            return get('https://web.archive.org' + imageSrc, { encoding: null }).then((body) => {
                fs.writeFileSync(filename, body)
            })
        })
        return sequence(1000, imageThunks)
    }).catch((err) => {
        console.error('WHA HAPPEN', err)
    })
}

process.on('unhandledRejection', err => {
  console.log('unhandledRejection', err);
});

run()
