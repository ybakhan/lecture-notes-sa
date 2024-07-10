import * as fs from "fs";

export type TranscribedMessage = {
  data: string;
  type?: string;
  timestamp?: string;
};

export const Delete = (filePath: string) => {
  fs.rm(filePath, (err) => {
    if (err) {
      console.error(
        `[transcribed-message] Error deleting file: ${filePath}`,
        err,
      );
    } else {
      console.log(`[transcribed-message] File deleted: ${filePath}`);
    }
  });
};

// Function to open the file
export const OpenFile = (filePath: string): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    fs.open(filePath, "a", (err, fd) => {
      if (err) {
        console.error(
          `[transcribed-message] Error opening file: ${filePath}`,
          err,
        );
        reject(err);
      } else {
        console.log(`[transcribed-message] File opened: ${filePath}`);
        resolve(fd);
      }
    });
  });
};

// Function to close the file
export const CloseFile = (fd: number) => {
  fs.close(fd, (err) => {
    if (err) {
      console.error("[transcribed-message] Error closing file", err);
    } else {
      console.log(`[transcribed-message] File closed: ${fd}`);
    }
  });
};

export const WriteFile = (fd: number, message: string) => {
  fs.write(fd, message, (err) => {
    if (err) {
      console.error("[transcribed-message] Error writing to file", err);
    } else {
      console.log("[transcribed-message] Wrote to file");
    }
  });
};
