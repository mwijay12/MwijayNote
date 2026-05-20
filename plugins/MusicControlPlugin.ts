import { registerPlugin, WebPlugin } from '@capacitor/core';

export interface MusicControlPlugin {
    updateMetadata(options: { title: string; artist: string; album: string; artworkUrl: string; duration: number }): Promise<void>;
    setPlaybackState(options: { state: 'playing' | 'paused' | 'stopped'; position: number; speed: number }): Promise<void>;
    setQueueInfo(options: { currentIndex: number; totalTracks: number }): Promise<void>;
    destroy(): Promise<void>;
}

export class MusicControlWeb extends WebPlugin implements MusicControlPlugin {
    async updateMetadata(options: { title: string; artist: string; album: string; artworkUrl: string; duration: number }): Promise<void> {
        console.log('MusicControlWeb: updateMetadata', options);
    }
    async setPlaybackState(options: { state: 'playing' | 'paused' | 'stopped'; position: number; speed: number }): Promise<void> {
        console.log('MusicControlWeb: setPlaybackState', options);
    }
    async setQueueInfo(options: { currentIndex: number; totalTracks: number }): Promise<void> {
        console.log('MusicControlWeb: setQueueInfo', options);
    }
    async destroy(): Promise<void> {
        console.log('MusicControlWeb: destroy');
    }
}

const MusicControl = registerPlugin<MusicControlPlugin>('MusicControl', {
    web: () => new MusicControlWeb(),
});

export { MusicControl };
