import Quagga from "@ericblade/quagga2";

export const extractBarcodeFromImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    Quagga.decodeSingle(
      {
        src: imagePath,
        numOfWorkers: 0,
        inputStream: {
          size: 800,
        },
        decoder: {
          readers: ["ean_reader", "upc_reader"],
        },
      },
      (result) => {
        if (result && result.codeResult) {
          resolve(result.codeResult.code);
        } else {
          reject(new Error("Barcode not detected"));
        }
      }
    );
  });
};