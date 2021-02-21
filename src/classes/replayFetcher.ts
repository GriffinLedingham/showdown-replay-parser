import * as cheerio from 'cheerio'
import * as request from 'request-promise'
import Parser from './parser'

class replayFetcher {
  constructor(format:string, numReplays: number, skip: number, server?: string) {
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

  fetchReplays(replaySlugs: Array<string>, format: string, server?: string) {
    const fs = require('fs')
    let promises = []
    let formatReplace = `/${format}-`
    if(server != null) {
      formatReplace = `/${server}-${format}-`
    }
    for(let i in replaySlugs) {
      let file = `./log_output/battle-${format}-${replaySlugs[i].replace(formatReplace,'')}.log.json`
      if (!fs.existsSync(file)) {
        if(file.indexOf('-/') > -1) continue;
        console.log(`New replay: ${file}`)
        promises.push(this.getReplay(replaySlugs[i], format, server))
      }
    }
    return Promise.all(promises)
  }

  getReplay(slug: string, format: string, server?: string) {
    let formatReplace = `/battle-${format}-`
    if(server != null) {
      formatReplace = `/${server}-${format}-`
    }
    return new Promise((resolve, reject) => {
      request(`https://replay.pokemonshowdown.com${slug}.log`)
      .then((htmlData) => {
        resolve({id: slug.replace(formatReplace,'').replace('.log.json',''), html: htmlData})
      })
    })
  }

  parseBodies(htmlArray: Array<string>, format: string) {
    for(let i in htmlArray) {
      let parser = new Parser(htmlArray[i]['html'].replace(/<\/?[^>]+(>|$)/g, ""))
      let id = htmlArray[i]['id'].replace(`/${format}-`, '')
      if(id.indexOf('-/') > -1) continue;
      parser.run(id, format)
    }
  }
}

export default replayFetcher
