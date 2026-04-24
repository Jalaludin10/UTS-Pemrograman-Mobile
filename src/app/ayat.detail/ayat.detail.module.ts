import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AyatDetailPageRoutingModule } from './ayat.detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AyatDetailPageRoutingModule,
  ],
  declarations: []
})
export class AyatDetailPageModule {}
