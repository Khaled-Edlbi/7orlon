/**
 * What an uploaded file actually is, read from its own bytes.
 *
 * The browser's `Content-Type` and the file's name are both whatever the
 * sender says they are, so neither is consulted: the format comes from the
 * magic number and the dimensions from the header. Anything that is not one of
 * the four raster formats below is refused — notably SVG, which is a document
 * that can carry script.
 */
export type ImageMeta = {
  extension: "jpg" | "png" | "webp" | "gif";
  width: number;
  height: number;
};

export function readImageMeta(bytes: Uint8Array): ImageMeta | null {
  const meta = png(bytes) ?? gif(bytes) ?? webp(bytes) ?? jpeg(bytes);
  if (!meta || meta.width < 1 || meta.height < 1) return null;
  return meta;
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function png(bytes: Uint8Array): ImageMeta | null {
  if (bytes.length < 24) return null;
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!signature.every((b, i) => bytes[i] === b)) return null;
  if (ascii(bytes, 12, 4) !== "IHDR") return null;
  const v = view(bytes);
  return { extension: "png", width: v.getUint32(16), height: v.getUint32(20) };
}

function gif(bytes: Uint8Array): ImageMeta | null {
  if (bytes.length < 10) return null;
  const head = ascii(bytes, 0, 6);
  if (head !== "GIF87a" && head !== "GIF89a") return null;
  const v = view(bytes);
  return {
    extension: "gif",
    width: v.getUint16(6, true),
    height: v.getUint16(8, true),
  };
}

function webp(bytes: Uint8Array): ImageMeta | null {
  if (bytes.length < 30) return null;
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") return null;
  const v = view(bytes);
  const chunk = ascii(bytes, 12, 4);

  if (chunk === "VP8 ") {
    return {
      extension: "webp",
      width: v.getUint16(26, true) & 0x3fff,
      height: v.getUint16(28, true) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const bits = v.getUint32(21, true);
    return {
      extension: "webp",
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  if (chunk === "VP8X") {
    const u24 = (at: number) =>
      bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16);
    return { extension: "webp", width: u24(24) + 1, height: u24(27) + 1 };
  }
  return null;
}

function jpeg(bytes: Uint8Array): ImageMeta | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const v = view(bytes);
  let at = 2;

  // Walk the segments until a start-of-frame marker, which carries the size.
  while (at + 9 < bytes.length) {
    if (bytes[at] !== 0xff) return null;
    const marker = bytes[at + 1];
    if (marker === 0xff) {
      at += 1; // padding
      continue;
    }
    const isFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isFrame) {
      return {
        extension: "jpg",
        height: v.getUint16(at + 5),
        width: v.getUint16(at + 7),
      };
    }
    at += 2 + v.getUint16(at + 2);
  }
  return null;
}
