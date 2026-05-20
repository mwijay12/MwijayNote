import React, { useMemo } from 'react';
import { JournalEntry } from '../types';
import { ArrowLeftIcon, CameraIcon } from './Icons';

interface PhotoGalleryScreenProps {
  journals: JournalEntry[];
  onBack: () => void;
  onPreviewJournal: (journal: JournalEntry) => void;
}

interface Photo {
  src: string;
  journalId: string;
  journalTitle: string;
}

const PhotoGalleryScreen: React.FC<PhotoGalleryScreenProps> = ({ journals, onBack, onPreviewJournal }) => {
  const allPhotos = useMemo<Photo[]>(() => {
    const photos: Photo[] = [];
    const tempDiv = document.createElement('div');
    
    // Reverse journals to show newest photos first
    const reversedJournals = [...journals].reverse();

    for (const journal of reversedJournals) {
      // Extract from HTML content
      tempDiv.innerHTML = journal.content;
      const images = tempDiv.querySelectorAll('img');
      images.forEach(img => {
        photos.push({
          src: img.src,
          journalId: journal.id,
          journalTitle: journal.title,
        });
      });

      // Extract from attached files
      journal.files?.forEach(file => {
        if (file.type.startsWith('image/')) {
          photos.push({
            src: file.data,
            journalId: journal.id,
            journalTitle: journal.title,
          });
        }
      });
    }
    return photos;
  }, [journals]);

  return (
    <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-jet">
      <header className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif mx-auto">Photo Gallery</h2>
        <div className="w-10"></div>
      </header>

      <div className="flex-grow overflow-y-auto pb-4">
        {allPhotos.length === 0 ? (
          <div className="text-center text-dun py-20">
            <CameraIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
            <h3 className="font-semibold text-lg text-isabelline">No Photos Yet</h3>
            <p>Add photos to your journal entries to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {allPhotos.map((photo, index) => (
              <button 
                key={index} 
                onClick={() => onPreviewJournal(journals.find(j => j.id === photo.journalId)!)}
                className="aspect-square bg-card rounded-lg overflow-hidden group relative"
              >
                <img src={photo.src} alt="Journal entry" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs font-semibold truncate">{photo.journalTitle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGalleryScreen;
