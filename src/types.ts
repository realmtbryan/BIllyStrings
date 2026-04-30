export interface Show {
  id: string;
  artist: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  year: number;
  videoUrl: string;
  setlist: string;
  thumbnailUrl: string;
  sourceType?: 'drive' | 'recap' | 'youtube';
}
