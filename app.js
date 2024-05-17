const express = require('express')
const app = express()
const path = require('path')

//Db's
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initilizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
module.exports = app
initilizeDBAndServer()
//Get All the Player In The Database
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.use(express.json())
//Createing a new player in the database
app.post('/players/', async (request, response) => {
  const playerDetails = request.body

  const {playerId, playerName, jerseyNumber, role} = playerDetails
  //How to add the player_id in the created cricket_team and auto_increment
  const playerQuery = `
  INSERT INTO cricket_team (player_name,jersey_number,role)
  VALUES (
    '${playerName}',${jerseyNumber},'${role}'
  );`

  const dbResponse = await db.run(playerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetails = `
  SELECT *
  FROM cricket_team
  WHERE 
  player_id = ${playerId};`

  const getPlayerDetail = await db.get(getPlayerDetails)
  response.send(convertDbObjectToResponseObject(getPlayerDetail))
})
app.use(express.json())
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body

  const {playerName, jerseyNumber, role} = playerDetails
  const updateQuery = `
  UPDATE cricket_team
  SET
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}'
  WHERE 
  player_id=${playerId};`

  await db.run(updateQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
  DELETE FROM
  cricket_team
  WHERE 
  player_id=${playerId};`
  await db.run(deleteQuery)
  response.send('Player Removed')
})
