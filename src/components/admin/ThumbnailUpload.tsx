"use client";

import { ImageUp } from "lucide-react";
import { useRef, useState } from "react";
import {
  getUploadSignature,
  setContentItemThumbnail,
} from "@/app/admin/(dashboard)/upload-actions";

export function ThumbnailUpload({
  itemId,
  clientId,
}: {
  itemId: string;
  clientId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const creds = await getUploadSignature(`clientes/${clientId}/contenido`);
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
        `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`,
        { method: "POST", body }
      );
      if (!uploadRes.ok) throw new Error("Falló la subida");
      const uploaded = await uploadRes.json();

      const formData = new FormData();
      formData.set("itemId", itemId);
      formData.set("thumbnailUrl", uploaded.secure_url);
      await setContentItemThumbnail(formData);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        title="Subir miniatura"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
      >
        <ImageUp size={14} strokeWidth={2} />
      </button>
    </>
  );
}
