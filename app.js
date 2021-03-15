const mqtt = require('mqtt');
const Omx = require('node-omxplayer');    // https://github.com/Ap0c/node-omxplayer
const schedule = require('node-schedule');

let { controllerUrl, actAsController, video, totalNodes } = require('./config.json');

console.log('--- STARTING NETWORK PLAYER ---');
console.log('controllerUrl:', controllerUrl);
console.log('video:', video);
console.log('totalNodes:', totalNodes);


try {
  let nodesConnected = 1;
  let nodesDone = 0;

  let player = createPlayer();

  if (actAsController) {
    startServer();

    // if we are the server, listen to our ip
    controllerUrl = 'mqtt://0.0.0.0';
  }

  const client = mqtt.connect(controllerUrl);
  client.on('connect', onConnect);
  client.on('message', onMessage);


  function onConnect() {
    client.subscribe(['/ready', '/play', '/done'], function (err) {
      if (!err) {
        console.log(`connected to ${controllerUrl}`);
        if (!actAsController) {
          client.publish('/ready'); // first argument is the topic, second is the message
        }
      }
    });
  }

  function onMessage(topic, message) {
    const msg = message.toString();
    console.log('received a message topic: %s with message: %s', topic, msg);
    if (topic === '/ready' && actAsController) {
      nodesConnected++;
      if (nodesConnected === totalNodes) {
        playVideo();
      }
    }

    if (topic === '/done' && actAsController) {
      nodesDone++;
      if (nodesDone === totalNodes) {
        nodesDone = 0;
        playVideo();
      }
    }

    if (topic === '/play') {
      onPlay(msg);
    }
  }

  function playVideo() {
    const startTime = new Date();
    startTime.setSeconds(0);
    startTime.setMinutes(startTime.getMinutes() + 1);
    client.publish('/play', `${startTime.getTime()}`);
  }

  function onPlay(msg) {
    const startTime = new Date();
    startTime.setTime(msg);

    console.log('Going to play video at ', startTime);
    schedule.scheduleJob(startTime, function() {
      console.log('Playing video at ', startTime);
      player.play();
      player.on('close', function() {
        console.log('player done');
        player = createPlayer();
        client.publish('/done', 'video complete');
      });
    });
  }

  function startServer() {
    console.log('\n+++ STARTING CONTROLLER SERVER +++');

    const aedes = require('aedes')();
    const net = require('net');
    const port = 1883;
    const server = net.createServer(aedes.handle)
    server.listen(port, function () {
      console.log('server started and listening on port ', port)
    });
  }

  function createPlayer() {
    const player = Omx(
      video,  // video file
      'both', // audio output
      false,  // loop
      50      // initial volume
    );
    player.pause();
    return player;
  }

} catch (e) {
  console.log(e.stack);
  process.exit();
}