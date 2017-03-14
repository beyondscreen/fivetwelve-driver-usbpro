import expect from 'expect.js';
import stream from 'stream';

import EnttecUsbProMk2Driver from '../lib/EnttecUsbProMk2Driver';

// copied from ../lib/EnttecUsbProMk2Driver.js
const API_KEY = 0xE403A4C9;
const MESSAGE_LABELS = {
  SEND_DMX_PORT1: 0x06,
  SEND_DMX_PORT2: 0xCA,
  SET_API_KEY: 0x0D,
  SET_PORT_ASSIGNMENT: 0x93
};

describe('EnttecUsbProMk2Driver', () => {
  let serialport;

  beforeEach(() => {
    serialport = new stream.Writable();
    serialport.isOpen = () => serialport.open;
    serialport._write = (chunk, encoding, callback) => {
      serialport.data.push(chunk);
      callback();
    };

    serialport.drain = callback => process.nextTick(callback);

    serialport.data = [];
    serialport.open = false;
  });


  describe('constructor()', () => {
    it('will initialize the usbpro to mk2-protocol', () => {
      serialport.open = true;
      const driver = new EnttecUsbProMk2Driver(serialport);

      return driver.ready.then(() => {
        expect(serialport.data.length).to.be(2);

        const setApiKeyMessage = serialport.data[0];
        const outputAssignMessage = serialport.data[1];

        validateMessage(setApiKeyMessage, MESSAGE_LABELS.SET_API_KEY);
        validateMessage(outputAssignMessage, MESSAGE_LABELS.SET_PORT_ASSIGNMENT);

        expect(getMessagePayload(setApiKeyMessage).readUInt32LE(0)).to.be(API_KEY);
        expect(getMessagePayload(outputAssignMessage).readUInt8(0)).to.be(1);
        expect(getMessagePayload(outputAssignMessage).readUInt8(1)).to.be(1);
      });
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

    it('sends data for universe 1', () => {
      dmxBuffer[0] = 0xff;
      dmxBuffer[511] = 0xcc;

      return driver.send(dmxBuffer, 1).then(() => {
        expect(serialport.data.length).to.be(3);

        const dmxMessage = serialport.data[2];
        const payload = getMessagePayload(dmxMessage);

        validateMessage(dmxMessage, MESSAGE_LABELS.SEND_DMX_PORT1);
        expect(payload.length).to.be(513);
        expect(payload[0]).to.be(0);
        expect(payload[1]).to.be(0xff);
        expect(payload[512]).to.be(0xcc);
      });
    });

    it('sends data for universe 2', () => {
      dmxBuffer[0] = 0xff;
      dmxBuffer[511] = 0xcc;

      return driver.send(dmxBuffer, 2).then(() => {
        expect(serialport.data.length).to.be(3);

        const dmxMessage = serialport.data[2];
        const payload = getMessagePayload(dmxMessage);

        validateMessage(dmxMessage, MESSAGE_LABELS.SEND_DMX_PORT2);
        expect(payload.length).to.be(513);
        expect(payload[0]).to.be(0);
        expect(payload[1]).to.be(0xff);
        expect(payload[512]).to.be(0xcc);
      });
    });
  });
});


function validateMessage(buffer, expectedLabel) {
  // check start- end stop-byte
  expect(buffer[0]).to.be(0x7E);
  expect(buffer[buffer.length - 1]).to.be(0xE7);

  const label = buffer.readUInt8(1);
  const length = buffer.readUInt16LE(2);

  // check message-label
  expect(label).to.be(expectedLabel);
  // check length-integrity
  expect(buffer.length).to.be(length + 5);
}

function getMessagePayload(buffer) {
  return buffer.slice(4, buffer.length - 1);
}
