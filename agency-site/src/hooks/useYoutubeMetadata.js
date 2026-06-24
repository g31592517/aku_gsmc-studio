import { useEffect, useState } from "react";

export function useYoutubeMetadata(youtubeId) {
  const [metadata, setMetadata] = useState({
    title: "Loading…",
    authorName: "",
    isLoaded: false,
    hasError: false,
  });

  useEffect(() => {
    let isCancelled = false;

    async function fetchMetadata() {
      try {
        const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`
        );

        if (!response.ok) throw new Error("oEmbed request failed");

        const data = await response.json();

        if (!isCancelled) {
          setMetadata({
            title: data.title,
            authorName: data.author_name,
            isLoaded: true,
            hasError: false,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setMetadata({
            title: "Watch on YouTube",
            authorName: "",
            isLoaded: true,
            hasError: true,
          });
        }
      }
    }

    fetchMetadata();
    return () => { isCancelled = true; };
  }, [youtubeId]);

  return metadata;
}
