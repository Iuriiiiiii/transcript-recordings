import { NextResponse } from "next/server";
import OpenAI from "openai";
import "lostjs/common";
import { SplitType } from "lostjs/common/src/enums";

interface ITranscriptionBody {
  transcript: [string, string, string][];
  language?: string;
}
interface IPromptResult {
  lines: string[];
}

function isTranscriptionBody(body: unknown): body is ITranscriptionBody {
  return (
    body instanceof Object &&
    "transcript" in body &&
    body.transcript instanceof Array
  );
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!isTranscriptionBody(body)) {
    throw new Error("Bad request.");
  }

  const { transcript, language = "english" } = body;

  const lines = transcript.reduce(
    (accumulator, [, , text = ""]) => accumulator.concat(text),
    [] as string[]
  );

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  const prompt = `
{"lines": ${JSON.stringify(lines)}}

Translate the previous JSON to ${language}. Answer in JSON.
  `.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [{ role: "user", content: prompt }],
  });
  const answer = response.choices[0].message.content;

  if (answer === null) {
    throw new Error("Error using Chat GPT for message.");
  }
  const { lines: translatedLines } = JSON.parse(answer) as IPromptResult;

  for (let i = 0; i < transcript.length; i++) {
    try {
      transcript[i][2] = translatedLines[i];
    } catch {}
  }

  return NextResponse.json({ transcript });
}

export const dynamic = "force-dynamic";
