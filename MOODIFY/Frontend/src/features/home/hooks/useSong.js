import { getSong, getPlaylist } from "../service/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";

export const useSong = () => {
  const context = useContext(SongContext);

  const {
    loading,
    setLoading,
    song,
    setSong,
    playlist,
    setPlaylist,
    currentSongIndex,
    setCurrentSongIndex,
    currentMood,
    setCurrentMood,
  } = context;

  async function handleGetSong({ mood }) {
    setLoading(true);
    const data = await getSong({ mood });
    setSong(data.song);
    setLoading(false);
  }

  async function handleGetPlaylist({ mood }) {
    setLoading(true);
    try {
      const data = await getPlaylist({ mood });
      if (data.songs && data.songs.length > 0) {
        setPlaylist(data.songs);
        setCurrentMood(mood);
        setCurrentSongIndex(0);
        setSong(data.songs[0]);
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    } finally {
      setLoading(false);
    }
  }

  function handlePlaySong(index) {
    if (index >= 0 && index < playlist.length) {
      setCurrentSongIndex(index);
      setSong(playlist[index]);
    }
  }

  function handleNextSong() {
    const nextIndex = currentSongIndex + 1;
    if (nextIndex < playlist.length) {
      handlePlaySong(nextIndex);
    }
  }

  function handlePreviousSong() {
    const prevIndex = currentSongIndex - 1;
    if (prevIndex >= 0) {
      handlePlaySong(prevIndex);
    }
  }

  return {
    loading,
    song,
    playlist,
    currentSongIndex,
    currentMood,
    handleGetSong,
    handleGetPlaylist,
    handlePlaySong,
    handleNextSong,
    handlePreviousSong,
  };
};

