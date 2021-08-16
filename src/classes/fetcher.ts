import * as request from 'request-promise'
import Parser from './parser'
const fs = require('fs')
const AWS = require('aws-sdk')
const ENV = process.env

const ID = ENV.aws_id
const SECRET = ENV.aws_secret
const BUCKET_NAME = ENV.s3_bucket

const IS_AWS = ID && SECRET && BUCKET_NAME

let s3 = null
if(IS_AWS) {
  s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
  });
}

class fetcher {
  constructor() {

  }

  async fetchReplays(replaySlugs: Array<string>, format: string, server?: string) {
    let promises = []
    let formatReplace = `/${format}-`
    if(server != null) {
      formatReplace = `/${server}-${format}-`
    }
    for(let i in replaySlugs) {
      let file = `./log_output/battle-${format}-${replaySlugs[i].replace(formatReplace,'')}.log.json`
      if (!IS_AWS && !fs.existsSync(file)) {
        if(file.indexOf('-/') > -1) continue;
        console.log(`New replay: ${file}`)
        promises.push(this.getReplay(replaySlugs[i], format, server))
      } else if(IS_AWS && s3 != null) {
        const dt = new Date();
        const dateString = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate()
        const params = {
          Bucket: BUCKET_NAME,
          Key: `battle-${format}/${dateString}/battle-${format}-${replaySlugs[i].replace(formatReplace,'')}.log.json`
        }
        try {
          const s3Response = await s3.headObject(params).promise()//.catch(() => null)
        } catch(err) {
          console.log(`New replay: ${file}`)
          promises.push(this.getReplay(replaySlugs[i], format, server))
        }
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
