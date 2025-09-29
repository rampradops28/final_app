import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Simple audio recorder that captures microphone audio and returns a base64 string
export async function recordAudioBase64({ durationMs = 3000 } = {}) {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone not available");
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks = [];
  const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
  return await new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e) => reject(e.error || new Error("Recorder error"));
    recorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = String(reader.result || "");
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        reject(err);
      } finally {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    recorder.start();
    setTimeout(() => {
      try { recorder.stop(); } catch (_) {}
    }, durationMs);
  });
}