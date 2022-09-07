const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

const url = 'https://www.therapie.de/therapeutensuche/ergebnisse/?ort=53117&abrechnungsverfahren=7&geschlecht=2&therapieangebot=1'
const urls = ['https://www.therapie.de/therapeutensuche/ergebnisse/?ort=53117&abrechnungsverfahren=7&geschlecht=2&therapieangebot=1','https://www.therapie.de/therapeutensuche/ergebnisse/?ort=53117&abrechnungsverfahren=7&therapieangebot=1&geschlecht=2&page=2']
var profileAdresses = []
var emailAdresses = []
let promises = []
var totalPages = 1

function decryptCharcode(n, start, end, offset) {
    n = n + offset;
    if (offset > 0 && n > end) {
        n = start + (n - end - 1);
    } else if (offset < 0 && n < start) {
        n = end - (start - n - 1);
    }
    return String.fromCharCode(n);
}
function decryptString(enc, offset) {
    var dec = "";
    var len = enc.length;
    var i;
    for (i = 0; i < len; i++) {
        var n = enc.charCodeAt(i);
        if (n >= 0x2B && n <= 0x3A) {
            dec += decryptCharcode(n, 0x2B, 0x3A, offset);
        } else if (n >= 0x40 && n <= 0x5A) {
            dec += decryptCharcode(n, 0x40, 0x5A, offset);
        } else if (n >= 0x61 && n <= 0x7A) {
            dec += decryptCharcode(n, 0x61, 0x7A, offset);
        } else {
            dec += enc.charAt(i);
        }
    }
    return dec;
}
app.get('/', function (req, res) {
    res.json('This is my webscraper')
})

app.get('/results', (req, res) => {
   /* for (i = 1; i <= totalPages; i++) {
        promises.push(
    axios(url+"&page="+i)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const articles = []
            $('.col-xs-12.no-padding-left-xs.no-padding-right-xs', html).each(function () { //<-- cannot be a function expression
                //const title = $(this).text()
                const url = $(this).find('a').attr('href')
                var adress = "https://www.therapie.de"+url
                articles.push({
                    //title,
                    url,
                    adress
                })
                profileAdresses.push(adress)
                //console.log(profileAdresses)
            })
            
            //res.json(articles)
        }).catch(err => console.log(err))
        )
    }
    */
    /*
    for (i = 0; i <= profileAdresses.length; i++) {
        promises.push(
    axios(profileAdresses[i])
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const articles = []
            
            $('.contact-mail', html).each(function () { //<-- cannot be a function expression
                //const title = $(this).text()
                const email = $(this).find('button').attr('data-contact-email')
                //var adress = "https://www.therapie.de"+url
                articles.push({
                    //title,
                    //url,
                    //adress
                    email
                })
                emailAdresses.push(decryptString(email,-1))
                console.log(decryptString(email,-1))
            })
            
            //res.json(articles)
        }).catch(err => console.log(err))
        )
    }
    */
    profileAdresses = getProfileAddresses()
    Promise.all(promises).then(() => res.json(profileAdresses));
})


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

function getProfileAddresses(){
    for (i = 1; i <= totalPages; i++) {
        promises.push(
    axios(url+"&page="+i)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const articles = []
            $('.col-xs-12.no-padding-left-xs.no-padding-right-xs', html).each(function () { //<-- cannot be a function expression
                //const title = $(this).text()
                const url = $(this).find('a').attr('href')
                var adress = "https://www.therapie.de"+url
                articles.push({
                    //title,
                    url,
                    adress
                })
                profileAdresses.push(adress)
                //console.log(profileAdresses)
            })
            
            //res.json(articles)
        }).catch(err => console.log(err))
        )
    }
    return profileAdresses;
}

