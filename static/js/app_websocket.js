
$(document).ready(function(){
    namespace = '/data'; // change to an empty string to use the global namespace

    var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);
    socket.on('connect', function() {
        socket.emit('my event', {data: 'I\'m connected!'});
         $('#log').append('<br>connected');
    });

    var mydict = {};
    socket.on('data', function(msg) {
        var channel = msg.channel;
        var data = msg.data;
        console.log("Received data for channel " + channel + " size: " + data.length);
        mydict[channel] = data;
        load_data(mydict['nodes'], mydict['bars'], [], mydict['force_nodes'], mydict['force_bars']);
    });

});
