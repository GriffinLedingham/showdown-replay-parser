import * as cheerio from 'cheerio'
import * as request from 'request-promise'
import Fetcher from './fetcher'

class replayFetcher extends Fetcher {
  constructor(format:string, numReplays: number, skip: number, server?: string) {
    super()
    for(let i = (Math.floor(skip/50)+1);i<(Math.ceil(numReplays/50)+1+(Math.floor(skip/50)+1));i++){
      this.fetchPage(format, i)
      .then((html) => this.scrapePage(html))
      .then((replaySlugs) => this.fetchReplays(replaySlugs, format, server))
      .then((htmlArray) => this.parseBodies(htmlArray, format))
    }
  }

  fetchPage(format: string, pageNum: number) {
    return request(`https://replay.pokemonshowdown.com/search?user=&format=${format}&page=${pageNum}&output=html`)
  }

  scrapePage(html: string) {
    return new Promise((resolve, reject) => {
      const $ = cheerio.load(html)

      let slugs = []
      $('li a').each(function(i, elem) {
        slugs.push($(this).attr('href'))
      })
      resolve(slugs)
    })
  }
}

export default replayFetcher
