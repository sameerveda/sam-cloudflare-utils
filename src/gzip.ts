export async function gzip_decode(blob: Blob, type: 'text'): Promise<string>;
export async function gzip_decode<T = any>(blob: Blob, type: 'json'): Promise<T>;
export async function gzip_decode(blob: Blob, type: 'blob'): Promise<Blob>;
export async function gzip_decode(
  blob: Blob,
  type: 'raw'
): Promise<ReadableStream<Uint8Array<ArrayBufferLike>>>;

export async function gzip_decode(blob: Blob): Promise<ReadableStream<Uint8Array<ArrayBufferLike>>>;

export function gzip_decode(blob: Blob, type: 'text' | 'blob' | 'json' | 'raw' = 'raw') {
  const ds = new DecompressionStream('gzip');
  const decompressedStream = blob.stream().pipeThrough(ds);

  if (!type || type === 'raw') return decompressedStream;

  const res = new Response(decompressedStream);

  switch (type) {
    case 'json':
      return res.json();
    case 'text':
      return res.text();
    case 'blob':
      return res.blob();
    default:
      throw new Error(`unknown type${type}`);
  }
}

export function gzip_encode(data: Blob, asBlob: true): Promise<Blob>;
export function gzip_encode(
  data: Blob,
  returnBlob: false
): Promise<ReadableStream<Uint8Array<ArrayBufferLike>>>;

export function gzip_encode(data: Blob): Promise<ReadableStream<Uint8Array<ArrayBufferLike>>>;

export async function   gzip_encode(data: Blob, asBlob?: boolean) {
  const res = data.stream().pipeThrough(new CompressionStream('gzip'));
  return asBlob ? new Response(res).blob() : res;
}
