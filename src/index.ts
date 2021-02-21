import replayFetcher from './classes/replayFetcher'
import args from './util/args'

const { skip, format, num, server }  = args
const numRecords = num

function fetchData() {
  console.log('Fetching...')
  const fetcher = new replayFetcher(format, numRecords, skip, server)
  setTimeout(()=>{
    fetchData()
  },60000)
}

fetchData()