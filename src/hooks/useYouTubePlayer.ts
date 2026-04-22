// src/hooks/useYouTubePlayer.ts
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
      // 🌟 修正ポイント：Reactが管理する外箱を取得
      const wrapper = document.getElementById("youtube-wrapper");
      if (wrapper) {
        // 箱の中に、YouTubeにすり替えられてもいい「使い捨てのdiv」を純粋なJSで生成する
        wrapper.innerHTML =
          '<div id="youtube-player-target" style="width: 100%; height: 100%;"></div>';
      }

      // 生成した使い捨てdivの方をYouTube APIに渡す
      player = new (window as any).YT.Player("youtube-player-target", {
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
      // クリーンアップ時に外箱の中身も空にしておく
      const wrapper = document.getElementById("youtube-wrapper");
      if (wrapper) wrapper.innerHTML = "";
    };
  }, [videoId]);

  useEffect(() => {
    if (!youtubePlayer || typeof youtubePlayer.playVideo !== "function") return;
    if (isPlaying) youtubePlayer.playVideo();
    else youtubePlayer.pauseVideo();
  }, [isPlaying, youtubePlayer]);

  return { youtubePlayer, isPlaying, setIsPlaying };
}
