import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BookmarkService, Bookmark } from '../services/bookmark.service';

interface Surah {
  number: number;
  name: string;
  transliteration: string;
  type: string;
  ayahCount: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  query = '';
  surahList: Surah[] = [];
  filteredSurah: Surah[] = [];
  isLoading = true;
  errorMessage = '';
  bookmarks: { [key: number]: Bookmark } = {};
  lastReadSurah: Bookmark | null = null;

  constructor(private http: HttpClient, private router: Router, private bookmarkService: BookmarkService) {}

  ngOnInit() {
    this.loadSurahList();
  }

  loadBookmarks() {
    const allBookmarks = this.bookmarkService.getBookmarks();
    this.bookmarks = {};
    allBookmarks.forEach(bookmark => {
      this.bookmarks[bookmark.surahNumber] = bookmark;
    });
    this.lastReadSurah = this.bookmarkService.getLastReadSurah();
  }

  loadSurahList() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>('https://equran.id/api/v2/surat').subscribe({
      next: (response) => {
        const data = response?.data ?? [];
        this.surahList = data.map((item: any) => {
          const name = item.nama || '';
          const transliteration = item.namaLatin || '';
          const type = item.tempatTurun === 'Mekah' ? 'Makkiyah' : item.tempatTurun === 'Madinah' ? 'Madaniyah' : item.tempatTurun || '';
          const ayahCount = item.jumlahAyat ?? 0;

          return {
            number: item.nomor,
            name,
            transliteration,
            type,
            ayahCount,
          } as Surah;
        });

        this.filteredSurah = this.surahList;
        this.isLoading = false;
        this.loadBookmarks();
      },
      error: () => {
        this.errorMessage = 'Gagal memuat data dari API. Pastikan koneksi internet aktif.';
        this.isLoading = false;
        this.filteredSurah = this.surahList;
        this.loadBookmarks();
      },
    });
  }

  filterSurah() {
    const query = this.query.trim().toLowerCase();
    if (!query) {
      this.filteredSurah = this.surahList;
      return;
    }

    this.filteredSurah = this.surahList.filter((surah) =>
      surah.name.toLowerCase().includes(query) ||
      surah.transliteration.toLowerCase().includes(query) ||
      surah.type.toLowerCase().includes(query)
    );
  }

  openSurah(surah: Surah) {
    this.router.navigate(['/surah', surah.number]);
  }

  getSurahBookmark(surahNumber: number): Bookmark | null {
    return this.bookmarks[surahNumber] || null;
  }

  continueReading() {
    if (this.lastReadSurah) {
      this.router.navigate(['/surah', this.lastReadSurah.surahNumber], {
        queryParams: { ayat: this.lastReadSurah.lastAyatRead }
      });
    }
  }

  isSurahCompleted(surahNumber: number): boolean {
    const bookmark = this.getSurahBookmark(surahNumber);
    return bookmark ? bookmark.isCompleted : false;
  }

  getReadingProgress(surahNumber: number): number {
    const bookmark = this.getSurahBookmark(surahNumber);
    if (!bookmark) return 0;
    return Math.round((bookmark.lastAyatRead / bookmark.totalAyat) * 100);
  }

  ionViewWillEnter() {
    // Refresh bookmarks ketika user kembali ke home
    this.loadBookmarks();
  }
}
