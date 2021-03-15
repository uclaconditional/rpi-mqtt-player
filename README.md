# Synchronized Video Player the Raspberry PI using MQTT



## Pi Setup

### Install nodejs

See this gist for pi zero https://gist.github.com/Koenkk/11fe6d4845f5275a2a8791d04ea223cb



### Turn off the mouse and disable screen sleeping

`sudo nano /etc/lightdm/lightdm.conf` then at the end of the "[Seat:*]" section, add: `xserver-command = X -nocursor -s 0 dpms`

If using the hyperpixel, also follow the steps here: https://github.com/pimoroni/hyperpixel#disabling-power-save



