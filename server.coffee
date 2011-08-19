io = require 'socket.io'
sys = require 'sys'
express = require 'express'

app = express.createServer()
app.listen(4000)
io = io.listen(app)

id = 1
rooms = {}
io.sockets.on 'connection', (socket) ->
	socket.on 'createRoom', (options) ->
		roomName = '/r' + (id++)
		rooms[roomName] = options.label
		room = io.of(roomName).on 'connection', (socket) ->
			socket.on 'message', (msg) ->
				room.emit('message', message:msg)
		socket.emit 'roomCreated'
app.use express.static(__dirname + '/public')
app.get '/rooms', (req, res) ->
	ret = for name, label of rooms
		{name:name, label:label}
	res.send(ret)
