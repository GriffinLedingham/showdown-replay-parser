import Fetcher from './fetcher'

class sheetFetcher extends Fetcher {
  constructor(sheetData, format:string, server?: string) {
    super()
    const replaySlugs = this.processSheetData(sheetData)
    this.fetchSheetReplays(replaySlugs, format, server)
  }

  processSheetData(sheetData: Array<{[key: string]: string, replay: string}>): Array<string> {
    const replaySlugs = []
    console.log(sheetData)
    for(let i in sheetData) {
      if(sheetData[i].replay1.indexOf('pokemonshowdown') > -1) {
        replaySlugs.push(sheetData[i].replay1.replace('https://replay.pokemonshowdown.com', ''))
      }
      if(sheetData[i].replay2.indexOf('pokemonshowdown') > -1) {
        replaySlugs.push(sheetData[i].replay2.replace('https://replay.pokemonshowdown.com', ''))
      }
      if(sheetData[i].replay3.indexOf('pokemonshowdown') > -1) {
        replaySlugs.push(sheetData[i].replay3.replace('https://replay.pokemonshowdown.com', ''))
      }
    }
    return replaySlugs
  }

  fetchSheetReplays(replaySlugs: Array<string>, format: string, server?: string) {
    this.fetchReplays(replaySlugs, format, server)
    .then((htmlArray) => this.parseBodies(htmlArray, format))
  }
}

export default sheetFetcher
