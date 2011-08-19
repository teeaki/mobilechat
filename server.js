(function() {
  var app, express, id, io, rooms, sys;
  io = require('socket.io');
  sys = require('sys');
  express = require('express');
  app = express.createServer();
  app.listen(4000);
  io = io.listen(app);
  id = 1;
  rooms = {};
  io.sockets.on('connection', function(socket) {
    return socket.on('createRoom', function(options) {
      var room, roomName;
      roomName = '/r' + (id++);
      rooms[roomName] = options.label;
      room = io.of(roomName).on('connection', function(socket) {
        return socket.on('message', function(msg) {
          return room.emit('message', {
            message: msg
          });
        });
      });
      return socket.emit('roomCreated');
    });
  });
  app.use(express.static(__dirname + '/public'));
  app.get('/rooms', function(req, res) {
    var label, name, ret;
    ret = (function() {
      var _results;
      _results = [];
      for (name in rooms) {
        label = rooms[name];
        _results.push({
          name: name,
          label: label
        });
      }
      return _results;
    })();
    return res.send(ret);
  });
}).call(this);
