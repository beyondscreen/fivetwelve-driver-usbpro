# fivetwelve driver for the USB PRO family by enttec

This is a [fivetwelve][] driver for the USBPRO DMX-interface family made by enttec.
From this line the following devices have been tested:

* [Enttec USB Pro][usbpro]
* [Enttec USB Pro mk2][usbpromk2]

## installation

```
npm install --save fivetwelve-driver-usbpro
```

## usage example

```javascript
import fivetwelve from 'fivetwelve';
import Serialport from 'serialport';

// You need to somehow find the path of the interface (best done via 
// `Serialport.list()` and finding the right device)
const usbproSerialport = new Serialport('/dev/cu.usbserial-ENXXXXXX');

// configure the fivetwelve-output for both universes:
const output = fivetwelve(new EnttecUsbProMk2Driver(usbproSerialport), 2);

```

For more information see [the fivetwelve main-documentation][fivetwelve].


## Compatibility

It is difficult to get our hands on different dmx-interfaces to test for compatibility, but as the binary protocol implemented by tge enttec usbpro has been used by other vendors as well, this module could be compatible (or could be made compatible easily).


## Contributing

PRs welcome! Please feel free to [open an issue][issues] if you have any questions, problems or even if you just want to chat about this.


[fivetwelve]: https://github.com/beyondscreen/fivetwelve
[issues]: https://github.com/beyondscreen/fivetwelve-driver-usbpro/issues
[usbpro]: https://www.enttec.com/products/controls/dmx-usb/dmx-usb-pro/
[usbpromk2]: https://www.enttec.com/products/controls/dmx-usb/pro-mk2/
