module.exports = function(io, redis) {
    io.sockets.on("connection", async function(socket){
        //console.log(`New connection from: ${socket.id}`)

        socket.on('client.username.check', async (username) => {
            var roomConnectedUsers = JSON.parse(await redis.get('rooms.users'))
            
            let Exists = false;

            Object.keys(roomConnectedUsers).forEach((key) => {
                if(roomConnectedUsers[key].username == username){
                    Exists = true
                }
            })

            if(Exists){
                io.to(socket.id).emit('server.username.exists', username)
            }
            else{
                io.to(socket.id).emit('server.cansync')
            }
        })

        socket.on('client.chat.message', async (msg)=> {
            var roomConnectedUsers = JSON.parse(await redis.get('rooms.users'))
            io.emit('server.chat.message', {
                owner: {
                    username: roomConnectedUsers[socket.id].username,
                    room: roomConnectedUsers[socket.id].roomId
                },
                content: {
                    message: msg
                }
            })
        }) 

        //sync
        socket.on('client.sync', async ({room, username}) => {
            //user already sync?
            var roomConnectedUsers = JSON.parse(await redis.get('rooms.users'))
            var roomData = JSON.parse(await redis.get('rooms.viwers'))
            //se o usuario nao estiver sincronizado
            if(!roomConnectedUsers[socket.id]){
                roomConnectedUsers[socket.id] = {
                    roomId: room,
                    username
                }
            }
            roomData[room] = roomData[room] ? roomData[room] + 1: 1
            //envia as alterações para o db
            await redis.set('rooms.viwers', JSON.stringify(roomData))
            await redis.set('rooms.users', JSON.stringify(roomConnectedUsers))
            //envia para os clients
            io.emit('server.rooom.update', {
                roomData
                })
        })

        //TODO: client change room
        socket.on('client.change.room', async (room) => {
            //user already exist?
            var roomConnectedUsers = JSON.parse(await redis.get('rooms.users'))
            var roomData = JSON.parse(await redis.get('rooms.viwers'))
            //se o usuario ja existir
            if(roomConnectedUsers[socket.id]){
                //nao esta tentando ir para a mesma sala?
                if(room != roomConnectedUsers[socket.id].roomId){
                    //primerio atualiza as salas removendo os usuarios dela
                    if(roomData[roomConnectedUsers[socket.id].roomId] - 1 <= 0) {
                        delete roomData[roomConnectedUsers[socket.id].roomId]
                    }else {
                        roomData[roomConnectedUsers[socket.id].roomId] = roomData[roomConnectedUsers[socket.id].roomId] - 1
                    }

                    //adiciona o user na nova sala
                    roomData[room] = roomData[room] ? roomData[room] + 1: 1

                    //atualiza o user
                    roomConnectedUsers[socket.id] = {
                        roomId: room,
                        username: roomConnectedUsers[socket.id].username
                    }
                     //envia as alterações para o db
                    await redis.set('rooms.viwers', JSON.stringify(roomData))
                    await redis.set('rooms.users', JSON.stringify(roomConnectedUsers))
                    //envia para os clients
                    io.emit('server.rooom.update', {
                        roomData
                        })
                }
            }
        
        })
        //TODO: client send message

        //client disconnect
        socket.on('disconnect', async () => {
          var roomConnectedUsers = JSON.parse(await redis.get('rooms.users'))
          var roomData = JSON.parse(await redis.get('rooms.viwers'))

          //se o usuario ja estiver sincronizado
          if(roomConnectedUsers[socket.id]){
             let currentUser = roomConnectedUsers[socket.id]
             //remove um player da sala conectada
             //se a sala existe
             if(roomData[currentUser.roomId]){
                if(roomData[currentUser.roomId] - 1 <= 0){
                    delete roomData[currentUser.roomId]
                }else{
                    roomData[currentUser.roomId]  = roomData[currentUser.roomId] - 1 
                }
             }
            
             //atualiza as salas
             await redis.set('rooms.viwers', JSON.stringify(roomData))

             //deleta o usuario no redis
             delete roomConnectedUsers[socket.id]
             await redis.set('rooms.users', JSON.stringify(roomConnectedUsers))
          }

          io.sockets.emit('server.rooom.update', {
            roomData
        })
          //console.log(`${socket.id} disconnected!`)
        })

    });
};