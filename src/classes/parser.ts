import * as jsonfile from 'jsonfile'

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

class PokemonShowdownReplayParser {
  log = ""
  players = {}
  winner = ""

  constructor(log) {
    this.log = log
    this.players["p1"] = new Player("p1")
    this.players["p2"] = new Player("p2")
  }

  buildOutput(jsonData) {
    let returnData = {
      "winner": (this.winner == this.players["p1"].username)?"p1":"p2",
      "seed": [
        33310,
        33343,
        43475,
        6325
      ],
      "turns": 13,
      "p1": "p1",
      "p2": "p2",
      "p1team": [],
      "p2team": [],
      "p1rating": {
        "r": 1500,
        "rd": 130,
        "rpr": 1500,
        "rprd": 130,
        "rptime": 1535360400,
        "w": 0,
        "l": 0,
        "t": 1,
        "gxe": 50,
        "elo": 1000,
        "col1": 1,
        "oldelo": 1000,
        "userid": "p1"
      },
      "p2rating": {
        "entryid": "37458198",
        "userid": "p2",
        "r": 1500,
        "rd": 130,
        "rpr": 1540.1606143388,
        "rprd": 130,
        "rptime": 1535360400,
        "w": 1,
        "l": 0,
        "t": 0,
        "gxe": 50,
        "elo": 1040,
        "col1": 1,
        "oldelo": 1000
      },
      "log": [
        "|win|winnerwinner"
      ]
    }

    let pokemonList = []
    for(let i in jsonData.p1) {
      let pokemonItem = {
        "name": "",
        "species": "",
        "item": "",
        "ability": "",
        "moves": [

        ],
        "nature": "",
        "evs": {
          "hp": 0,
          "atk": 0,
          "def": 0,
          "spa": 0,
          "spd": 0,
          "spe": 0
        },
        "level": 50,
        "ivs": {
          "hp": 0,
          "atk": 0,
          "def": 0,
          "spa": 0,
          "spd": 0,
          "spe": 0
        }
      }

      pokemonItem.name = jsonData.p1[i].species
      pokemonItem.species = jsonData.p1[i].species
      for(let moveName in jsonData.p1[i]['moves']) {
        pokemonItem.moves.push(moveName.replace(/ /g,'').replace(/-/g,'').toLowerCase())
      }
      pokemonItem.item = jsonData.p1[i].item
      pokemonItem.ability = jsonData.p1[i].ability
      pokemonList.push(pokemonItem)

    }
    returnData.p1team = pokemonList

    let pokemonList2 = []
    for(let i in jsonData.p2) {
      let pokemonItem = {
        "name": "",
        "species": "",
        "item": "",
        "ability": "",
        "moves": [

        ],
        "nature": "",
        "evs": {
          "hp": 0,
          "atk": 0,
          "def": 0,
          "spa": 0,
          "spd": 0,
          "spe": 0
        },
        "level": 50,
        "ivs": {
          "hp": 0,
          "atk": 0,
          "def": 0,
          "spa": 0,
          "spd": 0,
          "spe": 0
        }
      }

      pokemonItem.name = jsonData.p2[i].species
      pokemonItem.species = jsonData.p2[i].species
      for(let moveName in jsonData.p2[i]['moves']) {
        pokemonItem.moves.push(moveName.replace(/ /g,'').replace(/-/g,'').toLowerCase())
      }
      pokemonItem.item = jsonData.p2[i].item
      pokemonItem.ability = jsonData.p2[i].ability
      pokemonList2.push(pokemonItem)
    }
    returnData.p2team = pokemonList2

    return returnData
  }

  run(id: string, format: string)
  {
    this.parse()

    let output = {
      p1: this.players["p1"].getTeam(),
      p2: this.players["p2"].getTeam()
    }

    const file = `./log_output/battle-${format}-${id}.log.json`

    var fs = require('fs');
    if (!IS_AWS && !fs.existsSync(file)) {
      console.log(`Writing file: ${file}`)

      jsonfile.writeFile(file, this.buildOutput(output), function (err) {
        if (err) console.error(err)
      })
    } else if(IS_AWS) {
      console.log(`Uploading file: ${file}`)
      const dt = new Date();
      const dateString = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate()

      // write to s3
      const params = {
        Bucket: BUCKET_NAME,
        Key: `battle-${format}/${dateString}/battle-${format}-${id}.log.json`,
        Body: JSON.stringify(this.buildOutput(output))
      };

      // Uploading files to the bucket
      s3.upload(params, function(err, data) {
          if (err) {
              throw err;
          }
          console.log(`File uploaded successfully. ${data.Location}`);
      });
    }
  }

  parse()
  {
    let lines = this.log.split('\n')
    for(let i = 0; i < lines.length; i++){
      let line = lines[i]
      if(line.startsWith("|player|") )
      {
        this.processPlayer(line)
      }
      if(line.startsWith("|win|") )
      {
        this.processWinner(line)
      }
      if (line.startsWith("|poke|"))
      {
        this.processPoke(line)
      }
      if (line.startsWith("|move|"))
      {
        this.processMove(line)
      }
      if (line.startsWith("|-ability|"))
      {
        this.processAbility(line)
      }
      if (line.startsWith("|switch|"))
      {
        this.processSwitch(line)
      } if (line.startsWith("|drag|"))
      {
        // this.processDrag(line)
      }
      if (line.startsWith("|-mega|"))
      {
        this.processMega(line)
      }
      if(line.startsWith("|detailschange|"))
      {
        this.processDetailsChange(line)
      }
      //if(line.startsWith("|-item|"))
      //{
      //    this.processItem(line)
      //    }
      if(line.startsWith("|-enditem|"))
      {
        this.processEndItem(line)
      }
      if(line.includes("|[from] move:"))
      {
        if(line.startsWith("|-item|"))
        {
          this.processItemFromMove(line)
        }
      }
      if(line.includes("|[from] item:"))
      {
        this.processHealthChangeFromItem(line)
      }
      if(line.includes("[from] ability: "))
      {
        if(line.startsWith("|-weather|"))
        {
          this.processWeatherFromAbility(line)
        }
        if(line.includes('|-heal|'))
        {
          this.processAbilityFromHeal(line)
        }
        else
        {
          this.processAbilityFromAction(line)
        }
      }
    }
  }

  processPlayer(line)
  {
    let fields = line.split("|")

    if(fields.length >= 4)
    {
      this.players[fields[2]].username = fields[3]
    }
  }

  processWinner(line)
  {
    let fields = line.split("|")

    if(fields.length >= 3)
    {
      this.winner = fields[2]
    }
  }

  processPoke(line)
  {
    let fields = line.split("|")

    let pokemon = new Pokemon()
    pokemon.species = fields[3].replace(/,.*$/, "")
    this.players[fields[2]].pokemon.push(pokemon)
  }


  processSwitch(line)
  {
    let matches = line.match(/\|switch\|(p[12])[ab]:\s+([^|]+)\|([^,|]+)/)
    if(matches == null) return
    let player = matches[1]
    let nickname = matches[2]
    let species = matches[3]

    let pokemon = this.players[player].getPokemonBySpecies(species)
    if(pokemon == null)
    {
      pokemon = new Pokemon()
      pokemon.species = species
      this.players[player].pokemon.push(pokemon)
    }
    pokemon.nickname = nickname
    this.players[player].currentPokemon = pokemon

  }

  // |move|PLAYER: NICKNAME|MOVE|PLAYER: NICKNAME
  // |move|p1a: Greninja|Ice Beam|p2a: Azumarill
  processMove(line)
  {
    let matches = line.match(/\|move\|(p[12])[ab]:\s+([^|]+)\|([^|]+)/)
    let player = matches[1]
    let nickname = matches[2]
    let move = matches[3]

    let pokemon = this.players[player].getPokemonByNickname(nickname)
    if(pokemon == undefined) return false
    pokemon.moves[move] = 1
  }

  // |-ability|p1a: Landorus|Intimidate|boost
  // [from] ability: Clear Body|[of] p2a: Dragapult
  processAbility(line)
  {
    let matches = line.match(/\|-ability\|(p[12])[ab]:\s+([^|]+)\|([^|]+)/)
    let player = matches[1]
    let nickname = matches[2]
    let ability = matches[3]

    let pokemon = this.players[player].getPokemonByNickname(nickname)
    if(pokemon == undefined) return false
    pokemon.ability = ability
  }

  processAbilityFromAction(line)
  {
    let ability = null
    let player = null
    let nickname = null

    let matches = line.match(/\[from\]\sability\:\s+([^|]+)\|\[of\]\s(p[12])[ab]\:\s+([^|]+)/)
    if(matches !== null) {
      ability = matches[1]
      player = matches[2]
      nickname = matches[3]
    }

    if(matches === null) {
      matches = line.match(/\|(p[12])[ab]:\s+([^|]+)(\|[^|]+)?\|\[from\] ability: (.+)/)
      if(matches !== null) {
        player = matches[1]
        nickname = matches[2]
        ability = matches[4]
      }
    }

    //|-formechange|p1b: Aegislash|Aegislash-Blade||[from] ability: Stance Change
    if(matches === null) {
      matches = line.match(/\|(p[12])[ab]:\s+([^|]+)(\|[^|]+)?\|\|\[from\] ability: (.+)/)
      if(matches !== null) {
        player = matches[1]
        nickname = matches[2]
        ability = matches[4]
      }
    }

    //|-formechange|p2a: Cherrim|Cherrim-Sunshine|[msg]|[from] ability: Flower Gift
    if(matches === null) {
      matches = line.match(/\|(p[12])[ab]:\s+([^|]+)(\|[^|]+)?\|\[msg\]\|\[from\] ability: (.+)/)
      if(matches !== null) {
        player = matches[1]
        nickname = matches[2]
        ability = matches[4]
      }
    }

    // |-start|p2a: Cinderace|typechange|Steel|[from] ability: Libero
    if(matches === null) {
      matches = line.match(/\|(p[12])[ab]:\s+([^|]+)(\|typechange)?(\|[^|]+)?\|\[from\] ability: (.+)/)
      if(matches !== null) {
        player = matches[1]
        nickname = matches[2]
        ability = matches[4]
      }
    }

    // |-setboost|p1b: Krookodile|atk|12|[from] ability: Anger Point
    if(matches === null) {
      matches = line.match(/\|(p[12])[ab]:\s+([^|]+)(\|[a-z]+)?(\|[0-9]+)?\|\[from\] ability: (.+)/)
      if(matches !== null) {
        player = matches[1]
        nickname = matches[2]
        ability = matches[5]
      }
    }

    if(matches === null) {
      console.log(`NULL MATCH FROM ABILITY - ${line}`)
    }

    if(nickname != null) {
      let pokemon = this.players[player].getPokemonByNickname(nickname)
      if(pokemon == undefined) return false
      pokemon.ability = ability
    }
  }

  // |-mega|p2a: Venusaur|Venusaur|Venusaurite
  processMega(line)
  {
    let matches = line.match(/\|-mega\|(p[12])[ab]:\s+([^|]+)\|([^|]+)\|(.+)/)
    if (matches == null)
            return;
    let player = matches[1]
    let nickname = matches[2]
    //let species = matches[3]
    let megastone = matches[4]

    let pokemon = this.players[player].getPokemonByNickname(nickname)
    if(pokemon == undefined) return false
    pokemon.item = megastone
  }

  // |detailschange|p1a: Sagittarius|Charizard-Mega-Y, M
  processDetailsChange(line)
  {
    let matches = line.match(/\|detailschange\|(p[12])[ab]:\s+([^|]+)\|([^,]+)/)
    let player = matches[1]
    let nickname = matches[2]
    let species = matches[3]

    let pokemon = this.players[player].getPokemonByNickname(nickname)
    if(pokemon == undefined) return false
    pokemon.species = species
  }

  //|-item|p2a: Landorus|Choice Scarf|[from] move: Trick
  processItemFromMove(line)
  {
    let matches = line.match(/\|-item\|(p[12])[ab]:\s+([^|]+)\|([^|]+)/)

    if(matches == null) return
    let player = matches[1]
    let nickname = matches[2]
    let item = matches[3]

    let otherPlayer = (player == "p1") ? "p2" : "p1"
    let otherPokemon = this.players[otherPlayer].currentPokemon

    if(otherPokemon.item == "") otherPokemon.item = item
  }

  //|-enditem|p1a: Greninja|Focus Sash
  processEndItem(line)
  {
    let matches = line.match(/\|-enditem\|(p[12])[ab]:\s+([^|]+)\|([^|]+)/)
    let player = matches[1]
    let nickname = matches[2]
    let item = matches[3]

    let pokemon = this.players[player].getPokemonByNickname(nickname)
    if(pokemon == undefined) return false
    if(pokemon.item == "") pokemon.item = item
  }


  //-heal|p1a: Gothitelle|135/343|[from] item: Leftovers
  processHealthChangeFromItem(line)
  {
    let player = null
    let nickname = null
    let item = null
    let matches = line.match(/\|(p[12])[ab]:\s+([^|]+)\|[^|]+\|\[from\] item: (.+)/)
    if(matches !== null) {
      player = matches[1]
      nickname = matches[2]
      item = matches[3]
    }

    // |-boost|p1a: Rhyperior|atk|2|[from] item: Weakness Policy
    if(matches === null) {
      matches = line.match(/\|(p[12])[ab]:\s+([^|]+)(\|[a-z]+)?(\|[0-9]+)?\|\[from\] item: (.+)/)
      if(matches !== null) {
        player = matches[1]
        nickname = matches[2]
        item = matches[5]
      }
    }


    if(matches === null) {
      console.log(`NULL MATCH FROM ITEM - ${line}`)
    }

    if(player !== null) {
      let pokemon = this.players[player].getPokemonByNickname(nickname)
      if(pokemon == undefined) return false
      pokemon.item = item
    }
  }

  processAbilityFromHeal(line)
  {
    let matches = line.match(/\|(p[12])[ab]:\s+([^|]+)\|[^|]+\|\[from\] ability: (.+)/)
    let player = matches[1]
    let nickname = matches[2]
    let ability = matches[3]

    let pokemon = this.players[player].getPokemonByNickname(nickname)
    if(pokemon == undefined) return false
    pokemon.ability = ability
  }

  //|-weather|SunnyDay|[from] ability: Drought|[of] p1a: Sagittarius
  processWeatherFromAbility(line)
  {
    let matches = line.match(/\|-weather\|[^|]+\|\[from\] ability: ([^|]+)\|\[of\] (p[12])[ab]: (.+)/)
    if(matches == null) return
    let ability = matches[1]
    let player = matches[2]
    let nickname = matches[3]

    let pokemon = this.players[player].getPokemonByNickname(nickname)
    if(pokemon == null) return
    pokemon.ability = ability
  }
}

class Player
{
  name = ""
  username = ""
  pokemon = []
  currentPokemon = null

  constructor(name) {
    this.name = name
  }

  // TODO: Can't handle duplicates..
  getPokemonBySpecies(species)
  {
    for(let i=0; i<this.pokemon.length; i++)
    {
      if(this.pokemon[i].species == species)
      {
        return this.pokemon[i]
      }
    }
    return null
  }

  getPokemonByNickname(nickname)
  {
    for(let i=0; i<this.pokemon.length; i++)
    {
      if(this.pokemon[i].nickname == nickname)
      {
        return this.pokemon[i]
      }
      else if(this.pokemon[i].species == nickname)
      {
        return this.pokemon[i]
      }
      else if(this.pokemon[i].species == nickname + '-Alola')
      {
        return this.pokemon[i]
      }
      else if(this.pokemon[i].species == nickname + '-Mega')
      {
        return this.pokemon[i]
      }
    }
    return null
  }

  getTeam()
  {
    return this.pokemon
  }
}

class Pokemon
{
  species = ""
  nickname = ""
  item = ""
  ability = ""
  moves = {}

  getTeamFormatString()
  {
    let s = ""
    s += this.species + " @ " + this.item +"\n"
    s += "Ability: "+ this.ability + "\n"
    for(let move in this.moves)
    {
      s+= "- "+move+"\n"
    }
    return s
  }
}

export default PokemonShowdownReplayParser