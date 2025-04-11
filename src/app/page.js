'use client'
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    console.log("🚀 Downloading images started...");

    try {
      const res = await fetch("/api/download");
      const data = await res.json();

      if (res.ok) {
        console.log("✅ Success:", data.message);
      } else {
        console.error("❌ Error:", data.error);
      }
    } catch (error) {
      console.error("❌ API Call Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Shopify Image Downloader</h1>
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Downloading..." : "Download Product Images"}
      </button>
    </div>
  );
}
