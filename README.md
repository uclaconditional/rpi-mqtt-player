# Synchronized Video Player for the Raspberry PI using MQTT
This is a small node app that uses MQTT to synchronize the playing of videos on multiple raspberry pis. A single controller instance listens for connection messages (/ready) and counts how many nodes have connected. When every node is ready, the controller tells all nodes to play one minute in the future (to help account for differences in the message being recieved). When the video is finished playing, nodes send a `/done` message and the controller waits until all nodes are done, and then sends the `/play` message to start repeat loop.

## App Config
The config file contains 4 variables. 
`totalNodes` is the number of nodes who are synched
`video` is the path to the video file to play
`actAsController` should be true for the machine that is acting as the controller for the network. All synched nodes should only have 1 controller.
`controllerUrl` is the IP or hostname of the machine where the controller lives. This is only necessary on machines that aren't the controller. See below to set the hostname so you can use the X.local syntax and not fret of IP addresses.


## Pi Setup

### Turn off the mouse and disable screen sleeping
`sudo nano /etc/lightdm/lightdm.conf` then at the end of the "[Seat:*]" section, add: `xserver-command = X -nocursor -s 0 dpms`

If using the hyperpixel, also follow the steps here: https://github.com/pimoroni/hyperpixel#disabling-power-save

Also there is a flash to the desktop when the video completes, if you set the desktop background to black, remove the trash, and hide the taskbar you won't see it.

### Change Hostname
This isn't totally necessary, but it will make life easier when setting the controllerUrl https://www.tomshardware.com/how-to/raspberry-pi-change-hostname


### Install nodejs
See this gist for pi zero https://gist.github.com/Koenkk/11fe6d4845f5275a2a8791d04ea223cb


### Install PM2
`sudo npm install -g pm2`
After install you need to get the daemon running, easiest way is to run `pm2 status` which you can use in the future to see the status of your app.

### Run the app with PM2
cd into the directory with the code, and run `pm2 start app.js --name mqtt-player` then "save" the app by running `pm2 save`

If you need to make changes in the future, you can control the process with `pm2 stop mqtt-player` and `pm2 start mqtt-player`


### Setup PM2 to run on startup
`pm2 startup` and follow the onscreen instructions. If you ever want to undo this you can run `pm2 unstartup systemd`


