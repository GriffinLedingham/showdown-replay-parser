export default (function() : {skip: number, format: string, num: number, server?: string, source: string} {
    let skip = null, format = null, num = null, server = null, source = null
    const args = process.argv
    for(let arg in args) {
      if(args[arg].indexOf('--format') != -1) {
        format = args[parseInt(arg)+1]
      }
      if(args[arg].indexOf('--source') != -1) {
        source = args[parseInt(arg)+1]
      }
      if(args[arg].indexOf('--skip') != -1) {
        skip = args[parseInt(arg)+1]
      }
      if(args[arg].indexOf('--num-logs') != -1) {
        num = args[parseInt(arg)+1]
      }
      if(args[arg].indexOf('--server') != -1) {
        server = args[parseInt(arg)+1]
      }
    }
    return {skip, format, num, server, source}
  })()