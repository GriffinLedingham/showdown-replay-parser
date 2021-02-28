import replayFetcher from './classes/replayFetcher'
import sheetFetcher from './classes/sheetFetcher'
import args from './util/args'
import * as config from '../config.js'
import * as fetch from 'node-fetch'

const { skip, format, num, server, source }  = args

if(format == null) throw new Error('Format undefined.')

const numRecords = num

function fetchLiveData() {
  if(skip == null) throw new Error('Skip undefined.')
  if(num == null) throw new Error('Num replays undefined.')
  console.log('Fetching...')
  const fetcher = new replayFetcher(format, numRecords, skip, server)
  setTimeout(()=>{
    fetchLiveData()
  },60000)
}

function fetchSheetData() {
  const sheetAPI = config.sheetAPI
  if(sheetAPI == undefined) throw new Error('No Sheet API defined, check your /config.js')
  fetch(
    sheetAPI
  ).then((response) => {
    if (response.status !== 200) {
      throw new Error(
        "Looks like there was a problem. Status Code: " + response.status
      );
    } else {
      // Examine the text in the response
      response.json().then(function(data) {
        new sheetFetcher(data, format, server);
      });
    }
  });
}

switch(source) {
  case 'live':
    fetchLiveData()
    break
  case 'sheet':
    fetchSheetData()
    break
  default:
    throw new Error('Invalid source.')
}