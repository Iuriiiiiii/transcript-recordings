import { NextResponse } from "next/server";
import OpenAI from "openai";
import "lostjs/common";
import { SplitType } from "lostjs/common/src/enums";

export async function POST(req: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  const form = await req.formData();
  if (!form.has("content")) {
    throw new Error("Form data with 'content' field expected.");
  }

  const file = form.get("content")!;

  /**
   * We cant do "!(content instanceof File)" because File its not defined even
   * if the intellisense told us the oposite.
   *
   * This is a little bit hacky, but works.
   */
  if (file.constructor.name !== "File") {
    throw new Error("File expected on 'content' field.");
  }

  const transcription = (await openai.audio.transcriptions.create({
    model: "whisper-1",
    // We can use File to change the type tho...
    file: file as File,
    response_format: "srt",
    prompt: "webtroniclabs",
  })) as unknown as string;

  const content = transcription
    .split("\n")
    .filter(Boolean)
    .split(3, SplitType.Parallelism);

  return NextResponse.json({ transcript: content });
}

export const dynamic = "force-dynamic";
