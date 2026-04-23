import { createContext } from "react";
import { useState } from "react";

export const SongContext = createContext();

export const SongContextProvider = ({ children }) => {
  const defaultSong = {
    url: "https://ik.imagekit.io/brmmnvqva/Moodify/songs/Jatt_Mehkma__RiskyjaTT.CoM__IUem8Jzu0.mp3",
    posterUrl:
      "https://ik.imagekit.io/brmmnvqva/Moodify/songsPosters/Jatt_Mehkma__RiskyjaTT.CoM__5iv2KG-T7.jpeg",
    title: "Jatt Mehkma (RiskyjaTT.CoM)",
    mood: "happy",
  };

  const [song, setSong] = useState(defaultSong);
  const [playlist, setPlaylist] = useState([defaultSong]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentMood, setCurrentMood] = useState("happy");
  const [loading, setLoading] = useState(false);

  return (
    <SongContext.Provider
      value={{
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
      }}
    >
      {children}
    </SongContext.Provider>
  );
};

