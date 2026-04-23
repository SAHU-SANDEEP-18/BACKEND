import React from 'react'
import { useSong } from '../hooks/useSong'
import './playlist.scss'

const Playlist = () => {
    const { playlist, currentSongIndex, handlePlaySong, currentMood, loading } = useSong()

    if (loading || playlist.length === 0) {
        return (
            <div className="playlist">
                <div className="playlist__empty">
                    <p>No songs found for this mood</p>
                </div>
            </div>
        )
    }

    return (
        <div className="playlist">
            <div className="playlist__header">
                <h2 className="playlist__title">
                    {currentMood?.charAt(0).toUpperCase() + currentMood?.slice(1)} Playlist
                </h2>
                <span className="playlist__count">{playlist.length} songs</span>
            </div>

            <div className="playlist__list">
                {playlist.map((song, index) => (
                    <div
                        key={song._id || index}
                        className={`playlist__item ${
                            index === currentSongIndex ? 'playlist__item--active' : ''
                        }`}
                        onClick={() => handlePlaySong(index)}
                    >
                        <div className="playlist__item-number">
                            {index === currentSongIndex ? (
                                <span className="playlist__item-playing">♫</span>
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>

                        <div className="playlist__item-image">
                            <img
                                src={song.posterUrl}
                                alt={song.title}
                                className="playlist__item-poster"
                            />
                        </div>

                        <div className="playlist__item-info">
                            <p className="playlist__item-title">{song.title}</p>
                            <span className="playlist__item-mood">{song.mood}</span>
                        </div>

                        {index === currentSongIndex && (
                            <div className="playlist__item-indicator">Now Playing</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Playlist
