import request from 'request';
import cheerio from  'cheerio';
import fs from 'fs';

request('http://www.imdb.com/chart/moviemeter', (err, res, body) => {
    if (err) console.log('Error' + err);

    const $ = cheerio.load(body);

    $('.lister-list tr').each(function() {
        const title = $(this).find('.titleColumn a').text().trim();
        const rating = $(this).find('.imdbRating strong').text().trim();

        console.log(title, '-', rating)
        fs.appendFileSync('best-movies.txt', `${title} ${rating}\n`);
    })

})