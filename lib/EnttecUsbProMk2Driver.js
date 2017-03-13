const DEFAULT_OPTIONS = {
  universeMapping: {1: 1, 2: 2}
};

const API_KEY = 0xC8D088AD; // taken from qlc+
const labels = {
  SEND_DMX_PORT1: 0x06,
  SEND_DMX_PORT2: 0xA9,
  SET_API_KEY: 0x0D,
  SET_PORT_ASSIGNMENT: 0xCB
};

/**
 * A fivetwelve-driver for the enttec usbpro mk2-interface supporting both
 * dmx-outputs.
 *
 * @example
 *     import fivetwelve from 'fivetwelve';
 *     import Serialport from 'serialport';
 *
 *     // I read somewhere that connection settings like baudrate etc are not
 *     // required as it's just a virtual serialport or something like that
 *     const usbproSerialport = new Serialport('/dev/something');
 *
 *     // configure output for two universes:
 *     const output = fivetwelve(
 *         new EnttecUsbProMk2Driver(usbproSerialport), 2);
 */
export default class EnttecUsbProMk2Driver {
  /**
   * Initializes the driver for the given serialport.
   * @param {Serialport} serialport A ready configured node-serialport instance.
   *     Setting up the serialport-connection has to be done externally.
   * @param {object} options
   * @param {object} options.universeMapping A mapping of fivetwelve
   *     universe-numbers to usbpro universes 1/2.
   */
  constructor(serialport, options = {}) {
    /**
     * @type {Serialport}
     */
    this.serialport = serialport;

    /**
     * @type {object}
     */
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this.ready = this.awaitSerialportOpened()
        .then(() => this.initUsbProMk2());
  }

  /**
   * Sends the given values to the dmx-interface over the serialport.
   * @param {Buffer} buffer A buffer with the dmx-values to be sent.
   * @param {Number} universe The 1-based universe-number.
   * @returns {Promise} A promise that will be resolved when the buffer is
   *   completely sent.
   */
  send(buffer, universe) {
    const usbProUniverse = this.options.universeMapping[universe];

    if (!usbProUniverse) {
      return Promise.resolve();
    }

    // for whatever-reason, dmx-transmission has to start with a zero-byte.
    const frameBuffer = Buffer.alloc(513);
    frameBuffer.writeUInt8(0, 0);
    buffer.copy(frameBuffer, 1);

    const label = usbProUniverse === 1 ?
        labels.SEND_DMX_PORT1 : labels.SEND_DMX_PORT2;

    return this.sendPacket(label, frameBuffer);
  }

  /**
   * Returns a Promise that is resolved once the serialport is opened.
   * @returns {Promise<Serialport>} A promise resolving with the
   *     node-serialport-instance.
   * @private
   */
  awaitSerialportOpened() {
    if (this.serialport.isOpen()) {
      return Promise.resolve(this.serialport);
    }

    return new Promise((resolve, reject) => {
      this.serialport.on('open', error => {
        if (error) {
          return reject(error);
        }

        return resolve(this.serialport);
      });
    });
  }

  /**
   * Configures both ports of the usbpro-mk2 as outputs (these messages
   * should be ignored by other usbpro-devices).
   * @returns {Promise} A promise resolved when intialization is complete.
   * @private
   */
  initUsbProMk2() {
    const apiKeyBuf = Buffer.alloc(4);
    apiKeyBuf.writeUInt32LE(API_KEY, 0);

    const portAssignBuf = Buffer.alloc(2);
    portAssignBuf.writeUInt8(1, 0); // Port 1 enabled for DMX and RDM
    portAssignBuf.writeUInt8(1, 1); // Port 2 enabled for DMX and RDM

    return this.sendPacket(labels.SET_API_KEY, apiKeyBuf)
        .then(() => this.sendPacket(labels.SET_PORT_ASSIGNMENT, portAssignBuf));
  }

  /**
   * Sends a single packet to the usbpro.
   * @param {Number} label The message label.
   * @param {Buffer} data The message payload.
   * @returns {Promise} A promise indicating when the data has been sent.
   * @private
   */
  sendPacket(label, data) {
    const buffer = Buffer.alloc(data.length + 5);

    buffer.writeUInt8(0x7E, 0); // usbpro packet start marker
    buffer.writeUInt8(label, 1);
    buffer.writeUInt16LE(data.length, 2);

    data.copy(buffer, 4);

    buffer.writeUInt8(0xE7, buffer.length - 1); // usbpro packet end marker

    return this.write(buffer);
  }

  /**
   * Writes the raw data to the serialport.
   * @param {Buffer} buffer A buffer to be sent to the serialport.
   * @returns {Promise} a promise that is resolved when the buffer was
   *     completely sent.
   * @private
   */
  write(buffer) {
    return this.ready.then(serialport => {
      return new Promise((resolve, reject) => {
        serialport.write(buffer, err => {
          if (err) {
            return reject(err);
          }

          serialport.drain(() => resolve());
        });
      });
    });
  }
}

/**
 * @typedef {object} Serialport
 * @property {function} write
 * @property {function} drain
 * @property {function} isOpen
 * @property {function} on
 */
