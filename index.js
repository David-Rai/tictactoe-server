const express = require("express");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS for React app
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

let waitingPlayer = null;

// SOCKET.IO connection
io.on("connection", (client) => {

//Getting the name and socket id
client.on("join-room",({name,id})=>{
const player=io.sockets.sockets.get(id)//retriving the socket or client instance

if(!waitingPlayer || waitingPlayer === null){
  waitingPlayer={
  name,player
  }
  return 
}

//if there was waiting player
const roomName=`${waitingPlayer.player.id}-${player.id}`
waitingPlayer.player.join(roomName)
player.join(roomName)

//both are joined message
io.to(roomName).emit("joined-message",{
message:"you both are playing",
rName:roomName
})

waitingPlayer.player.emit('oponent-name',{name,role:"x"})
player.emit('oponent-name',{name:waitingPlayer.name,role:"o"})


waitingPlayer=null//removing the waiting player instance
})

//listening the players move
client.on('move',({move,roomName,turn})=>{
const nextTurn=turn === "x" ? "o" : "x"
io.to(roomName).emit("mark-move",{move,nextTurn,mark:turn})
})



});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Set port with a fallback value
const port = process.env.PORT || 1111;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
