import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { BookmarkService } from '../services/bookmark.service';

interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
}

interface SurahDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  ayat: Ayat[];
}

@Component({
  selector: 'app-ayat-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  templateUrl: './ayat.detail.page.html',
  styleUrls: ['./ayat.detail.page.scss'],
})
export class AyatDetailPage implements OnInit, AfterViewInit, OnDestroy {
  surah: SurahDetail | null = null;
  filteredAyat: Ayat[] = [];
  searchQuery = '';
  isLoading = true;
  errorMessage = '';
  currentBookmark: any = null;

  @ViewChildren('ayatItem') ayatItems!: QueryList<ElementRef>;

  private observer: IntersectionObserver | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private bookmarkService: BookmarkService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSurahDetail(id);
      this.loadBookmark(parseInt(id));
    } else {
      this.errorMessage = 'ID surah tidak ditemukan.';
      this.isLoading = false;
    }

    // Check for ayat query parameter (from continue reading)
    const ayatParam = this.route.snapshot.queryParamMap.get('ayat');
    if (ayatParam) {
      const targetAyat = parseInt(ayatParam);
      setTimeout(() => {
        const element = document.getElementById(`ayat-${targetAyat}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
    this.scrollToLastReadAyat();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  loadSurahDetail(id: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>(`https://equran.id/api/v2/surat/${id}`).subscribe({
      next: (response) => {
        const data = response?.data;
        if (!data) {
          this.errorMessage = 'Data surah tidak tersedia.';
          this.isLoading = false;
          return;
        }

        this.surah = {
          nomor: data.nomor,
          nama: data.nama,
          namaLatin: data.namaLatin,
          jumlahAyat: data.jumlahAyat,
          tempatTurun: data.tempatTurun,
          arti: data.arti,
          deskripsi: data.deskripsi,
          ayat: (data.ayat ?? []).map((item: any) => ({
            nomorAyat: item.nomorAyat,
            teksArab: item.teksArab,
            teksLatin: item.teksLatin,
            teksIndonesia: item.teksIndonesia,
          })),
        };

        this.filteredAyat = this.surah.ayat;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Gagal memuat ayat. Coba lagi nanti.';
        this.isLoading = false;
      }
    });
  }

  filterAyat() {
    const query = this.searchQuery.trim().toLowerCase();
    if (!this.surah) {
      this.filteredAyat = [];
      return;
    }

    if (!query) {
      this.filteredAyat = this.surah.ayat;
      return;
    }

    this.filteredAyat = this.surah.ayat.filter((ayat) =>
      ayat.nomorAyat.toString().includes(query) ||
      ayat.teksArab.toLowerCase().includes(query) ||
      ayat.teksLatin.toLowerCase().includes(query) ||
      ayat.teksIndonesia.toLowerCase().includes(query)
    );
  }

  arabicNumber(value: number): string {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return value
      .toString()
      .split('')
      .map((digit) => arabicDigits[parseInt(digit, 10)] || digit)
      .join('');
  }

  loadBookmark(surahNumber: number) {
    this.currentBookmark = this.bookmarkService.getBookmark(surahNumber);
  }

  setupIntersectionObserver() {
    // Optional: bisa digunakan untuk auto-tracking jika diperlukan nanti
  }

  scrollToLastReadAyat() {
    // Check if ayat parameter exists from continue reading - if so, that takes priority
    const ayatParam = this.route.snapshot.queryParamMap.get('ayat');
    if (ayatParam) {
      return; // Already handled in ngOnInit
    }

    if (this.currentBookmark && this.currentBookmark.lastAyatRead > 0) {
      setTimeout(() => {
        const element = document.getElementById(`ayat-${this.currentBookmark.lastAyatRead}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }

  isCurrentAyat(ayatNumber: number): boolean {
    return this.currentBookmark ? this.currentBookmark.lastAyatRead === ayatNumber : false;
  }

  markAsLastRead(ayatNumber: number) {
    if (this.surah) {
      this.bookmarkService.updateLastReadPosition(
        this.surah.nomor,
        this.surah.nama,
        this.surah.namaLatin,
        ayatNumber,
        this.surah.jumlahAyat
      );
      this.currentBookmark = this.bookmarkService.getBookmark(this.surah.nomor);
    }
  }
}
