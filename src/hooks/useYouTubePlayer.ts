import { useState, useEffect } from "react";

export function useYouTubePlayer(videoId: string) {
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setYoutubePlayer(null);
      setIsPlaying(false);
      return;
    }

    let player: any = null;

    const loadVideo = () => {
      const container = document.getElementById("youtube-player-container");
      if (container) container.innerHTML = "";

      player = new (window as any).YT.Player("youtube-player-container", {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          origin:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
        events: {
          onReady: (event: any) => setYoutubePlayer(event.target),
          onStateChange: (event: any) => {
            const state = (window as any).YT.PlayerState;
            if (event.data === state.PLAYING) setIsPlaying(true);
            else if (event.data === state.PAUSED) setIsPlaying(false);
          },
        },
      });
    };

    if (window && (window as any).YT && (window as any).YT.Player) {
      loadVideo();
    } else {
      const existingCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (existingCallback) existingCallback();
        loadVideo();
      };
      if (
        !document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]',
        )
      ) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }

    return () => {
      if (player && typeof player.destroy === "function") player.destroy();
    };
  }, [videoId]);

  // isPlaying の状態と YouTube Player の実態を同期させる
  useEffect(() => {
    if (!youtubePlayer || typeof youtubePlayer.playVideo !== "function") return;
    if (isPlaying) youtubePlayer.playVideo();
    else youtubePlayer.pauseVideo();
  }, [isPlaying, youtubePlayer]);

  return { youtubePlayer, isPlaying, setIsPlaying };
}
