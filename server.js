var http = require('http'),
  WebSocketServer = require('ws').Server,
  port = 1234,
  host = '0.0.0.0';

// create a new HTTP server to deal with low level connection details (tcp connections, sockets, http handshakes, etc.)
var server = http.createServer();


// create a WebSocket Server on top of the HTTP server to deal with the WebSocket protocol
var wss = new WebSocketServer({
  server: server
});

var dataSave = {};

// create a function to be able do broadcast messages to all WebSocket connected clients
wss.broadcast = function broadcast(message) {
  wss.clients.forEach(function each(client) {
    client.send(message);
  });
};

// Register a listener for new connections on the WebSocket.
wss.on('connection', function(client, request) {

  // retrieve the name in the cookies
  var cookies = request.headers.cookie.split(';');
  var wsname = cookies.find((c) => {
    return c.match(/^\s*wsname/) !== null;
  });
  wsname = wsname.split('=')[1];
  console.log("first connexion from", wsname);
  // greet the newly connected user
  client.send('Welcome, ' + decodeURIComponent(wsname) + '!');

  // Register a listener on each message of each connection
  client.on('message', function(message) {
    //console.log("messageee");
    //console.log(message);
    let messageObj = message;
    try {
      messageObj = JSON.parse(message);
      
      var cli = '[' + decodeURIComponent(wsname) + '] ';
      let send = {
        client : cli,
        type : messageObj.type,
        msg : messageObj.msg
      }

      if(send.type == "canva") {
        dataSave[send.msg.id] = dataSave[send.msg.id] ? dataSave[send.msg.id] : [];
        dataSave[send.msg.id].push(send.msg);
        //console.log(dataSave);
      }

      if(send.type == "dataRequest") {
        /*console.log("send datasave");
        console.log(dataSave);*/
        send.msg = {
          refresh : send.msg.refresh,
          history : dataSave 
        }
      }

      if(send.type == "delete") {
        delete dataSave[send.msg.id];
      }

      // when receiving a message, broadcast it to all the connected clients
      //wss.broadcast(cli+message);
      let str = JSON.stringify(send);
      wss.broadcast(str);
    }catch(err) {
      console.log(err);
    }
  });
});


// http sever starts listening on given host and port.
server.listen(port, host, function() {
  console.log('Listening on ' + server.address().address + ':' + server.address().port);
});

process.on('SIGINT', function() {
  process.exit(0);
});