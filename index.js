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
   origin: "*"
  },
});

app.use(
  cors({
     origin: "*",

  })
);

let waitingPlayer = null;
let currentPlayers=[{list:"list of players"}]

// SOCKET.IO connection
io.on("connection", (client) => {
currentPlayers.push({
  clientName:name,
  clientId:id
}
)
  
  // Getting the name and socket id
  client.on("join-room", ({ name, id }) => {

    const player = io.sockets.sockets.get(id); // Retrieving the socket or client instance

    if (!player) {
      return; // Exit if the player socket doesn't exist
    }

    if (!waitingPlayer) {
      // No waiting player, assign the current player to waitingPlayer
      waitingPlayer = {
        name,
        player,
      };
      return; // Exit, wait for the next player
    }

    // If there was a waiting player, create the room
    const roomName = `${waitingPlayer.player.id}-${player.id}`;
    waitingPlayer.player.join(roomName);
    player.join(roomName);


    // Emit messages to both players
    io.to(roomName).emit("joined-message", {
      message: "You both are playing",
      rName: roomName,
    });

    waitingPlayer.player.emit("oponent-name", { name, role: "x" });
    player.emit("oponent-name", { name: waitingPlayer.name, role: "o" });

    // Reset waitingPlayer after the game starts
    waitingPlayer = null;
  });

  // Listening to players' moves
  client.on("move", ({ move, roomName, turn }) => {
    const nextTurn = turn === "x" ? "o" : "x";
    io.to(roomName).emit("mark-move", { move, nextTurn, mark: turn });
    console.log(`Move made in room ${roomName}: ${move} by ${turn}`);
  });
});

app.get("/", (req, res) => {
  res.json(currentPlayers)
});

// Set port with a fallback value
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
//nmorkwerkinfsandas kwdad
