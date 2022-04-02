import config from './config';

import axios from 'axios';
import StatusCode from 'status-code-enum';
import * as Jimp from 'jimp';
import { randomUUID } from 'crypto';
import { join as joinPath } from 'path';
import { mkdir, stat, writeFile } from 'fs/promises';

export interface ImageMetadata {
  buffer: Buffer;
  imageRef: string;
}
const downloadImageFromUrl = async (url: string): Promise<ImageMetadata> => {
  const result = await axios.get<Buffer>(url, {
    responseType: 'arraybuffer',
  });
  if (result.status !== StatusCode.SuccessOK) {
    throw new Error('Unable to fetch countries from API');
  }
  return {
    buffer: result.data,
    imageRef: randomUUID(),
  };
};

type Point = { x: number; y: number };

export interface ChunkedImageMetadata {
  originalDimensions: Point;
  resizedDimensions: Point;
  resizedImage: Jimp;
  imageRef: string;
  chunks: ImageChunkMetadata[];
}

export interface ImageChunkMetadata {
  chunkPosition: Point;
  image: Jimp;
  buffer: Buffer;
  chunkRef: string;
}

const splitImageIntoChunks = async (
  buffer: Buffer,
  imageRef: string,
  xChunkCount: number,
  yChunkCount: number
): Promise<ChunkedImageMetadata> => {
  console.info(`Will split image into grid of ${xChunkCount}x${xChunkCount}`);

  // read the image buffer into a jimp image so we can work with it
  const image: Jimp = await Jimp.read(buffer);
  const originalWidth = image.getWidth();
  const originalHeight = image.getHeight();
  console.info('Original image width:', originalWidth);
  console.info('Original image height:', originalHeight);

  // We may need to resize the image if it is not currently divisible
  // by the number of chunks required along the relevant axis.
  // This is done in order to make sure all chunks end up the same dimensions.
  const nearestMultiple = (value: number, multiple: number) =>
    Math.floor(value / multiple) * multiple;

  const desiredWidth = nearestMultiple(originalWidth, xChunkCount);
  const desiredHeight = nearestMultiple(originalHeight, yChunkCount);

  if (originalWidth !== desiredWidth || originalHeight != desiredHeight) {
    image.resize(desiredWidth, desiredHeight);
    console.info('Resized image width:', desiredWidth);
    console.info('Resized image height:', desiredHeight);
  }

  // Work out how big each chunk should be
  const desiredChunkWidth = desiredWidth / xChunkCount;
  const desiredChunkHeight = desiredHeight / xChunkCount;
  console.info('Chunk width:', desiredChunkWidth);
  console.info('Chunk height:', desiredChunkHeight);

  const result: ChunkedImageMetadata = {
    imageRef: imageRef,
    originalDimensions: { x: originalWidth, y: originalHeight },
    resizedDimensions: { x: desiredWidth, y: desiredHeight },
    resizedImage: image,
    chunks: [],
  };

  for (let x = 0; x < xChunkCount; x++) {
    for (let y = 0; y < yChunkCount; y++) {
      // Work out where this chunk should start and end
      const xStart = x * desiredChunkWidth;
      const yStart = y * desiredChunkHeight;
      const xEnd = xStart + desiredChunkWidth;
      const yEnd = yStart + desiredChunkHeight;

      console.info(
        `Creating chunk at position x${x}y${y}, from x${xStart} y${yStart} to x${xEnd} y${yEnd}`
      );

      // Clone the image and crop it to capture the chunk
      const chunk = image
        .clone()
        .crop(xStart, yStart, desiredChunkWidth, desiredChunkHeight);

      const buffer = await chunk.getBufferAsync(chunk.getMIME());

      result.chunks.push({
        chunkPosition: { x, y },
        chunkRef: randomUUID(),
        image: chunk,
        buffer,
      });
    }
  }
  return result;
};

const saveImageToDisk = async (
  image: Buffer,
  fileName: string,
  ...directoryParts: string[]
): Promise<void> => {
  const pathWithoutFilename = joinPath(
    config.imageBasePath,
    joinPath(...directoryParts)
  );
  const imagePath = joinPath(pathWithoutFilename, fileName);

  console.info(`Saving to ${imagePath}`);
  await mkdir(pathWithoutFilename, { recursive: true });
  await writeFile(imagePath, image);
};

const imageExistsOnDisk = async (
  folderName: string,
  fileName: string
): Promise<boolean> => {
  const imagePath = joinPath(config.imageBasePath, folderName, fileName);
  return await stat(imagePath)
    .then(() => true)
    .catch(() => false);
};

export default {
  downloadImageFromUrl,
  splitImageIntoChunks,
  saveImageToDisk,
  imageExistsOnDisk,
};
