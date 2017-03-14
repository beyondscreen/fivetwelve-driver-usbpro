# fivetwelve driver for ENTTEC USB PRO mk2

This is a [fivetwelve][] driver for the [USB PRO mk2][usbpromk2] DMX-interface made by enttec.

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

It is difficult to get our hands on different dmx-interfaces to test for compatibility. But as the binary protocol implemented by tge enttec usbpro has been used by other vendors as well, this module could be compatible (or could be made compatible easily).


[fivetwelve]: https://github.com/beyondscreen/fivetwelve
[usbpromk2]: http://www.enttec.com/?main_menu=Products&pn=70314
