import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportingRoutingModule } from './reporting-routing.module';
import { ReportingComponent } from './reporting.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { ConfirmationService } from "primeng/api";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ChartingComponent } from '../charting/charting.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { DialogModule } from 'primeng/dialog';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SliderModule } from 'primeng/slider';
import { MakeJsonPipe } from 'src/app/pipes/make_json.pipe';
import { M22ResizableComponent } from 'src/app/modules/helper_component/resizable/resizable.component';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
  declarations: [
    ReportingComponent,
    ChartingComponent,
    M22ResizableComponent,
    MakeJsonPipe
  ],
  imports: [
    CommonModule,
    ReportingRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ChartModule,
    DragDropModule,
    MatCardModule,
    ConfirmDialogModule,
    HighchartsChartModule,
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    DialogModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ConfirmPopupModule,
    ButtonModule,
    OverlayPanelModule,
    ScrollPanelModule,
    SliderModule,
  ],
  providers: [ConfirmationService]
})
export class ReportingModule { }
