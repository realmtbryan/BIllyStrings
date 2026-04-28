/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  Play, Search, Calendar, MapPin, User, Video, X, Music, 
  Info, MonitorPlay, Home, ThumbsUp, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SHOWS } from './data/shows';
import { Show } from './types';

const getDisplayThumbnail = (show: Show) => {
  if (!show.videoUrl) return ''; // Return empty to trigger black background
  
  if (show.videoUrl.includes('drive.google.com')) {
    const match = show.videoUrl.match(/\/d\/([^/?#]+)/) || show.videoUrl.match(/[?&]id=([^&#]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }
  if (show.videoUrl.includes('youtube.com') || show.videoUrl.includes('youtu.be')) {
    const match = show.videoUrl.match(/[?&]v=([^&#]+)/) || show.videoUrl.match(/be\/([^/?#]+)/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  return show.thumbnailUrl || '';
};

const getVideoPlatform = (url?: string) => {
  if (!url) return null;
  if (url.includes('drive.google.com')) return 'Google Drive';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  return null;
};

const getEmbedUrl = (url?: string) => {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/').split('&')[0];
  }
  if (url.includes('youtu.be/')) {
     return url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
  }
  if (url.includes('drive.google.com/open?id=')) {
    const id = new URL(url).searchParams.get('id');
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  return url;
};

export default function App() {
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');

  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(SHOWS.map(s => s.year))).sort((a, b) => a - b);
    return ['All', ...uniqueYears];
  }, []);

  const filteredShows = useMemo(() => {
    return SHOWS.filter(show => {
      const matchesSearch = 
        show.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = selectedYear === 'All' || show.year === selectedYear;
      return matchesSearch && matchesYear;
    }).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.date.localeCompare(b.date);
    });
  }, [searchQuery, selectedYear]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <header className="sticky top-0 z-40 bg-[#0f0f0f] border-b border-white/10 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer">
            <MonitorPlay className="w-8 h-8 text-red-600 fill-red-600" />
            <span className="text-xl font-bold tracking-tighter">StringsArchive</span>
          </div>
        </div>
        <div className="flex-1 max-w-2xl px-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search shows, venues, cities..."
              className="w-full bg-[#121212] border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">BS</div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-60 hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-3 border-r border-white/5">
          <nav className="space-y-1">
            <SidebarItem icon={Home} label="Home" active />
            <SidebarItem icon={Video} label="Shorts" />
            <SidebarItem icon={Music} label="Subscriptions" />
            <hr className="my-3 border-white/10" />
            <h3 className="px-3 mb-2 text-sm font-semibold opacity-60">Years</h3>
            {years.map(year => (
              <SidebarItem 
                key={year} 
                icon={Calendar} 
                label={year.toString()} 
                active={selectedYear === year}
                onClick={() => setSelectedYear(typeof year === 'string' ? 'All' : year)}
              />
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <div className="flex gap-2 overflow-x-auto pb-4 lg:hidden no-scrollbar">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(typeof year === 'string' ? 'All' : year)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedYear === year ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 mt-4">
            {filteredShows.map((show) => (
              <motion.div 
                layoutId={`show-${show.id}`}
                key={show.id} 
                className="group cursor-pointer"
                onClick={() => setSelectedShow(show)}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative mb-3">
                  {getDisplayThumbnail(show) ? (
                    <img 
                      src={getDisplayThumbnail(show)} 
                      alt={show.venue} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-black flex items-center justify-center border border-white/10">
                       <Video className="w-8 h-8 text-gray-700" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium flex gap-1 items-center">
                    {getVideoPlatform(show.videoUrl) && (
                      <span className={getVideoPlatform(show.videoUrl) === 'YouTube' ? 'text-red-400' : 'text-blue-400'}>
                        {getVideoPlatform(show.videoUrl)}
                      </span>
                    )}
                    <span className="opacity-50">|</span>
                    <span>1080p</span>
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold border border-white/10">
                      <Music className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold line-clamp-2 text-[0.95rem] leading-tight mb-1">
                      {show.artist} {show.date} {show.venue}, {show.city}, {show.state}
                    </h3>
                    <div className="text-sm text-gray-400 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{show.city}, {show.state}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{show.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selectedShow && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0f0f0f] overflow-y-auto"
          >
            <div className="max-w-[1700px] mx-auto min-h-screen flex flex-col xl:flex-row p-0 md:p-6 gap-6">
              <div className="block xl:hidden sticky top-0 bg-[#0f0f0f]/80 backdrop-blur-md z-10 p-4 border-b border-white/10 flex items-center justify-between">
                 <span className="font-bold truncate max-w-[70%]">{selectedShow.venue}</span>
                 <button onClick={() => setSelectedShow(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                <div className="aspect-video bg-black w-full rounded-none md:rounded-xl overflow-hidden relative shadow-2xl">
                  {selectedShow.videoUrl ? (
                    <iframe 
                      src={getEmbedUrl(selectedShow.videoUrl)} 
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      title={selectedShow.venue}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black border border-white/5">
                      <Video className="w-16 h-16 mb-4 text-gray-700" />
                      <p className="text-xl font-medium opacity-50">Video link unavailable</p>
                    </div>
                  )}
                </div>

                <div className="px-4 md:px-0">
                  <h1 className="text-xl md:text-2xl font-bold mb-4">
                    {selectedShow.artist} {selectedShow.date} {selectedShow.venue}, {selectedShow.city}, {selectedShow.state}
                  </h1>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center font-bold">BS</div>
                      <div>
                        <div className="font-bold">Billy Strings Official Archivist</div>
                        <div className="text-xs text-gray-400">Archive Upload</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex bg-white/10 rounded-full overflow-hidden">
                        <button className="px-4 py-2 hover:bg-white/10 border-r border-white/10 flex items-center gap-2 text-sm font-medium">
                          <ThumbsUp className="w-4 h-4" /> 12K
                        </button>
                        <button className="px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-sm font-medium">
                          <Share2 className="w-4 h-4" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full xl:w-[400px] px-4 md:px-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">Up next</h2>
                </div>
                <div className="space-y-3 pb-20">
                  {filteredShows.filter(s => s.id !== selectedShow.id).slice(0, 10).map((show) => (
                    <div key={show.id} className="flex gap-2 group cursor-pointer" onClick={() => setSelectedShow(show)}>
                      <div className="w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black">
                         {getDisplayThumbnail(show) ? (
                            <img src={getDisplayThumbnail(show)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center border border-white/10"><Video className="w-5 h-5 text-gray-700"/></div>
                         )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold line-clamp-2 leading-tight mb-1">
                          {show.artist} {show.date} {show.venue}
                        </h4>
                        <p className="text-xs text-gray-400 font-medium mt-1">{show.city}, {show.state}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setSelectedShow(null)} className="w-full py-3 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors hidden xl:block">
                    Back to Home
                  </button>
                </div>
              </div>

               <button onClick={() => setSelectedShow(null)} className="hidden xl:flex fixed top-6 right-6 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full transition-all group z-[60]">
                <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon: Icon, label, active = false, onClick }: SidebarItemProps) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-lg transition-colors group ${active ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
      <span className={`text-sm font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
}
