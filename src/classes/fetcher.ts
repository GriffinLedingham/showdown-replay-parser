import * as request from 'request-promise'
import Parser from './parser'

class fetcher {
  constructor() {

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
      console.log('---',file)
      console.log(server)
      console.log(formatReplace)
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
    console.log(slug.replace(formatReplace,'').replace('.log.json',''))
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

export default fetcher
