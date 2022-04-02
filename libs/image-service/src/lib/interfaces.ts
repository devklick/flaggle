export interface ChunkedImage {
  ref: string;
  chunks: ImageChunk[];
}

export interface ImageChunk {
  ref: string;
  x: number;
  y: number;
}
