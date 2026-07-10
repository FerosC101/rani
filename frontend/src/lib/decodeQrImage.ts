import jsQR from "jsqr";

/**
 * Decodes a QR code from an image file (e.g. a screenshot of someone's
 * Freighter wallet QR, or a saved photo) entirely client-side — no
 * camera, no upload to any server. Returns the decoded text, or null if
 * no QR code was found in the image.
 */
export function decodeQrImage(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        resolve(code ? code.data.trim() : null);
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image file."));
    };

    img.src = url;
  });
}
