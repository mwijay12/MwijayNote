
import { useState, useEffect, useCallback } from 'react';
import { UserTrack, Playlist } from '../types';
import { db } from '../utils/db';

export const useUserMusic = () => {
  const [userTracks, setUserTracks] = useState<UserTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const load = async () => {
        try {
            const tracks = await db.getAll('userTracks');
            setUserTracks(tracks);
            const lists = await db.getAll('playlists');
            setPlaylists(lists);
        } catch (error) {
            console.error('Failed to load music data from DB', error);
        }
    };
    load();
  }, []);

  const addUserTrack = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
        const newTrack: UserTrack = {
            id: Date.now().toString() + Math.random().toString(36).substr(2,5),
            name: file.name,
            url: loadEvent.target?.result as string,
        };
        
        try {
            await db.add('userTracks', newTrack);
            setUserTracks(prev => [...prev, newTrack]);
        } catch (e) {
            console.error("Failed to save track to DB", e);
            alert("Could not save track. File might be too large.");
        }
    };
    reader.readAsDataURL(file);
  }, []);

  const createPlaylist = useCallback(async (name: string) => {
      const newPlaylist: Playlist = {
          id: Date.now().toString(),
          name,
          trackIds: []
      };
      await db.add('playlists', newPlaylist);
      setPlaylists(prev => [...prev, newPlaylist]);
  }, []);

  const addTrackToPlaylist = useCallback(async (playlistId: string, trackId: string) => {
      const playlist = playlists.find(p => p.id === playlistId);
      if (playlist && !playlist.trackIds.includes(trackId)) {
          const updatedPlaylist = { ...playlist, trackIds: [...playlist.trackIds, trackId] };
          await db.put('playlists', updatedPlaylist);
          setPlaylists(prev => prev.map(pl => pl.id === playlistId ? updatedPlaylist : pl));
      }
  }, [playlists]);

  return { userTracks, playlists, addUserTrack, createPlaylist, addTrackToPlaylist };
};
