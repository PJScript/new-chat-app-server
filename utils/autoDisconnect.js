const autoDiscconect = (io,socket) => {
            io.sockets.to(socket.id).emit('session-expired')    
}


module.exports = autoDiscconect

