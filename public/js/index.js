var socket = io(); // creats connection with the server for communication ie creats a web socket

socket.on('connect', function () {
  console.log('Connected to server');
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('newMessage', function (message) {
  console.log('newMessage', message);
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template,{
      from: message.from,
      text: message.text,
      createdAt : formattedTime
  });
  jQuery('#messages').append(html);
//   var li = jQuery('<li></li>');
//   li.text(`${message.from} ${formattedTime}: ${message.text}`);
//   jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function (message){
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template,{
        from: message.from,
        url: message.url,
        createdAt : formattedTime
    });
    jQuery('#messages').append(html);

    // var li = jQuery('<li></li>');
    // var formattedTime = moment(message.createdAt).format('h:mm a');
    // var a = jQuery('<a target ="_blank">My current location</a>');
    // li.text(`${message.from} ${formattedTime}: `);
    // a.attr('href', message.url);
    // li.append(a);
    // jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function(e){
    e.preventDefault();
    socket.emit('createMessage', {
        from : 'User',
        text : jQuery('[name = message]').val()
    }, function (data) {
        console.log('got it!', data);
        jQuery('[name = message]').val('');
    })
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function (){
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser');
    }
    locationButton.attr('disabled', 'disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function (position){
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        });
    }, function () {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch the location');
    });
});