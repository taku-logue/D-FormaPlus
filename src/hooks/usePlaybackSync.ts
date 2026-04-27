import { useState, useEffect, useCallback } from "react";

// 再生同期フック
export function usePlaybackSync(
  youtubePlayer: any,
  isPlaying: boolean,
  offset: number = 0,
  firstFrameTime: number = 0,
) {
  // シミュレーション側の現在時間
  const [currentTime, setCurrentTime] = useState(0);

  // 動画->シミュレーションの同期
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      if (
        isPlaying &&
        youtubePlayer &&
        typeof youtubePlayer.getCurrentTime === "function"
      ) {
        // YouTubeから正確な現在の再生時間を取得
        const vTime = youtubePlayer.getCurrentTime();
        // オフセットの計算
        setCurrentTime(vTime - offset + firstFrameTime);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    if (isPlaying) animationFrameId = requestAnimationFrame(animate);
    // クリーンアップ関数（再生が止まったときにループを強制終了）
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, youtubePlayer, offset]);

  // シミュレーション->動画の同期
  const handleSeek = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      // スライダーの現在時間取得
      const val = parseFloat(e.currentTarget.value);
      setCurrentTime(val);
      if (youtubePlayer && typeof youtubePlayer.seekTo === "function") {
        youtubePlayer.seekTo(val + offset - firstFrameTime, true);
      }
    },
    [youtubePlayer, offset, firstFrameTime],
  );

  return { currentTime, setCurrentTime, handleSeek };
}
