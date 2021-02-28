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
      replaySlugs.push(sheetData[i].replay.replace('https://replay.pokemonshowdown.com', ''))
    }
    return replaySlugs
  }

  fetchSheetReplays(replaySlugs: Array<string>, format: string, server?: string) {
    this.fetchReplays(replaySlugs, format, server)
    .then((htmlArray) => this.parseBodies(htmlArray, format))
  }
}

export default sheetFetcher
