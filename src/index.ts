import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { connectToHost } from './utils/net-connect';

const RNNetPrinter = NativeModules.RNNetPrinter;

export enum PrinterBrand {
  EPSON = 'EPSON',
  STAR = 'STAR',
  OTHER = 'OTHER',
}

export interface PrinterOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
}

export interface IBasePrinter {
  device_name: string;
  brand?: PrinterBrand;
}
export interface INetPrinter extends IBasePrinter {
  host: string;
  port: number;
}

// Timeout for returning response to client
const SDK_RESPONSE_TIMEOUT = 5000;

// Promise with timeout
const promiseWithTimeout = <T>(
  promise: Promise<T>
): {
  promiseOrTimeout: Promise<T>;
  timeoutId: ReturnType<typeof setTimeout>;
} => {
  let timeoutId;
  const timeoutPromise: Promise<T> = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, SDK_RESPONSE_TIMEOUT);
  });
  return {
    promiseOrTimeout: Promise.race([promise, timeoutPromise]),
    // @ts-ignore
    timeoutId,
  };
};

export const NetPrinter = {
  connectAndSend: (
    host: string,
    port: number,
    data: Buffer,
    brand: PrinterBrand
  ): Promise<INetPrinter> => {
    const { promiseOrTimeout, timeoutId } = promiseWithTimeout<INetPrinter>(
      new Promise(async (resolve, reject) => {
        if (Platform.OS === 'ios') {
          try {
            await connectToHost(host, 2000)
            RNNetPrinter.connectAndSend(
              host,
              port,
              data.toString('base64'),
              brand,
              (printer: INetPrinter) => resolve(printer),
              (error: Error) => reject(error)
            )
          } catch (error) {
            reject(`Connect to ${host} fail`)
          }
        } else {
          RNNetPrinter.connectAndSend(
            host,
            port,
            data.toString('base64'),
            brand,
            (printer: INetPrinter) => resolve(printer),
            (error: Error) => reject(error)
          )
        }
      }
      )
    );
    return new Promise((resolve, reject) =>
      promiseOrTimeout
        .then((printer: INetPrinter) => resolve(printer))
        .catch((error: Error) => reject(error))
        .finally(() => clearTimeout(timeoutId))
    );
  },
};

export const NetPrinterEventEmitter = new NativeEventEmitter(RNNetPrinter);

export enum RN_THERMAL_RECEIPT_PRINTER_EVENTS {
  EVENT_NET_PRINTER_SCANNED_SUCCESS = 'scannerResolved',
  EVENT_NET_PRINTER_SCANNING = 'scannerRunning',
  EVENT_NET_PRINTER_SCANNED_ERROR = 'registerError',
}
