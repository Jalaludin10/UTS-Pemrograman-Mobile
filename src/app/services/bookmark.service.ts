import { Injectable } from '@angular/core';

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  surahNameLatin: string;
  lastAyatRead: number;
  totalAyat: number;
  isCompleted: boolean;
  lastReadDate: Date;
  lastReadTimestamp?: number; // Added for better serialization
}

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private readonly STORAGE_KEY = 'quran-bookmarks';

  constructor() {}

  // Mendapatkan semua bookmark
  getBookmarks(): Bookmark[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const bookmarks = JSON.parse(stored);
      return bookmarks.map((b: any) => ({
        ...b,
        lastReadDate: b.lastReadTimestamp ? new Date(b.lastReadTimestamp) : new Date(b.lastReadDate)
      }));
    }
    return [];
  }

  // Mendapatkan bookmark untuk surah tertentu
  getBookmark(surahNumber: number): Bookmark | null {
    const bookmarks = this.getBookmarks();
    return bookmarks.find(b => b.surahNumber === surahNumber) || null;
  }

  // Menyimpan atau update bookmark
  saveBookmark(bookmark: Bookmark): void {
    const bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.surahNumber === bookmark.surahNumber);

    // Add timestamp untuk serialization yang lebih baik
    const bookmarkToSave = {
      ...bookmark,
      lastReadTimestamp: bookmark.lastReadDate.getTime ? bookmark.lastReadDate.getTime() : Date.now()
    };

    if (existingIndex >= 0) {
      bookmarks[existingIndex] = { ...bookmarkToSave, lastReadDate: bookmark.lastReadDate };
    } else {
      bookmarks.push({ ...bookmarkToSave, lastReadDate: bookmark.lastReadDate });
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
  }

  // Menandai surah sebagai selesai dibaca
  markSurahCompleted(surahNumber: number, surahName: string, surahNameLatin: string, totalAyat: number): void {
    const bookmark: Bookmark = {
      surahNumber,
      surahName,
      surahNameLatin,
      lastAyatRead: totalAyat,
      totalAyat,
      isCompleted: true,
      lastReadDate: new Date()
    };
    this.saveBookmark(bookmark);
  }

  // Update posisi terakhir dibaca
  updateLastReadPosition(surahNumber: number, surahName: string, surahNameLatin: string, lastAyatRead: number, totalAyat: number): void {
    const existingBookmark = this.getBookmark(surahNumber);
    const bookmark: Bookmark = {
      surahNumber,
      surahName,
      surahNameLatin,
      lastAyatRead,
      totalAyat,
      isCompleted: existingBookmark ? existingBookmark.isCompleted : (lastAyatRead === totalAyat),
      lastReadDate: new Date()
    };
    this.saveBookmark(bookmark);
  }

  // Mendapatkan surah yang sedang dibaca (last read)
  getLastReadSurah(): Bookmark | null {
    const bookmarks = this.getBookmarks();
    if (bookmarks.length === 0) return null;

    // Urutkan berdasarkan tanggal terakhir dibaca (menggunakan timestamp untuk akurasi)
    bookmarks.sort((a, b) => {
      const timeA = a.lastReadDate instanceof Date ? a.lastReadDate.getTime() : new Date(a.lastReadDate).getTime();
      const timeB = b.lastReadDate instanceof Date ? b.lastReadDate.getTime() : new Date(b.lastReadDate).getTime();
      return timeB - timeA;
    });
    return bookmarks[0];
  }

  // Mendapatkan daftar surah yang sudah selesai dibaca
  getCompletedSurahs(): Bookmark[] {
    return this.getBookmarks().filter(b => b.isCompleted);
  }

  // Menghapus bookmark
  removeBookmark(surahNumber: number): void {
    const bookmarks = this.getBookmarks().filter(b => b.surahNumber !== surahNumber);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
  }
}