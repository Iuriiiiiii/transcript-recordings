"use client";
import { useRef, useState } from "react";

const controller = new AbortController();

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

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
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setFiles(Array.from(e.target.files));
  }

  async function handleTranscript(e: React.MouseEvent<HTMLButtonElement>) {
    if (files.length === 0) {
      return;
    }

    // try {
    //   controller.abort("Preventive abort.");
    // } catch {}
    const body = {};

    const response = await fetch("http://localhost:3000/api/transcript", {
      method: "GET",
      headers: {},
      signal: controller.signal,
    });

    console.log("DEBUG ON page.tsx:47", { response });

    // const response = await fetch("http://localhost:3000/", {
    //   method: "POST",
    //   headers: {},
    //   body: JSON.stringify(body),
    //   signal: controller.signal,
    // });

    // console.log("DEBUG ON page.tsx:47", { response });
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-10"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
      <button
        className="rounded-md cursor-pointer border-gray-300 border-solid border-2 p-10"
        type="button"
        onClick={handleTranscript}
        disabled={files.length === 0}
      >
        Transcript
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
      )}
    </main>
  );
}
