import axios from "axios";
import { createWriteStream } from "fs";

export async function downloadFile(url: string, outputPath: string) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(createWriteStream(outputPath));

  return new Promise((resolve: Function, reject: Function) => {
    response.data.on("end", () => {
      resolve();
    });

    response.data.on("error", (err: unknown) => {
      reject(err);
    });
  });
}
