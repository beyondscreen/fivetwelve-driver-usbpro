import expect from 'expect.js';
import stream from 'stream';

import EnttecUsbProMk2Driver from '../lib/EnttecUsbProMk2Driver';

describe('EnttecUsbProMk2Driver', () => {
  var serialport;

  beforeEach(() => {
    serialport = new stream.Writable();
    serialport.isOpen = function() {};
    serialport.data = null;
    serialport._write = function(chunk, encoding, callback) {
      if (!serialport.data) {
        serialport.data = chunk;
      } else {
        serialport.data = Buffer.concat(
          [serialport.data, chunk],
          serialport.data.length + chunk.length
        );
      }
      callback();
    };
    serialport.drain = (callback) => process.nextTick(callback);
  });


  describe('constructor()', () => {
    it('will initialize the usbpro to mk2-protocol', () => {
      var dmx = new EnttecUsbProMk2Driver(serialport);

      expect(dmx).to.be.a(EnttecUsbProMk2Driver);
    });
  });


  describe('send()', () => {
    /* eslint-disable no-unused-vars */
    var driver, dmxBuffer;

    beforeEach(() => {
      driver = new EnttecUsbProMk2Driver(serialport);
      serialport.emit('open');

      dmxBuffer = new Buffer(512);
      dmxBuffer.fill(0);
    });

    it('will send correct data');
  });
});
