/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Play, Search, Calendar, MapPin, Video, X, Music, 
  MonitorPlay, Home, Folder, FolderOpen, ChevronRight, ChevronDown, 
  Settings, Headphones, Database, ListMusic, Volume2, SkipBack, SkipForward, Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SHOWS } from './data/shows';
import { Show } from './types';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const getDisplayThumbnail = (show: Show | null | undefined) => {
  if (!show || !show.videoUrl) return ''; 
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
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return 'Unknown';
  const date = new Date();
  date.setMonth(monthNum - 1);
  return date.toLocaleString('en-US', { month: 'long' });
};

// ==========================================
// COMPONENTS
// ==========================================

function SmartThumbnail({ show, className }: { show: Show, className?: string }) {
  const initialSrc = getDisplayThumbnail(show);
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  // Update image source if show changes
  useEffect(() => {
    setImgSrc(getDisplayThumbnail(show));
    setHasError(false);
  }, [show]);

  if (!show || !show.videoUrl) {
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
         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center px-2 leading-tight">Media Available<br/>(Cover Missing)</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={show.venue || 'Show'}
      className={className || "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"}
      onError={() => setHasError(true)}
    />
  );
}

// ==========================================
// MAIN APP
// ==========================================

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [expandedYears, setExpandedYears] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<{year: number | null, month: number | null}>({ year: null, month: null });
  
  const [showSettings, setShowSettings] = useState(false);
  const [nugsToken, setNugsToken] = useState('');
  
  // Custom Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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

  // Grouping Data: Safely handle missing/malformed dates
  const showsByYearMonth = useMemo(() => {
    const grouped: Record<number, Record<number, Show[]>> = {};
    if (!SHOWS || !Array.isArray(SHOWS)) return grouped;

    SHOWS.forEach(show => {
      if (!show || !show.date) return;
      const parts = show.date.split('-');
      if (parts.length < 2) return;
      
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      
      if (isNaN(year) || isNaN(month)) return;

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
    if (!SHOWS || !Array.isArray(SHOWS)) return [];
    if (!searchQuery && activeFilter.year === null) return [];

    return SHOWS.filter(show => {
      if (!show) return false;

      if (searchQuery) {
        const venueMatch = show.venue ? show.venue.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const cityMatch = show.city ? show.city.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const dateMatch = show.date ? show.date.includes(searchQuery) : false;
        return venueMatch || cityMatch || dateMatch;
      }
      
      if (activeFilter.year !== null && show.date) {
        const showYear = parseInt(show.date.split('-')[0], 10);
        if (showYear !== activeFilter.year) return false;
        
        if (activeFilter.month !== null) {
          const showMonth = parseInt(show.date.split('-')[1], 10);
          if (showMonth !== activeFilter.month) return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (!a.date || !b.date) return 0;
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;

      const typeOrder = { 'drive': 1, 'recap': 2, 'youtube': 3 };
      const orderA = typeOrder[a.sourceType || 'youtube'] || 3;
      const orderB = typeOrder[b.sourceType || 'youtube'] || 3;
      return orderA - orderB;
    });
  }, [searchQuery, activeFilter]);

  const years = Object.keys(showsByYearMonth).map(y => parseInt(y, 10)).sort((a, b) => b - a);

  // LOGIN SCREEN
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
              className={`w-full bg-[#1e1e1e] border ${loginError ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50 mb-6 transition-colors text-center tracking-[0.2em] text-lg`}
              placeholder="••••••••••"
            />
            
            <button type="submit" className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-xs border border-white/5">
              Unlock
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // MAIN ARCHIVE UI
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-red-500/30">
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => { setActiveFilter({year: null, month: null}); setSearchQuery(''); }}
          >
            <Database className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold tracking-widest uppercase text-white hidden sm:block">Strings<span className="text-red-600">Archive</span></span>
          </div>
        </div>
        
        <div className="flex-1 max-w-xl px-4 md:px-8">
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
                      {isExpanded ? <FolderOpen className="w-4 h-4 text-red-500" /> : <Folder className="w-4 h-4 text-red-500" />}
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
          
          {/* Mobile Filter Bar */}
          <div className="lg:hidden p-4 border-b border-white/5 overflow-x-auto no-scrollbar whitespace-nowrap bg-[#0f0f0f]">
             <div className="flex gap-2">
                 <button 
                    onClick={() => { setActiveFilter({year: null, month: null}); setSearchQuery(''); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${activeFilter.year === null && !searchQuery ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400'}`}
                 >All</button>
                 {years.map(year => (
                    <button 
                        key={year}
                        onClick={() => setActiveFilter({year, month: null})}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${activeFilter.year === year ? 'bg-white text-black' : 'bg-white/10 text-gray-400'}`}
                    >{year}</button>
                 ))}
             </div>
          </div>

          {!searchQuery && activeFilter.year === null ? (
            <div className="h-full flex flex-col items-center justify-center p-6 mt-20 md:mt-32">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <ListMusic className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-wide text-center">Welcome to the Archive</h2>
              <p className="text-gray-500 max-w-sm text-center text-sm leading-relaxed">
                Select a year to begin exploring the vault, or search for a specific show above.
              </p>
            </div>
          ) : (
            <div className="p-4 md:p-6">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    {searchQuery ? 'Search Results' : activeFilter.month === null ? `${activeFilter.year} Tours` : `${getMonthName(activeFilter.month!)} ${activeFilter.year}`}
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500">{filteredShows.length} items found</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {filteredShows.map((show) => (
                  <motion.div 
                    layoutId={`show-${show.id}`}
                    key={show.id} 
                    className="group cursor-pointer bg-[#121212] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all shadow-lg hover:shadow-2xl hover:shadow-black flex flex-col"
                    onClick={() => setSelectedShow(show)}
                    whileHover={{ y: -4 }}
                  >
                    <div className="aspect-video bg-black relative border-b border-white/5">
                      <SmartThumbnail show={show} />
                      
                      {/* Visual Source Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {show.sourceType === 'drive' && (
                           <span className="bg-blue-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-widest shadow-sm border border-blue-400/30">
                             Drive HQ
                           </span>
                        )}
                        {show.sourceType === 'recap' && (
                           <span className="bg-orange-500/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-black uppercase tracking-widest shadow-sm border border-orange-400/50">
                             Official Recap
                           </span>
                        )}
                        {show.sourceType === 'youtube' && (
                           <span className="bg-red-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-widest shadow-sm border border-red-400/30">
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
                    
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-sm text-gray-100 line-clamp-2 leading-tight mb-3 group-hover:text-red-400 transition-colors">
                        {show.venue || 'Unknown Venue'}
                      </h3>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{show.city || 'Unknown City'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold bg-white/5 px-2 py-1 rounded-md ml-2 flex-shrink-0 border border-white/5">
                          <Calendar className="w-3 h-3" />
                          <span>{show.date || 'Unknown'}</span>
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
              className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#121212]">
                <div className="flex items-center gap-2 text-green-500 font-bold">
                  <Headphones className="w-5 h-5" />
                  <span>Nugs.net Integration</span>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="font-bold text-gray-300">Experimental:</span> You can stream high-quality audio directly from Nugs.net if you have an active subscription. Extract your <code className="bg-black px-1 py-0.5 rounded text-green-400 border border-white/10">Authorization: Bearer</code> token from your browser's Network tab and paste it below.
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Session Token (Bearer)</label>
                  <textarea 
                    value={nugsToken}
                    onChange={(e) => setNugsToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIs..."
                    className="w-full h-24 bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-xs text-green-500/80 focus:outline-none focus:border-green-500/50 font-mono resize-none"
                  />
                </div>
                <button 
                  onClick={() => { saveNugsToken(nugsToken); setShowSettings(false); }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm uppercase tracking-widest"
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
            <div className="max-w-7xl mx-auto min-h-screen p-4 md:p-8 relative flex flex-col lg:flex-row gap-8">
              <button 
                onClick={() => { setSelectedShow(null); setIsPlayingAudio(false); }} 
                className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-500 rounded-full transition-all group z-[60]"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </button>

              <div className="flex-1 space-y-6 mt-12 md:mt-0">
                {/* Header Information */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-[#121212] rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 text-gray-300">
                      {selectedShow.date}
                    </span>
                    {selectedShow.sourceType === 'drive' && <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-500/30">HQ Soundboard</span>}
                    {selectedShow.sourceType === 'recap' && <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-bold tracking-widest uppercase border border-orange-500/30">Official Recap</span>}
                    {selectedShow.sourceType === 'youtube' && <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-[10px] font-bold tracking-widest uppercase border border-red-500/30">YouTube</span>}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight tracking-tight">
                    {selectedShow.venue || 'Unknown Venue'}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-400 flex items-center gap-2 font-medium">
                    <MapPin className="w-5 h-5" /> {selectedShow.city || 'Unknown'}, {selectedShow.state}
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

                {/* Modern Nugs-Style Audio Streamer */}
                {nugsToken && selectedShow.setlist && (
                  <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                           <Headphones className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                           <h3 className="text-white font-bold tracking-wide">Live Audio Stream</h3>
                           <p className="text-xs text-green-500 font-mono">AUTHORIZED: NUGS.NET</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* The Player UI */}
                    <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                      <div className="flex items-center gap-6 mb-4">
                        <SmartThumbnail show={selectedShow} className="w-16 h-16 rounded-lg object-cover shadow-lg border border-white/10" />
                        <div className="flex-1 overflow-hidden">
                           <h4 className="text-white font-bold truncate">Live at {selectedShow.venue}</h4>
                           <p className="text-sm text-gray-400 truncate">{selectedShow.artist} • {selectedShow.date}</p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between gap-4 mb-4">
                         <div className="flex items-center gap-3">
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                               <SkipBack className="w-5 h-5 fill-current" />
                            </button>
                            <button 
                               onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                               className="w-12 h-12 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center transition-transform hover:scale-105"
                            >
                               {isPlayingAudio ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                               <SkipForward className="w-5 h-5 fill-current" />
                            </button>
                         </div>
                         <div className="flex items-center gap-2 text-gray-400">
                            <Volume2 className="w-4 h-4" />
                            <div className="w-20 h-1 bg-white/20 rounded-full"><div className="w-2/3 h-full bg-white rounded-full"></div></div>
                         </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                         <span>00:00</span>
                         <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group">
                            <div className="absolute inset-y-0 left-0 bg-green-500 w-0 group-hover:bg-green-400 transition-colors" />
                         </div>
                         <span>--:--</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Setlist */}
                {selectedShow.setlist && (
                  <div className="bg-[#121212] rounded-2xl p-6 md:p-8 border border-white/5 shadow-lg">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                        <Music className="w-4 h-4" /> Official Setlist
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {selectedShow.setlist.split(' | ').map((song, idx) => (
                          <div key={idx} className="py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-3 rounded-lg transition-colors flex items-center group cursor-pointer">
                            <span className="text-red-600/50 mr-4 text-xs font-mono w-4 group-hover:text-red-500 transition-colors">{String(idx + 1).padStart(2, '0')}</span>
                            <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">{song}</span>
                            {nugsToken && <Play className="w-3 h-3 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </div>
                        ))}
                      </div>
                  </div>
                )}
              </div>

              {/* Up Next Sidebar within Modal */}
              <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 mt-8 lg:mt-0">
                <div className="sticky top-8">
                  <h2 className="font-bold text-lg text-white mb-4 flex items-center justify-between">
                    <span>Other recordings</span>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">{selectedShow.date}</span>
                  </h2>
                  <div className="space-y-3 pb-20 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pr-2">
                    {filteredShows
                      .filter(s => s.date === selectedShow.date && s.id !== selectedShow.id)
                      .map((show) => (
                      <div key={show.id} className="flex gap-3 group cursor-pointer bg-[#121212] p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors border border-white/5" onClick={() => setSelectedShow(show)}>
                        <div className="w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black relative border border-white/10 shadow-md">
                           <SmartThumbnail show={show} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           {show.sourceType === 'recap' && (
                             <div className="absolute bottom-1 right-1 bg-orange-500/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-black uppercase tracking-wider">Recap</div>
                           )}
                           {show.sourceType === 'drive' && (
                             <div className="absolute bottom-1 right-1 bg-blue-600/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">Drive</div>
                           )}
                           {show.sourceType === 'youtube' && (
                             <div className="absolute bottom-1 right-1 bg-red-600/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">YT</div>
                           )}
                        </div>
                        <div className="overflow-hidden flex flex-col justify-center">
                          <h4 className="text-sm font-bold line-clamp-2 leading-tight mb-1 group-hover:text-red-400 transition-colors text-gray-200">
                            {show.venue || 'Unknown Venue'}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                            {show.sourceType === 'drive' ? 'Full Soundboard' : show.sourceType === 'recap' ? 'Official Edit' : 'Fan Upload'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {filteredShows.filter(s => s.date === selectedShow.date && s.id !== selectedShow.id).length === 0 && (
                      <div className="bg-[#121212] border border-white/5 rounded-xl p-6 text-center">
                         <p className="text-sm text-gray-500 italic">This is the only recording currently available for this date.</p>
                      </div>
                    )}
                  </div>
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
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors group ${active ? 'bg-red-600/10 text-red-500' : 'text-gray-400 hover:bg-white/5'}`}>
      <Icon className={`w-4 h-4 ${active ? 'text-red-500' : 'text-gray-500 group-hover:text-white'}`} />
      <span className={`text-sm font-semibold tracking-wide ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
}
