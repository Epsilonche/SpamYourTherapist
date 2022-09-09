const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

const url = 'https://www.therapie.de/therapeutensuche/ergebnisse/?ort=53117&abrechnungsverfahren=7&geschlecht=2&therapieangebot=1'
const baseUrl = 'https://www.therapie.de/therapeutensuche/ergebnisse/?'
const RESULTS_PER_PAGE = 15


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

app.get('/', function (req, res) {
    res.json('This is my webscraper')
})

app.get('/search', async function(req, res) {

    var filterString = new URLSearchParams(req.query).toString()
    var profileAdresses = []
    profileAdresses = await getProfileAddresses(baseUrl+filterString)
    var emailList = []
    emailList =await getEmailAdressesFromLinks(profileAdresses)
    res.send(emailList)

});

app.get('/pages', async function(req, res) {
    var resultCountString =await getNumberOfResults(url);
    var pageNum = Math.ceil(resultCountString/RESULTS_PER_PAGE)
    res.send(""+pageNum)
});


app.get('/emails',async (req, res) => {
    var profileAdresses = []
    profileAdresses = await getProfileAddresses(url)
    var emailList = []
    emailList =await getEmailAdressesFromLinks(profileAdresses)
    res.send(emailList)
})

app.get('/profiles',async (req,res)=>{
    var profileAdresses = []
    profileAdresses = await getProfileAddresses(url)
    res.send(profileAdresses)
})

async function getProfileAddresses(url){
    //var totalPages = await getNumberOfPages(url)
    var totalPages = 2;
    var numberOfResults = await getNumberOfResults(url)
    totalPages = Math.ceil(numberOfResults / RESULTS_PER_PAGE)
    var profileAdresses = []
    for (i = 1; i <= totalPages; i++) {
    await axios(url+"&page="+i)
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
                if(adress!="" && adress!=null && adress!="https://www.therapie.deundefined")
                    profileAdresses.push(adress)
                
            })
            //res.json(articles)
        }).catch(err => console.log(err))
    }
    return profileAdresses
    //Promise.all(promises).then(() => {return "profileAdresses"})
}

async function getEmailAdressesFromLinks(links){
    var emailAdresses = []
    for (i = 0; i < links.length; i++) {
    await axios(links[i])
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const articles = []
            
            $('.contact-mail', html).each(function () { //<-- cannot be a function expression
                const email = $(this).find('button').attr('data-contact-email')
                emailAdresses.push(decryptString(email,-1))
            })
            
            //res.json(articles)
        }).catch(err => console.log(err))
        
    }
    return emailAdresses
}
async function getNumberOfResults(url){
    var resultCountString
    await axios(url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            $('.results-label.clearfix', html).each(function () { //<-- cannot be a function expression
                resultCountString = $(this).find('h2').text()
            })
        }).catch(err => console.log(err))

    var resultCountArray = resultCountString.split(' ')
    var numberOfResults = resultCountArray[0]

    return numberOfResults
}

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
serialize = function(obj) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
}