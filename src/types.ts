export interface Show {
  id: string;
  artist: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  notes?: string;
  bandMembers?: string;
  setlist?: string;
  reviews?: string;
  year: number;
}

export interface YearGroup {
  year: number;
  shows: Show[];
}
