"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { LoadedFunctionStatus, useLoader } from "./hooks";
import Loading from "./components/Loading";
import Link from "next/link";

interface ITranscriptResponse {
  transcript: [string, string, string][];
}

enum Page {
  SelectFiles,
  Chose,
  Transcript,
  Translate,
  Loading,
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>(Page.SelectFiles);
  const [isConfiguringTranslation, setIsConfiguringTranslation] =
    useState(false);
  const [language, setLanguage] = useState("English");
  const [currentTranscriptions, setCurrentTranscriptions] =
    useState<ITranscriptResponse | null>(null);
  const {
    invoke: getTranscriptions,
    data: transcription,
    isLoading: isTranscriptionLoading,
    isSuccess: isTranscriptionSuccess,
    isError: isTranscriptionError,
    status: transcriptionsStatus,
  } = useLoader(async () => {
    if (files.length === 0) {
      throw new Error("Invalid file.");
    }

    const body = new FormData();
    body.append("content", files[0]);

    const request = await fetch("http://localhost:3000/api/transcript", {
      method: "POST",
      headers: {},
      body,
    });

    return (await request.json()) as ITranscriptResponse;
  }, [files]);
  const {
    invoke: getTranslation,
    data: translation,
    isLoading: isTranslationLoading,
    isSuccess: isTranslationSuccess,
    isError: isTranslationError,
    status: translationStatus,
  } = useLoader(
    async (language: string) => {
      if (!transcription) {
        throw new Error("Invalid transcription to translate.");
      }
      
      const body = { transcript: transcription.transcript, language };
      const request = await fetch("http://localhost:3000/api/translate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return (await request.json()) as ITranscriptResponse;
    },
    [transcription]
  );

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return;
    }

    setFiles(Array.from(e.dataTransfer.files));
    e.dataTransfer.clearData();
    navigate(Page.Chose);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setFiles(Array.from(e.target.files));
    navigate(Page.Chose);
  }

  function handleTranscript(e: React.MouseEvent<HTMLButtonElement>) {
    if (files.length === 0) {
      return;
    }

    console.log("Creating transcriptions...");
    getTranscriptions();
  }

  function handleReadTranscription() {
    navigate(Page.Transcript);
  }

  function handleTranslate() {
    // if (
    //   !["english", "portuguesse", "hebrew"].includes(language.toLowerCase())
    // ) {
    //   return;
    // }

    console.log("Creating translations...");
    getTranslation(language);
    setIsConfiguringTranslation(false);
  }

  function SelectFiles() {
    return (
      <div className="flex min-h-screen flex-row items-center justify-center">
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-10 text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          Drag & drop your here!
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
    );
  }

  function Chose() {
    const buttonText = {
      [LoadedFunctionStatus.Waiting]: "Transcript It!",
      [LoadedFunctionStatus.Error]: "¡Transcript Error!",
      [LoadedFunctionStatus.Success]: "Read Transcription!",
      [LoadedFunctionStatus.Loading]: "Loading...",
    };

    const buttonAction = {
      [LoadedFunctionStatus.Waiting]: handleTranscript,
      [LoadedFunctionStatus.Error]: handleTranscript,
      [LoadedFunctionStatus.Success]: handleReadTranscription,
      [LoadedFunctionStatus.Loading]: () => {},
    };

    return (
      <div className="flex min-h-screen flex-row items-center justify-center gap-x-2">
        {isTranscriptionLoading ? (
          <Loading />
        ) : (
          <>
            <button
              className="rounded-md cursor-pointer border-gray-300 border-solid border-2 p-10"
              type="button"
              onClick={() => navigate(Page.SelectFiles)}
              disabled={files.length === 0}
            >
              Back
            </button>
            <button
              className="rounded-md cursor-pointer border-gray-300 border-solid border-2 p-10"
              type="button"
              onClick={buttonAction[transcriptionsStatus]}
              disabled={files.length === 0}
            >
              {buttonText[transcriptionsStatus]}
            </button>
          </>
        )}
      </div>
    );
  }

  function Transcription() {
    const value = currentTranscriptions!.transcript
      .map(([, time, line]) => `${time}:\n  ${line}`)
      .join("\n");
    const blobPlain = new Blob([value], { type: "text/plain" });
    const blobJson = new Blob([JSON.stringify(transcription)], {
      type: "application/json",
    });

    return (
      <div className="flex min-h-screen flex-col items-center justify-evenly gap-x-2">
        {isTranslationLoading ? (
          <Loading />
        ) : (
          <>
            <textarea
              readOnly
              value={value}
              className="w-4/5 min-h-64 text-black p-2"
              wrap="off"
            />
            <div className="flex flex-row items-center gap-x-2 w-4/5">
              {isConfiguringTranslation ? (
                <div className="flex flex-col gap-y-2 items-center w-full">
                  <input
                    className="w-full invalid:bg-red-700 text-black"
                    type="text"
                    placeholder="Write the language here."
                    value={language}
                    onChange={(e) => setLanguage(e.currentTarget.value)}
                    pattern="[\wáéíóúÁÉÍÓÚñÑ]+"
                    required
                  />
                  <div className="flex flex-row gap-x-2">
                    <button
                      className="border-2 rounded-md h-14 px-1 w-24"
                      onClick={() => setIsConfiguringTranslation(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="border-2 rounded-md h-14 px-1 w-24"
                      onClick={handleTranslate}
                    >
                      Translate
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href={URL.createObjectURL(blobJson)}
                    rel="noreferrer"
                    target="_blank"
                    download="transcription.json"
                  >
                    <button className="border-2 rounded-md h-14 px-1">
                      Download JSON
                    </button>
                  </Link>
                  <Link
                    href={URL.createObjectURL(blobPlain)}
                    rel="noreferrer"
                    target="_blank"
                    download="transcription.txt"
                  >
                    <button className="border-2 rounded-md h-14 px-1">
                      Download Text
                    </button>
                  </Link>
                  <button
                    className="border-2 rounded-md h-14 px-1"
                    onClick={() => setIsConfiguringTranslation(true)}
                  >
                    Translate
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  useEffect(() => {
    if (transcriptionsStatus === LoadedFunctionStatus.Success) {
      setCurrentTranscriptions(transcription!);
    }
  }, [transcriptionsStatus]);

  useEffect(() => {
    if (translationStatus === LoadedFunctionStatus.Success) {
      setCurrentTranscriptions(translation!);
    }
  }, [translationStatus]);

  function navigator() {
    switch (currentPage) {
      case Page.SelectFiles:
        return SelectFiles();
      case Page.Chose:
        return Chose();
      case Page.Transcript:
        return Transcription();
      case Page.Loading:
        return Loading();
    }
  }

  function navigate(page: Page) {
    setCurrentPage(page);
  }

  return (
    <main onDragOver={handleDragOver} onDrop={handleDrop}>
      {navigator()}
      {/* 

      <button
        className="rounded-md cursor-pointer border-gray-300 border-solid border-2 p-10"
        type="button"
        onClick={handleTranscript}
        disabled={files.length === 0}
      >
        Transcript
      </button>
      <button
        className="rounded-md cursor-pointer border-gray-300 border-solid border-2 p-10"
        type="button"
        onClick={handleTranscript}
        disabled={files.length === 0}
      >
        Translate
      </button>
      {files.length > 0 && (
        <div>
          <h2>Files</h2>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )} */}
    </main>
  );
}
