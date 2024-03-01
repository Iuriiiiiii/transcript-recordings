import { getTempPath } from "@/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

type ResponseData = {
  message: any;
};

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method!.toUpperCase() !== "POST") {
    throw new Error("Invalid method.");
  }

  //@ts-ignore
  console.log("DEBUG ON transcript.tsx:17", req.formData());

  // console.log("DEBUG ON transcript.tsx:17", req);

  // const openai = new OpenAI({
  //   apiKey: process.env.OPENAI_KEY,
  // });

  // const transcription = (await openai.audio.transcriptions.create({
  //   model: "whisper-1",
  //   file: ,
  //   response_format: "srt",
  // })) as unknown as string;

  //@ts-ignore
  res.status(200).json({ message: "t" });
}
