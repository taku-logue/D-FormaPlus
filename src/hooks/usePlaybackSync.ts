import { useState, useEffect, useCallback } from "react";

export function usePlaybackSync(
  youtubePlayer: any,
  isPlaying: boolean,
  offset: number = 0,
) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      if (
        isPlaying &&
        youtubePlayer &&
        typeof youtubePlayer.getCurrentTime === "function"
      ) {
        const vTime = youtubePlayer.getCurrentTime();
        setCurrentTime(Math.max(0, vTime - offset));
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    if (isPlaying) animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, youtubePlayer, offset]);

  const handleSeek = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const val = parseFloat(e.currentTarget.value);
      setCurrentTime(val);
      if (youtubePlayer && typeof youtubePlayer.seekTo === "function") {
        youtubePlayer.seekTo(val + offset, true);
      }
    },
    [youtubePlayer, offset],
  );

  return { currentTime, setCurrentTime, handleSeek };
}
