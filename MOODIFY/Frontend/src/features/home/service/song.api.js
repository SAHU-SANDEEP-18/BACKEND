import axios from "axios";

const api = axios.create({
  baseURL: "https://moodify-deployement.onrender.com/",
  withCredentials: true,
});

export async function getSong({mood}){
    const response = await api.get("/api/songs?mood=" + mood)
    console.log(response)
    return response.data
}

export async function getPlaylist({mood}){
    const response = await api.get("/api/songs?mood=" + mood)
    console.log(response)
    return response.data
}