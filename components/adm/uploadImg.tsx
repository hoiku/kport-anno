"use client";

import { useState } from "react";

export default function UploadImg() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage("파일을 선택하세요.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);

    const res = await fetch("/api/img", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setUploading(false);

    if (res.ok) {
      setMessage("✅ 업로드 성공!");
    } else {
      setMessage(`❌ 실패: ${result.error}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 bg-zinc-900 p-6 rounded-2xl shadow-xl space-y-4 text-white"
    >
      <h2 className="text-xl font-bold mb-4">🖼️ 이미지 업로드</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />

      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 bg-zinc-800 rounded-md text-white focus:outline-none"
      />

      <textarea
        placeholder="설명"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-2 bg-zinc-800 rounded-md text-white focus:outline-none resize-none h-24"
      />

      <button
        type="submit"
        disabled={uploading}
        className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
          uploading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {uploading ? "업로드 중..." : "업로드하기"}
      </button>

      {message && (
        <p className="text-sm text-center mt-2">
          {message}
        </p>
      )}
    </form>
  );
}
