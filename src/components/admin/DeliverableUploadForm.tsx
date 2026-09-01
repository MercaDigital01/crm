"use client";

import { useState } from "react";
import {
  createDeliverable,
  getUploadSignature,
} from "@/app/admin/(dashboard)/upload-actions";

export function DeliverableUploadForm({ clientId }: { clientId: string }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setStatus("uploading");
    setError(null);

    try {
      const creds = await getUploadSignature(`clientes/${clientId}/entregables`);
      if (!creds.cloudName || !creds.apiKey) {
        throw new Error("Cloudinary no está configurado");
      }

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", creds.apiKey);
      body.append("timestamp", String(creds.timestamp));
      body.append("signature", creds.signature);
      body.append("folder", creds.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${creds.cloudName}/auto/upload`,
        { method: "POST", body }
      );
      if (!uploadRes.ok) {
        throw new Error("Falló la subida a Cloudinary");
      }
      const uploaded = await uploadRes.json();

      const formData = new FormData();
      formData.set("clientId", clientId);
      formData.set("title", title.trim());
      formData.set("fileUrl", uploaded.secure_url);
      formData.set("cloudinaryPublicId", uploaded.public_id);
      formData.set("fileType", uploaded.resource_type ?? "raw");
      await createDeliverable(formData);

      setTitle("");
      setFile(null);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-end"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título del entregable"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        required
        className="text-sm"
      />
      <button
        type="submit"
        disabled={status === "uploading"}
        className="w-fit shrink-0 rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "uploading" ? "Subiendo…" : "Subir entregable"}
      </button>
      {error && <span className="text-xs text-md-red">{error}</span>}
    </form>
  );
}
