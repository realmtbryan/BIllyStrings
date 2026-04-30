/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Play, Search, Calendar, MapPin, Video, X, Music, 
  MonitorPlay, Home, Folder, FolderOpen, ChevronRight, ChevronDown, 
  Settings, Headphones, Database, ListMusic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SHOWS } from './data/shows';
import { Show } from './types';

const getDisplayThumbnail = (show: Show) => {
  if (!show.videoUrl) return ''; 
  if (show.videoUrl.includes('drive.google.com')) {
    const match = show.videoUrl.match(/\/d\/([^/?#]+)/) || show.videoUrl.match(/[?&]id=([^&#]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }
  if (show.videoUrl.includes('youtube.com') || show.videoUrl.includes('youtu.be')) {
    const match = show.videoUrl.match(/[?&]v=([^&#]+)/) || show.videoUrl.match(/embed\/([^/?#]+)/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }
  return ''; 
};

const getVideoPlatform = (url?: string) => {
  if (!url) return null;
  if (url.includes('drive.google.com')) return 'Drive';
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

const getMonthName = (monthNum: number) => {
  const date = new Date();
  date.setMonth(monthNum - 1);
  return date.toLocaleString('en-US', { month: 'long' });
};

function SmartThumbnail({ show, className }: { show: Show, className?: string }) {
  const initialSrc = getDisplayThumbnail(show);
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  if (!show.videoUrl) {
    return (
      <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center border border-white/5">
        <Video className="w-8 h-8 text-gray-800 mb-2" />
        <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">No Video</span>
      </div>
    );
  }

  if (hasError || !imgSrc) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center border border-white/5">
         <MonitorPlay className="w-8 h-8 text-gray-700 mb-2 opacity-50" />
         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center px-2 leading-tight">Audio / Video Available<br/>(Cover Missing)</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={show.venue}
      className={className || "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"}
      onError={() => setHasError(true)}
    />
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Default to null so the main view stays empty and clean until a selection is made
  const [expandedYears, setExpandedYears] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<{year: number | null, month: number | null}>({ year: null, month: null });
  
  const [showSettings, setShowSettings] = useState(false);
  const [nugsToken, setNugsToken] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('nugsToken');
    if (savedToken) setNugsToken(savedToken);
  }, []);

  const saveNugsToken = (token: string) => {
    setNugsToken(token);
    localStorage.setItem('nugsToken', token);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'billygoat33') {
      setIsAuthenticated(true);
    } else {
      setLoginError(true);
      setPasscode('');
    }
  };

  const showsByYearMonth = useMemo(() => {
    const grouped: Record<number, Record<number, Show[]>> = {};
    SHOWS.forEach(show => {
      const parts = show.date.split('-');
      if (parts.length < 3) return;
      
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];
      grouped[year][month].push(show);
    });
    return grouped;
  }, []);

  const toggleYear = (year: number) => {
    setExpandedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const filteredShows = useMemo(() => {
    // If no search query and no year selected, return empty array to keep the dashboard clean
    if (!searchQuery && activeFilter.year === null) return [];

    return SHOWS.filter(show => {
      if (searchQuery) {
        return show.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
               show.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
               show.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
               show.date.includes(searchQuery);
      }
      
      if (activeFilter.year !== null) {
        const showYear = parseInt(show.date.split('-')[0], 10);
        if (showYear !== activeFilter.year) return false;
        
        if (activeFilter.month !== null) {
          const showMonth = parseInt(show.date.split('-')[1], 10);
          if (showMonth !== activeFilter.month) return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // 1st Priority: Sort Chronologically (Forward in time)
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;

      // 2nd Priority: If dates match, sort by Quality (Drive -> Recap -> YouTube)
      const typeOrder = { 'drive': 1, 'recap': 2, 'youtube': 3 };
      const orderA = typeOrder[a.sourceType || 'youtube'] || 3;
      const orderB = typeOrder[b.sourceType || 'youtube'] || 3;
      return orderA - orderB;
    });
  }, [searchQuery, activeFilter]);

  const years = Object.keys(showsByYearMonth).map(y => parseInt(y, 10)).sort((a, b) => b - a);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4 selection:bg-red-500/30">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-sm"
        >
          <div className="flex justify-center mb-6 relative">
            <MonitorPlay className="w-16 h-16 text-gray-800" />
            <div className="absolute -bottom-2 -right-2 bg-[#0f0f0f] rounded-full p-1 border border-white/5">
                <Lock className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <form onSubmit={handleLogin} className="bg-[#121212] p-8 rounded-2xl border border-white/5 shadow-2xl">
            <h1 className="text-xl font-bold mb-2 text-center tracking-widest uppercase">Archive Access</h1>
            <p className="text-gray-500 text-xs text-center mb-8 uppercase tracking-wider">Restricted to authorized users</p>
            
            <input 
              type="password" 
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setLoginError(false); }}
              className={`w-full bg-[#1e1e1e] border ${loginError ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50 mb-6 transition-colors text-center tracking-[0.5em] text-lg`}
              placeholder="••••"
            />
            
            <button type="submit" className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs border border-white/5">
              Unlock
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-red-500/30">
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => { setActiveFilter({year: null, month: null}); setSearchQuery(''); }}
          >
            <Database className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold tracking-widest uppercase text-white">Archive<span className="text-red-600">.</span></span>
          </div>
        </div>
        
        <div className="flex-1 max-w-xl px-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search by date, venue, or city..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-10 pr-4 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => {
                 setSearchQuery(e.target.value);
                 if (e.target.value) setActiveFilter({year: null, month: null});
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            {nugsToken && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border border-[#0f0f0f]" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Explorer Sidebar */}
        <aside className="w-64 hidden lg:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)] border-r border-white/5 bg-[#0d0d0d]">
          <div className="p-4 border-b border-white/5">
             <button 
                onClick={() => { setActiveFilter({year: null, month: null}); setSearchQuery(''); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeFilter.year === null && !searchQuery ? 'bg-red-600/10 text-red-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
             >
                <Home className="w-4 h-4" /> Library Dashboard
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
            {years.map(year => {
              const isExpanded = expandedYears.includes(year);
              const isYearActive = activeFilter.year === year && activeFilter.month === null;
              const months = Object.keys(showsByYearMonth[year]).map(m => parseInt(m, 10)).sort((a,b) => a - b);
              
              return (
                <div key={year} className="mb-1">
                  <div 
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      isYearActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <button onClick={(e) => { e.stopPropagation(); toggleYear(year); }} className="p-0.5 hover:bg-white/10 rounded">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    </button>
                    <div 
                      className="flex items-center gap-2 flex-1"
                      onClick={() => {
                         setActiveFilter({year, month: null});
                         if (!expandedYears.includes(year)) toggleYear(year);
                      }}
                    >
                      {isExpanded ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-blue-400" />}
                      <span className="text-sm font-medium tracking-wide">{year}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="ml-6 pl-2 border-l border-white/10 mt-1 space-y-0.5">
                      {months.map(month => {
                        const isMonthActive = activeFilter.year === year && activeFilter.month === month;
                        const showCount = showsByYearMonth[year][month].length;
                        return (
                          <button
                            key={`${year}-${month}`}
                            onClick={() => setActiveFilter({year, month})}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
                              isMonthActive ? 'bg-red-600/20 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span>{getMonthName(month)}</span>
                            <span className="opacity-40 text-[10px]">{showCount}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-3.5rem)] pb-10">
          
          {/* Default Empty State */}
          {!searchQuery && activeFilter.year === null ? (
            <div className="h-full flex flex-col items-center justify-center p-6 mt-32">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <ListMusic className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Welcome to the Archive</h2>
              <p className="text-gray-500 max-w-sm text-center text-sm leading-relaxed">
                Select a year and month from the sidebar menu to begin exploring, or search for a specific show above.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {searchQuery ? 'Search Results' : activeFilter.month === null ? `${activeFilter.year} Tours` : `${getMonthName(activeFilter.month!)} ${activeFilter.year}`}
                  </h1>
                  <p className="text-sm text-gray-500">{filteredShows.length} items found</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredShows.map((show) => (
                  <motion.div 
                    layoutId={`show-${show.id}`}
                    key={show.id} 
                    className="group cursor-pointer bg-[#121212] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all shadow-lg hover:shadow-2xl hover:shadow-black"
                    onClick={() => setSelectedShow(show)}
                    whileHover={{ y: -4 }}
                  >
                    <div className="aspect-video bg-black relative border-b border-white/5">
                      <SmartThumbnail show={show} />
                      
                      {/* Visual Source Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {show.sourceType === 'drive' && (
                           <span className="bg-blue-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-widest shadow-sm">
                             HQ Soundboard
                           </span>
                        )}
                        {show.sourceType === 'recap' && (
                           <span className="bg-orange-500/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-black uppercase tracking-widest shadow-sm">
                             Official Recap
                           </span>
                        )}
                        {show.sourceType === 'youtube' && (
                           <span className="bg-red-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-widest shadow-sm">
                             YouTube
                           </span>
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
                          <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-bold text-sm text-gray-100 line-clamp-2 leading-tight mb-2 group-hover:text-red-400 transition-colors">
                        {show.artist}
                      </h3>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{show.venue}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold bg-white/5 px-2 py-1 rounded-md ml-2 flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                          <span>{show.date}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredShows.length === 0 && searchQuery && (
                <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-2xl bg-white/5">
                  <Database className="w-12 h-12 text-gray-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-300">No shows found</h3>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal (Nugs Integration) */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0f0f0f]">
                <div className="flex items-center gap-2 text-red-500 font-bold">
                  <Headphones className="w-5 h-5" />
                  <span>Nugs.net Integration</span>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="font-bold text-gray-300">Experimental:</span> You can unofficially stream high-quality audio directly from Nugs.net if you have an active subscription. Extract your <code className="bg-black px-1 py-0.5 rounded text-red-400 border border-white/10">Authorization: Bearer</code> token from your browser's Network tab and paste it below.
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Session Token (Bearer)</label>
                  <textarea 
                    value={nugsToken}
                    onChange={(e) => setNugsToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIs..."
                    className="w-full h-24 bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:outline-none focus:border-red-500/50 font-mono resize-none"
                  />
                </div>
                <button 
                  onClick={() => { saveNugsToken(nugsToken); setShowSettings(false); }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Show Detail Modal */}
      <AnimatePresence>
        {selectedShow && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="max-w-6xl mx-auto min-h-screen p-4 md:p-8 relative flex flex-col xl:flex-row gap-8">
              <button 
                onClick={() => setSelectedShow(null)} 
                className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group z-[60]"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
              </button>

              <div className="flex-1 space-y-6 mt-12 md:mt-4">
                {/* Header Information */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest uppercase border border-white/5 text-gray-300">
                      {selectedShow.date}
                    </span>
                    {selectedShow.sourceType === 'drive' && <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-bold tracking-widest uppercase border border-blue-500/30">HQ Soundboard</span>}
                    {selectedShow.sourceType === 'recap' && <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold tracking-widest uppercase border border-orange-500/30">Official Recap</span>}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                    {selectedShow.venue}
                  </h1>
                  <p className="text-lg text-gray-400 flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> {selectedShow.city}, {selectedShow.state || 'Unknown'}
                  </p>
                </div>

                {/* Media Player */}
                <div className="aspect-video bg-black w-full rounded-2xl overflow-hidden relative shadow-2xl border border-white/10">
                  {selectedShow.videoUrl ? (
                    <iframe 
                      src={getEmbedUrl(selectedShow.videoUrl)} 
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      title={selectedShow.venue}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d]">
                      <Video className="w-16 h-16 mb-4 text-gray-800" />
                      <p className="text-lg font-bold text-gray-600 uppercase tracking-widest text-center px-4">Video Link Unavailable</p>
                    </div>
                  )}
                </div>

                {/* Secret Nugs Audio Streamer */}
                {nugsToken && (
                  <div className="bg-gradient-to-r from-green-900/20 to-[#121212] border border-green-500/30 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-widest">
                        <Headphones className="w-5 h-5" /> Authorized Audio Stream
                      </div>
                      <span className="text-[10px] bg-green-500/20 px-2 py-1 rounded text-green-300 font-mono">NUGS.NET LINKED</span>
                    </div>
                    
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row items-center gap-4">
                      <button className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Play className="w-5 h-5 text-white fill-white ml-1" />
                      </button>
                      <div className="flex-1 w-full">
                        <div className="flex justify-between text-xs text-gray-400 font-mono mb-2">
                          <span>00:00</span>
                          <span>Live Set</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full w-0 bg-green-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-3 text-center uppercase tracking-wider">
                      *Awaiting Catalog ID mapping for {selectedShow.date} to initialize stream API.
                    </p>
                  </div>
                )}

                {/* Setlist */}
                {selectedShow.setlist && (
                  <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-lg">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                        <Music className="w-4 h-4" /> Setlist
                      </h3>
                      <div className="text-gray-300 text-[15px] leading-relaxed font-medium">
                        {selectedShow.setlist.split(' | ').map((song, idx) => (
                          <div key={idx} className="py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                            <span className="text-red-600/50 mr-3 text-xs font-mono">{String(idx + 1).padStart(2, '0')}</span>
                            {song}
                          </div>
                        ))}
                      </div>
                  </div>
                )}
              </div>

              {/* Up Next Sidebar within Modal */}
              <div className="w-full xl:w-[400px] xl:pt-12 pb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-300">Other items from {selectedShow.date}</h2>
                </div>
                <div className="space-y-3 pb-20">
                  {filteredShows
                    .filter(s => s.date === selectedShow.date && s.id !== selectedShow.id)
                    .map((show) => (
                    <div key={show.id} className="flex gap-2 group cursor-pointer bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-colors border border-white/5" onClick={() => setSelectedShow(show)}>
                      <div className="w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black relative border border-white/5">
                         <SmartThumbnail show={show} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                         {show.sourceType === 'recap' && (
                           <div className="absolute bottom-1 right-1 bg-orange-500/90 px-1 py-0.5 rounded text-[8px] font-bold text-black uppercase">Recap</div>
                         )}
                         {show.sourceType === 'drive' && (
                           <div className="absolute bottom-1 right-1 bg-blue-600/90 px-1 py-0.5 rounded text-[8px] font-bold text-white uppercase">Drive</div>
                         )}
                      </div>
                      <div className="overflow-hidden flex flex-col justify-center">
                        <h4 className="text-xs font-bold line-clamp-2 leading-tight mb-1 group-hover:text-red-400 transition-colors text-gray-200">
                          {show.venue}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-medium">{show.sourceType === 'drive' ? 'Full Soundboard' : 'Video Segment'}</p>
                      </div>
                    </div>
                  ))}
                  {filteredShows.filter(s => s.date === selectedShow.date && s.id !== selectedShow.id).length === 0 && (
                    <p className="text-xs text-gray-500 italic">No other recordings available for this date.</p>
                  )}
                </div>
              </div>

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
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors group ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
      <span className={`text-sm font-semibold tracking-wide ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
}
