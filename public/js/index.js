var socket = io(); // creats connection with the server for communication ie creats a web socket

socket.on('connect', function (){
    console.log('Connected to server');
});

socket.on('newMessage', function (message) {
    console.log(JSON.stringify(message));
});

socket.emit('createMessage', {
    from : "Amogh",
    text : "Hello how are you"
});

socket.on('disconnect', function (){
    console.log('Disconnected from the server');
});