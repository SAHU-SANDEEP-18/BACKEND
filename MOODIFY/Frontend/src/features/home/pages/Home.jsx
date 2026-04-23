import React from "react";
import FaceExpression from "../../Expression/components/FaceExpression";
import Player from "../components/Player";
import Playlist from "../components/Playlist";
import { useSong } from "../hooks/useSong";
import Navbar from "../../auth/pages/Navbar";

const Home = () => {
  const { handleGetPlaylist } = useSong();

  return (
    <>
      <Navbar />
      <FaceExpression
        onClick={(expression) => {
          handleGetPlaylist({ mood: expression });
        }}
      />
      <Player />
      <Playlist />
    </>
  );
};

export default Home;
