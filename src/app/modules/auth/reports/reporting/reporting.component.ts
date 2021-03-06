import { ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalysisService } from 'src/app/services/auth/analysis.service';
import { BridgeManagerService } from 'src/app/services/auth/bridge-manager.service';
import { ReportsService } from 'src/app/services/auth/reports.service';
import { ConfirmationService } from 'primeng/api';
import { ChartdataService } from 'src/app/services/auth/chartdata.service';
import { MsalAuthenticationService } from 'src/app/services/msal-authentication.service';
import { ToastrService } from 'ngx-toastr';
import { SideBarService } from 'src/app/services/side-bar.service';
import html2canvas from 'html2canvas';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { ResizedEvent } from 'angular-resize-event';
import * as moment from 'moment';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

interface ClipboardItem {
  readonly types: string[];
  readonly presentationStyle: "unspecified" | "inline" | "attachment";
  getType(): Promise<Blob>;
}

interface ClipboardItemData {
  [mimeType: string]: Blob | string | Promise<Blob | string>;
}

declare var ClipboardItem: {
  prototype: ClipboardItem;
  new(itemData: ClipboardItemData): ClipboardItem;
};

interface Clipboard {
  read(): Promise<DataTransfer>;
  write(data: ClipboardItem[]): Promise<void>;
}

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  //#region Variables
  @ViewChild('staticTabs', { static: false }) staticTabs?: TabsetComponent;
  chartDataToDownload: any[] = [];

  userName!: string;
  todayDate = new Date().toISOString();
  card_Z_index_clicked: boolean = false


  default_select = null
  selectedConnectionStringId!: string;
  selectedTable!: string;

  getTableMeatadataForm!: FormGroup;
  getTableMeatadata_loading = false;
  Tablemetadata: any[] = []

  connectionStrings: any[] = [];
  connectionString_loading: boolean = false;

  allTables_loading: boolean = false;
  databaseName: string = 'Database Name...';
  tables: any[] = [];
  externalTables: any[] = [];
  viewTables: any[] = [];

  runCustomQueryform!: FormGroup;
  runcustomQueryForm_loading: boolean = false;
  saveCustomQuery_loading: boolean = false;

  iFieldFunction: any[] = []
  iFieldSortBy: any[] = []
  iFieldFilterBy: any[] = []

  cols: any[] = [];
  resultData: any[] = [];
  keys: any[] = []
  filterFields!: string
  isError: boolean = false;
  error_message!: string;
  xAxisItems: any[] = []
  yAxisItems: any[] = []
  items: number[] = new Array(4).fill(0);


  selectedWorkspace: string = '';
  selectedWorkspacedata: any;

  isSave: boolean = false;
  isSaveAs: boolean = false;

  chartData1: any = {
    labels: [],
    datasets: []
  }
  chartData2: any = {
    labels: [],
    datasets: []
  }
  chartData3: any = {
    labels: [],
    datasets: []
  }
  chartData4: any = {
    labels: [],
    datasets: []
  }

  isLineChart1: boolean = false;
  isBarChart1: boolean = false;
  ispieChart1: boolean = false;
  isDoughnutChart1: boolean = false;

  isLineChart2: boolean = false;
  isBarChart2: boolean = false;
  isPieChart2: boolean = false;
  isDoughnutChart2: boolean = false;

  isLineChart3: boolean = false;
  isBarChart3: boolean = false;
  ispieChart3: boolean = false;
  isDoughnutChart3: boolean = false;

  isLineChart4: boolean = false;
  isBarChart4: boolean = false;
  ispieChart4: boolean = false;
  isDoughnutChart4: boolean = false;

  chartNumber: number = 0

  display: boolean = false;
  displaySaveQuery: boolean = false;
  displayAllQueries: boolean = false;

  allWorkSpaces: any[] = [];

  datasetKeys: any[] = []

  barData: any;
  barOptions: any;
  lineData: any
  lineOptions: any;
  pieData: any
  pieOptions: any
  doughnutData: any
  doughnutOptions: any
  radarData: any
  radarOptions: any
  polarAreaData: any
  polarAreaOptions: any

  chartTypeSelected: boolean = false;

  minimizedChartLists: any[] = []
  minimizedResultset: any[] = []
  chartWidth!: number;
  chartHeight!: number;

  queries!: any[];
  selectedQuery!: any;

  executeQueryForm!: FormGroup;
  executeQueryForm_loading = false;

  isAttributeIsDate: boolean = false
  //#endregion

  constructor(
    private formBuilder: FormBuilder,
    private bridgeManagerService: BridgeManagerService,
    private analysisService: AnalysisService,
    private reportsService: ReportsService,
    private resolver: ComponentFactoryResolver,
    private confirmationService: ConfirmationService,
    private chartdataService: ChartdataService,
    private msalAuthenticationService: MsalAuthenticationService,
    private toastr: ToastrService,
    private sideBarService: SideBarService,
    private cdr: ChangeDetectorRef
  ) {
    this.buildCreateTableProfileForm();
    this.buildRunCustomQueryform();
    this.chartData1;
    this.chartData2;
    this.chartData3;
    this.chartData4;
  }

  ngOnInit(): void {
    this.userName = this.msalAuthenticationService.userName();
    this.GetSqlConnectionStrings()
    this.GetAllCustomQuery()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sideBarService.toggleSideNav()
    })
  }

  //#region Build Forms
  buildExecuteQueryForm() {
    this.executeQueryForm = this.formBuilder.group({
      QueryId: [null],
      DatabaseName: [null],
      ConnectionStringId: [null],
      QuerySQL: [null],
      AddedBy: null,
      AddedDate: null
    });
  }

  buildCreateTableProfileForm() {
    this.getTableMeatadataForm = this.formBuilder.group({
      ConnectionStringId: ['', Validators.required],
      ExternalTableName: ['', Validators.required]
    });
  }

  buildRunCustomQueryform() {
    this.runCustomQueryform = this.formBuilder.group({
      ConnectionStringId: ['', Validators.required],
      CustomQueryId: null,
      TableName: ['', Validators.required],
      CustomQueryName: [{ value: '', disabled: true }],
      Functions: this.formBuilder.array([], Validators.required),
      GroupBy: this.formBuilder.array([], Validators.required),
      SortBy: this.formBuilder.array([]),
      FilterBy: this.formBuilder.array([]),
      ChartInfo: this.formBuilder.array([]),

      AddedBy: this.userName,
      AddedDate: this.todayDate,
      UpdatedBy: this.userName,
      UpdatedDate: this.todayDate
    });
  }
  //#endregion

  //#region Get Connection Strings
  GetSqlConnectionStrings() {
    this.connectionString_loading = true;
    this.bridgeManagerService.GetSqlConnectionStrings().subscribe(
      (res) => {
        this.connectionStrings = res;
        this.connectionString_loading = false;
      },
      (err) => {
        this.connectionString_loading = false;
      }
    )
  }
  //#endregion

  //#region Get Methods
  // This method gets all the custom queries generated from new Query panel from dashboard
  GetAllCustomQuery() {
    this.reportsService.GetAllCustomQuery().subscribe(
      (res) => {
        this.allWorkSpaces = res;
      },
      (err) => { }
    )
  }
  // Gets Queries written on SQL Server tab>New Query> SQL editor

  GetQueriesByConnectionStringId(ConnectionStringId: string) {
    this.analysisService.GetQueriesByConnectionStringId(ConnectionStringId).subscribe(
      res => {
        this.queries = res;
      },
      err => { }
    );
  }

  GetAllTables(connectionStringId: string) {
    this.analysisService.GetAllTables(connectionStringId).subscribe(
      (res: any) => {

        this.tables = res[0];
        this.databaseName = res[0].databaseName;
        this.tables = res[0].tables
        this.externalTables = res[0].externalTables
        this.viewTables = res[0].viewTables
        this.allTables_loading = false;
      },
      err => { this.allTables_loading = false; }
    );
  }
  //#endregion


  //#region OnSubmit
  onSubmitExecuteQueryForm() {
    this.runcustomQueryForm_loading = true;
    this.xAxisItems = []
    this.yAxisItems = []
    this.resultData = []
    this.cols = [];
    this.keys = [];
    this.filterFields = '';
    this.isError = false;
    this.analysisService.ExecuteQuery(this.executeQueryForm.value).subscribe(
      (res: any) => {
        this.runcustomQueryForm_loading = false;
        if (typeof (res) == 'object') {
          this.getDatasetKeys(res[0]);
          this.chartdataService.updateData(res);
          this.resultData = res;

          if (this.selectedWorkspacedata != null) {
            this.renderSavedCharts();
          }
          this.keys = Object.keys(res[0]);
          this.keys.forEach((key, i) => {
            this.cols.push({ field: key, header: key.trim() });
          });
          var tmp: string[] = [];
          this.keys.forEach((item) => {
            tmp.push("'" + item + "'");
          });
          this.filterFields = tmp.join(",");
        }
        else if (typeof (res) == 'number') {
        }

      },
      err => {
        this.runcustomQueryForm_loading = false;

      }
    )
  }
  onSubmitRunCustomQuery() {
    if (this.runCustomQueryform.get('TableName')!.value == '' || this.runCustomQueryform.get('TableName')?.value == null) {
      this.onSubmitExecuteQueryForm()
    }
    else {
      this.runcustomQueryForm_loading = true;
      this.xAxisItems = []
      this.yAxisItems = []
      this.resultData = []
      this.cols = [];
      this.keys = [];
      this.filterFields = '';
      this.isError = false;
      if (this.runCustomQueryform.invalid) {
        return;
      }
      this.reportsService.ExecuteCustomeQuery(this.runCustomQueryform.value).subscribe(
        (res: any) => {
          this.runcustomQueryForm_loading = false;
          this.getDatasetKeys(res[0]);
          this.chartdataService.updateData(res);
          this.resultData = res;
          if (this.selectedWorkspacedata != null) {
            this.renderSavedCharts();
          }
          this.keys = Object.keys(res[0]);
          this.keys.forEach((key, i) => {
            this.cols.push({ field: key, header: key.trim() });
          });
          var tmp: string[] = [];
          this.keys.forEach((item) => {
            tmp.push("'" + item + "'");
          });
          this.filterFields = tmp.join(",");
          this.runCustomQueryform.get("GroupBy")?.value.forEach((item: any) => {
            this.xAxisItems.push(item.ColumnName);
          });
          this.runCustomQueryform.get("Functions")?.value.forEach((item: any) => {
            var _columnName = item.ColumnName
            var _functionName = item.Function.split(')')[0].split('(')[0]
            var _func = _functionName + "_" + _columnName
            this.yAxisItems.push(_func);
          });

        },
        (err: any) => {
          this.error_message = err.error;
          this.isError = true;
          this.runcustomQueryForm_loading = false
        }
      );
    }

  }
  //#endregion

  //#region OnSelect
  onSelectNewTab() {
    //#region 
    this.allTables_loading = true;
    this.selectedWorkspacedata = null;
    this.selectedWorkspace = '';
    (this.runCustomQueryform.get('Functions') as FormArray).clear();
    (this.runCustomQueryform.get('GroupBy') as FormArray).clear();
    (this.runCustomQueryform.get('SortBy') as FormArray).clear();
    (this.runCustomQueryform.get('FilterBy') as FormArray).clear();
    (this.runCustomQueryform.get('ChartInfo') as FormArray).clear();
    this.buildRunCustomQueryform();
    this.databaseName = 'Database Name...';
    this.tables = [];
    this.externalTables = [];
    this.viewTables = [];
    this.xAxisItems = [];
    this.yAxisItems = [];
    this.iFieldFunction = [];
    this.iFieldSortBy = [];
    this.iFieldFilterBy = [];
    this.Tablemetadata = [];
    this.resultData = [];
    this.minimizedChartLists = [];
    this.minimizedResultset = []
    //#endregion
    this.runCustomQueryform.get('TableName')?.setValidators(Validators.required); this.runCustomQueryform.get('TableName')?.updateValueAndValidity();
    this.runCustomQueryform.get('Functions')?.setValidators(Validators.required); this.runCustomQueryform.get('Functions')?.updateValueAndValidity();
    this.runCustomQueryform.get('GroupBy')?.setValidators(Validators.required); this.runCustomQueryform.get('GroupBy')?.updateValueAndValidity();

    this.runCustomQueryform.get('CustomQueryId')?.clearValidators(); this.runCustomQueryform.get('CustomQueryId')?.updateValueAndValidity();
  }
  onSelectExistingTab() {
    //#region
    this.allTables_loading = true;
    this.selectedWorkspacedata = null;
    this.selectedWorkspace = '';
    (this.runCustomQueryform.get('Functions') as FormArray).clear();
    (this.runCustomQueryform.get('GroupBy') as FormArray).clear();
    (this.runCustomQueryform.get('SortBy') as FormArray).clear();
    (this.runCustomQueryform.get('FilterBy') as FormArray).clear();
    (this.runCustomQueryform.get('ChartInfo') as FormArray).clear();
    this.buildRunCustomQueryform();
    this.databaseName = 'Database Name...';
    this.tables = [];
    this.externalTables = [];
    this.viewTables = [];
    this.xAxisItems = [];
    this.yAxisItems = [];
    this.iFieldFunction = [];
    this.iFieldSortBy = [];
    this.iFieldFilterBy = [];
    this.Tablemetadata = [];
    this.resultData = [];
    this.minimizedChartLists = [];
    this.minimizedResultset = []
    //#endregion

    this.runCustomQueryform.get('CustomQueryId')?.setValidators(Validators.required); this.runCustomQueryform.get('CustomQueryId')?.updateValueAndValidity();

    this.runCustomQueryform.get('TableName')?.clearValidators(); this.runCustomQueryform.get('TableName')?.updateValueAndValidity();
    this.runCustomQueryform.get('Functions')?.clearValidators(); this.runCustomQueryform.get('Functions')?.updateValueAndValidity();
    this.runCustomQueryform.get('GroupBy')?.clearValidators(); this.runCustomQueryform.get('GroupBy')?.updateValueAndValidity();
  }
  onSelectExistingQuery(event: Event) {
    var queryId = (<HTMLInputElement>event.target).value
    this.selectedQuery = this.queries.find(x => x.queryId == queryId)!
    const databaseName = this.connectionStrings.find(x => x.connectionStringId == this.selectedQuery.connectionStringId).databaseName;

    this.buildExecuteQueryForm()
    this.executeQueryForm.patchValue({
      QueryId: this.selectedQuery.queryId,
      DatabaseName: databaseName,
      ConnectionStringId: this.selectedQuery.connectionStringId,
      QuerySQL: this.selectedQuery.querySQL,
      AddedBy: this.selectedQuery.addedBy,
      AddedDate: this.selectedQuery.addedDate,
    })

    this.onSubmitExecuteQueryForm();
  }
  onSelectConnectionInNewTab(event: Event) {
    this.allTables_loading = true;
    (this.runCustomQueryform.get('Functions') as FormArray).clear();
    (this.runCustomQueryform.get('GroupBy') as FormArray).clear();
    (this.runCustomQueryform.get('SortBy') as FormArray).clear();
    (this.runCustomQueryform.get('FilterBy') as FormArray).clear();
    this.databaseName = 'Database Name...';
    this.tables = [];
    this.externalTables = [];
    this.viewTables = [];
    this.xAxisItems = [];
    this.yAxisItems = [];
    this.iFieldFunction = [];
    this.iFieldSortBy = [];
    this.iFieldFilterBy = [];
    this.Tablemetadata = [];
    this.resultData = [];
    var connectionStringId = (<HTMLInputElement>event.target).value;
    this.selectedConnectionStringId = connectionStringId;
    this.databaseName = this.connectionStrings.find(x => x.connectionStringId == connectionStringId).databaseName;
    this.GetAllTables(connectionStringId);
  }
  onSelectConnectionInExistingTab(event: Event) {
    this.allTables_loading = true;
    (this.runCustomQueryform.get('Functions') as FormArray).clear();
    (this.runCustomQueryform.get('GroupBy') as FormArray).clear();
    (this.runCustomQueryform.get('SortBy') as FormArray).clear();
    (this.runCustomQueryform.get('FilterBy') as FormArray).clear();
    this.databaseName = 'Database Name...';
    this.tables = [];
    this.externalTables = [];
    this.viewTables = [];
    this.xAxisItems = [];
    this.yAxisItems = [];
    this.iFieldFunction = [];
    this.iFieldSortBy = [];
    this.iFieldFilterBy = [];
    this.Tablemetadata = [];
    this.resultData = [];
    var connectionStringId = (<HTMLInputElement>event.target).value;
    this.selectedConnectionStringId = connectionStringId;
    if (connectionStringId) {
      this.databaseName = this.connectionStrings.find(x => x.connectionStringId == connectionStringId).databaseName;
      this.GetQueriesByConnectionStringId(connectionStringId);
    }
  }
  onSelectTableInNewTab(event: Event) {
    this.Tablemetadata = [];
    var table = (<HTMLInputElement>event.target).value;
    this.selectedTable = table;
    this.getTableMeatadataForm.patchValue({
      ConnectionStringId: this.selectedConnectionStringId,
      ExternalTableName: table
    });

    if (!this.getTableMeatadataForm.valid) {
      this.getTableMeatadata_loading = false
      return;
    }

    this.analysisService.GetExternalTableMetadata(this.getTableMeatadataForm.value).subscribe(
      (data: any) => {
        this.Tablemetadata = data;
        this.getTableMeatadata_loading = false;
        this.buildCreateTableProfileForm();
      },
      error => {

        this.getTableMeatadata_loading = false
        this.buildCreateTableProfileForm();
      }
    );
  }
  //#endregion

  //#region Resize Chart
  onResizedChartCard(event: ResizedEvent) {
    this.chartWidth = event.newRect.width - 10
    this.chartHeight = event.newRect.height - 10
  }
  //#endregion

  get f() { return this.runCustomQueryform.controls; }

  //#region New Query Panel's Features Builder
  //#region  Functions Controller
  get Functions(): FormArray {
    return this.runCustomQueryform.get('Functions') as FormArray;
  }
  newFuntion(): FormGroup {
    return this.formBuilder.group({
      Id: null,
      ColumnName: ['', Validators.required],
      Function: ['', Validators.required]
    });
  }
  addFunctions() {
    this.Functions.push(this.newFuntion());
  }
  removeFunction(i: number) {
    this.Functions.removeAt(i);
    if (this.iFieldFunction.length > 0 && i != -1) {
      this.iFieldFunction.splice(i, 1);
    }
  }
  onConfirmFunction(i: number) {
    var functionName = this.runCustomQueryform.get('Functions')?.value[i].Function
    var ColumnName = this.runCustomQueryform.get('Functions')?.value[i].ColumnName
    var func = "f(" + functionName + "," + ColumnName + ")";

    if (this.iFieldFunction.hasOwnProperty(i)) {
      this.iFieldFunction[i] = func
    }
    else {
      this.iFieldFunction.push(func)
    }
  }
  //#endregion

  //#region  Group By Controller
  get GroupBy(): FormArray {
    return this.runCustomQueryform.get('GroupBy') as FormArray;
  }
  newGroupBy(): FormGroup {
    return this.formBuilder.group({
      Id: null,
      ColumnName: ['', Validators.required]
    });
  }
  addGroupBy() {
    this.GroupBy.push(this.newGroupBy());
  }
  removeGroupBy(i: number) {
    this.GroupBy.removeAt(i);
  }
  //#endregion

  //#region Sort By Controller
  get SortBy(): FormArray {
    return this.runCustomQueryform.get('SortBy') as FormArray;
  }
  newSortBy(): FormGroup {
    return this.formBuilder.group({
      Id: null,
      ColumnName: ['', Validators.required],
      SortType: ['', Validators.required]
    });
  }
  addSortBy() {
    this.SortBy.push(this.newSortBy());
  }
  removeSortBy(i: number) {
    this.SortBy.removeAt(i);
  }

  onConfirmSortBy(i: number) {
    var sortType = this.runCustomQueryform.get('SortBy')?.value[i].SortType
    var columnName = this.runCustomQueryform.get('SortBy')?.value[i].ColumnName
    var func = columnName + " " + sortType;

    if (this.iFieldSortBy.hasOwnProperty(i)) {
      this.iFieldSortBy[i] = func
    }
    else {
      this.iFieldSortBy.push(func)
    }
  }
  //#endregion

  //#region FilterBy Controller
  get FilterBy(): FormArray {
    return this.runCustomQueryform.get('FilterBy') as FormArray;
  }
  newFilterBy(): FormGroup {
    return this.formBuilder.group({
      Id: null,
      ColumnName: ['', Validators.required],
      FilterOperator: ['', Validators.required],
      FilterValue: ['', Validators.required]
    });
  }
  addFilterBy() {
    this.FilterBy.push(this.newFilterBy());
  }
  removeFilterBy(i: number) {
    this.FilterBy.removeAt(i);
  }
  onConfirmFilterBy(i: number) {
    var columnName = this.runCustomQueryform.get('FilterBy')?.value[i].ColumnName
    var filterOperator = this.runCustomQueryform.get('FilterBy')?.value[i].FilterOperator
    var filterValue = this.runCustomQueryform.get('FilterBy')?.value[i].FilterValue
    var func = columnName + " " + filterOperator + " " + filterValue;

    if (this.iFieldFilterBy.hasOwnProperty(i)) {
      this.iFieldFilterBy[i] = func
    }
    else {
      this.iFieldFilterBy.push(func)
    }
  }
  //#endregion

  //#region ChartInfo
  get ChartInfo(): FormArray {
    return this.runCustomQueryform.get('ChartInfo') as FormArray;
  }
  newChartInfo(): FormGroup {
    return this.formBuilder.group({
      Id: null,
      ChartName: ['', Validators.required],
      ChartType: ['', Validators.required],

      //#region Plugins All Charts
      OptionsPluginsTitleDisplay: [{ value: true, disabled: false }, Validators.required],
      OptionsPluginsTitleText: [{ value: '', disabled: false }, Validators.required],
      OptionsPluginsTitleColor: [{ value: '#495057', disabled: false }, Validators.required],
      OptionsPluginsTitlePosition: [{ value: 'top', disabled: false }, Validators.required], // 'top' or 'bottom'
      OptionsPluginsTitleAlign: [{ value: 'center', disabled: false }, Validators.required], //start, center, end
      OptionsPluginsTitleFontSize: [{ value: 20, disabled: false }, Validators.required],
      OptionsPluginsTitleFontStyle: [{ value: 'normal', disabled: false }, Validators.required], // normal, italic, oblique, initial, inherit
      OptionsPluginsTitleFontWeight: [{ value: 'normal', disabled: false }, Validators.required],  // normal, bold, bolder, lighter, initial, inherit
      OptionsPluginsTitlePaddingTop: [{ value: 0, disabled: false }, Validators.required],
      OptionsPluginsTitlePaddingBottom: [{ value: 0, disabled: false }, Validators.required],

      OptionsPluginsSubtitleDisplay: [{ value: true, disabled: false }, Validators.required],
      OptionsPluginsSubtitleText: [{ value: '', disabled: false }, Validators.required],
      OptionsPluginsSubtitleColor: [{ value: '#495057', disabled: false }, Validators.required],
      OptionsPluginsSubtitlePosition: [{ value: 'top', disabled: false }, Validators.required], // 'top' or 'bottom'
      OptionsPluginsSubtitleAlign: [{ value: 'center', disabled: false }, Validators.required], //start, center, end
      OptionsPluginsSubtitleFontSize: [{ value: 15, disabled: false }, Validators.required],
      OptionsPluginsSubtitleFontStyle: [{ value: 'normal', disabled: false }, Validators.required], // normal, italic, oblique, initial, inherit
      OptionsPluginsSubtitleFontWeight: [{ value: 'normal', disabled: false }, Validators.required],  // normal, bold, bolder, lighter, initial, inherit
      OptionsPluginsSubtitlePaddingTop: [{ value: 0, disabled: false }, Validators.required],
      OptionsPluginsSubtitlePaddingBottom: [{ value: 0, disabled: false }, Validators.required],

      OptionsPluginsTooltipsMode: [{ value: 'index', disabled: false }, Validators.required], //point,nearest,index,dataset, x, y
      OptionsPluginsTooltipsIntersect: [{ value: false, disabled: false }, Validators.required],
      OptionsPluginsLegendLabelsColor: [{ value: '#495057', disabled: false }, Validators.required],
      //#endregion

      //#region Scales Bar and Line
      BarOptionsIndexAxis: [{ value: 'x', disabled: true }, Validators.required], // 'x' for vertical bar or 'y' for horizontal bar
      BarOptionsScalesXYStacked: [{ value: false, disabled: true }, Validators.required],

      BarLineOptionsScalesXYTitleDisplay: [{ value: true, disabled: true }, Validators.required],
      BarLineOptionsScalesXTitleText: [{ value: '', disabled: true }, Validators.required],
      BarLineOptionsScalesYTitleText: [{ value: '', disabled: true }, Validators.required],

      BarLineOptionsScalesXYTitleFontSize: [{ value: 20, disabled: true }, Validators.required],
      BarLineOptionsScalesXYTitleFontStyle: [{ value: 'normal', disabled: true }, Validators.required], // normal, italic, oblique, initial, inherit
      BarLineOptionsScalesXYTitleFontWeight: [{ value: 'normal', disabled: true }, Validators.required],  // normal, bold, bolder, lighter, initial, inherit

      BarLineOptionsScalesXYTitleColor: [{ value: '#495057', disabled: true }, Validators.required],
      BarLineOptionsScalesXYTicksColor: [{ value: '#495057', disabled: true }, Validators.required],
      BarLineOptionsScalesXYGridColor: [{ value: '#495057', disabled: true }, Validators.required],

      //#endregion

      //#region Scales Radar and Polararea(last one)
      RadarOptionsScalesRPointlabelsColor: [{ value: '#495057', disabled: true }, Validators.required],
      RadarOptionsScalesRAnglelinesColor: [{ value: '#495057', disabled: true }, Validators.required],
      RadarPolarareaOptionsScalesRGridColor: [{ value: '#495057', disabled: true }, Validators.required],
      //#endregion

      ChartXAxis: [{ value: '', disabled: false }, Validators.required],
      ChartXAxisOrder: [{ value: '', disabled: false }, Validators.required],
      ChartYAxisInfo: this.formBuilder.array([]),

      FinalChartData: ['', Validators.required],
      FinalChartOptions: ['', Validators.required]
    });
  }
  addChartInfo() {
    this.ChartInfo.push(this.newChartInfo());
  }
  removeChartInfo(i: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target!,
      message: 'Are you sure that you want to proceed?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => { this.ChartInfo.removeAt(i); },
      reject: () => { }
    })

  }
  //#endregion

  //#region ChartYAxisInfo Controller
  ChartYAxisInfo(chartInfoIndex: number): FormArray {
    return this.ChartInfo.at(chartInfoIndex).get('ChartYAxisInfo') as FormArray;
  }
  newChartYAxisInfo(): FormGroup {
    return this.formBuilder.group({
      Id: null,
      ChartYAxis: ['', Validators.required],
      ChartYAxisOrder: [{ value: '', disabled: true }, Validators.required],
      ChartYAxisFunction: ['', Validators.required],

      LineBarRadarPolarDatasetsLabel: [{ value: '', disabled: true }, Validators.required],
      LineBarRadarDatasetsBackgroundColor: [{ value: '#42A5F5', disabled: true }, Validators.required],

      LineDatasetsFill: [{ value: false, disabled: true }, Validators.required],
      LineDatasetsBorderDash: [{ value: "[0, 0]", disabled: true }, Validators.required],
      LineDatasetsTension: [{ value: 0.4, disabled: true }, Validators.required],
      LineRadarDatasetsBorderColor: [{ value: '#42A5F5', disabled: true }, Validators.required],
      RadarDatasetsPointBackgroundColor: [{ value: '#42A5F5', disabled: true }, Validators.required],
      RadarDatasetsPointBorderColor: [{ value: '#42A5F5', disabled: true }, Validators.required],
      RadarDatsetsPointHoverBackgroundColor: [{ value: '#42A5F5', disabled: true }, Validators.required],
      RadarDatasetsPointHoverBorderColor: [{ value: '#42A5F5', disabled: true }, Validators.required],
    });
  }
  addChartYAxisInfo(chartInfoIndex: number) {
    this.ChartYAxisInfo(chartInfoIndex).push(this.newChartYAxisInfo());
  }
  removeChartYAxisInfo(chartInfoIndex: number, chartYAxisInfoIndex: number) {
    this.ChartYAxisInfo(chartInfoIndex).removeAt(chartYAxisInfoIndex);
  }
  //#endregion

  //#endregion

  resetRunCustomQueryForm(event: Event) {
    this.confirmationService.confirm({
      target: event.target!,
      message: 'All charts and table will be erased. Are you sure that you want to proceed?',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      acceptLabel: 'Yes',
      acceptButtonStyleClass: 'p-button-danger',
      rejectIcon: 'pi pi-times',
      rejectLabel: 'No',
      rejectButtonStyleClass: 'ui-button-success',
      defaultFocus: 'reject',
      accept: () => {
        this.buildRunCustomQueryform();
        (this.runCustomQueryform.get('Functions') as FormArray).clear();
        (this.runCustomQueryform.get('GroupBy') as FormArray).clear();
        (this.runCustomQueryform.get('SortBy') as FormArray).clear();
        (this.runCustomQueryform.get('FilterBy') as FormArray).clear();
        this.allTables_loading = true;
        this.databaseName = 'Database Name...';
        this.tables = [];
        this.externalTables = [];
        this.viewTables = [];
        this.xAxisItems = [];
        this.yAxisItems = [];
        this.iFieldFunction = [];
        this.iFieldSortBy = [];
        this.iFieldFilterBy = [];
        this.Tablemetadata = [];
        this.resultData = [];
        this.default_select = null
        this.chartData1 = [];
        this.chartData2 = [];
        this.chartData3 = [];
        this.chartData4 = [];
        this.selectedWorkspacedata = null;
        this.selectedWorkspace = '';
        this.minimizedChartLists = [];
        this.queries = [];
        this.minimizedChartLists = [];
      }
    })

  }

  createChart(i: number, chart_name: string, chartType: string, xAxis: string, yAxis: string) {
    if (i == 1) {
      this.chartData1 = {
        labels: [],
        datasets: []
      }
      if (Number(chartType) == 1) {
        this.isLineChart1 = true;
        this.isBarChart1 = false;
      }
      else if (Number(chartType) == 2) {
        this.isLineChart1 = false;
        this.isBarChart1 = true;
      }
      this.resultData.forEach(element => {
        this.chartData1.labels.push(element[xAxis]);
      });
      var _data: any[] = [];
      this.resultData.forEach(element => {
        _data.push(element[yAxis])
      });
      this.chartData1.datasets.push(
        {
          label: yAxis,
          data: _data,
          fill: false,
          borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          tension: .4
        }
      )
      this.runCustomQueryform.patchValue({
        ChartName1: chart_name,
        xAxis1: xAxis,
        yAxis1: yAxis,
        ChartType1: chartType
      });
    }
    else if (i == 2) {
      this.chartData2 = {
        labels: [],
        datasets: []
      }
      if (Number(chartType) == 1) {
        this.isLineChart2 = true;
        this.isBarChart2 = false;
      }
      else if (Number(chartType) == 2) {
        this.isLineChart2 = false;
        this.isBarChart2 = true;
      }
      this.resultData.forEach(element => {
        this.chartData2.labels.push(element[xAxis]);
      });
      var _data: any[] = [];
      this.resultData.forEach(element => {
        _data.push(element[yAxis])
      });
      this.chartData2.datasets.push(
        {
          label: yAxis,
          data: _data,
          fill: false,
          borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          tension: .4
        }
      )
      this.runCustomQueryform.patchValue({
        ChartName2: chart_name,
        xAxis2: xAxis,
        yAxis2: yAxis,
        ChartType2: chartType
      });
    }
    else if (i == 3) {
      this.chartData3 = {
        labels: [],
        datasets: []
      }
      if (Number(chartType) == 1) {
        this.isLineChart3 = true;
        this.isBarChart3 = false;
      }
      else if (Number(chartType) == 2) {
        this.isLineChart3 = false;
        this.isBarChart3 = true;
      }
      this.resultData.forEach(element => {
        this.chartData3.labels.push(element[xAxis]);
      });
      var _data: any[] = [];
      this.resultData.forEach(element => {
        _data.push(element[yAxis])
      });
      this.chartData3.datasets.push(
        {
          label: yAxis,
          data: _data,
          fill: false,
          borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          tension: .4
        }
      );
      this.runCustomQueryform.patchValue({
        ChartName3: chart_name,
        xAxis3: xAxis,
        yAxis3: yAxis,
        ChartType3: chartType
      });
    }
    else if (i == 4) {
      this.chartData4 = {
        labels: [],
        datasets: []
      }
      if (Number(chartType) == 1) {
        this.isLineChart4 = true;
        this.isBarChart4 = false;
      }
      else if (Number(chartType) == 2) {
        this.isLineChart4 = false;
        this.isBarChart4 = true;
      }
      this.resultData.forEach(element => {
        this.chartData4.labels.push(element[xAxis]);
      });
      var _data: any[] = [];
      this.resultData.forEach(element => {
        _data.push(element[yAxis])
      });
      this.chartData4.datasets.push(
        {
          label: yAxis,
          data: _data,
          fill: false,
          borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          tension: .4
        }
      )
      this.runCustomQueryform.patchValue({
        ChartName4: chart_name,
        xAxis4: xAxis,
        yAxis4: yAxis,
        ChartType4: chartType
      });
    }
    this.onHideDialog();
  }

  //#region Dialogs open/close
  showDialog(i: number) {
    this.chartNumber = i;
    this.display = true;
  }
  showSaveQueryDialog() {
    this.displaySaveQuery = true;
  }
  onHideSaveQueryDialog() {
    this.displaySaveQuery = false;
  }
  onHideDialog() {
    this.chartNumber = 0;
    this.display = false;
  }
  showAllQueriesDialog() {
    this.displayAllQueries = true;
  }
  onHideAllQueriesDialog() {
    this.displayAllQueries = false;
  }
  //#endregion

  saveChartData() {
    this.saveCustomQuery_loading = true;
    this.todayDate = new Date().toISOString()
    this.runCustomQueryform.patchValue({
      AddedBy: this.userName,
      UpdatedBy: this.userName,
      AddedDate: this.todayDate,
      UpdatedDate: this.todayDate
    })
    this.reportsService.SaveCustomQuery(this.runCustomQueryform.value).subscribe(
      (res: any) => {
        this.GetAllCustomQuery();
        this.toastr.success('Successfully saved', 'Success', { positionClass: 'toast-bottom-right' })
        this.todayDate = new Date().toISOString();
        this.saveCustomQuery_loading = false;
        this.onHideSaveQueryDialog();
        this.SetCustomQueryDataAfterSave(res);
      }, err => {
        this.toastr.error(err.error, 'Error', { positionClass: 'toast-bottom-right' })
        this.saveCustomQuery_loading = false;
      });
  }

  saveAsChartData() {
    this.saveCustomQuery_loading = true;
    this.todayDate = new Date().toISOString()
    this.runCustomQueryform.patchValue({
      AddedBy: this.userName,
      UpdatedBy: this.userName,
      AddedDate: this.todayDate,
      UpdatedDate: this.todayDate
    })
    this.reportsService.SaveAsCustomQuery(this.runCustomQueryform.value).subscribe(
      (res: any) => {
        this.GetAllCustomQuery();
        this.toastr.success('Successfully saved', 'Success', { positionClass: 'toast-bottom-right' })
        this.todayDate = new Date().toISOString();
        this.saveCustomQuery_loading = false;
        this.onHideSaveQueryDialog();
        console.log(res);
        this.SetCustomQueryDataAfterSave(res);
      },
      err => {
        this.toastr.error(err.error, 'Error', { positionClass: 'toast-bottom-right' })
        this.saveCustomQuery_loading = false;
      });
  }

  DeleteCustomQuery(queryId: string, event: Event) {
    this.confirmationService.confirm({
      target: event.target!,
      message: 'Are you sure that you want to proceed?',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      acceptLabel: 'Yes',
      acceptButtonStyleClass: 'p-button-danger',
      rejectIcon: 'pi pi-times',
      rejectLabel: 'No',
      rejectButtonStyleClass: 'ui-button-success',
      defaultFocus: 'reject',
      accept: () => {
        this.reportsService.DeleteCustomQuery(queryId).subscribe(
          res => {
            this.toastr.success('Successfully deleted', 'Success', { positionClass: 'toast-bottom-right' })
            this.GetAllCustomQuery();
          },
          err => {
            this.toastr.error('Error while deleting', 'Error', { positionClass: 'toast-bottom-right' })
          });
      },
      reject: () => {
        return;
      }
    });
  }

  SetCustomQueryToEdit(queryId: string) {
    this.buildRunCustomQueryform();
    this.onHideAllQueriesDialog();
    this.selectedWorkspacedata = null;
    this.databaseName = '';
    this.tables = [];
    this.externalTables = [];
    this.viewTables = [];
    var data = this.allWorkSpaces.find(x => x.customQueryId == queryId);
    this.selectedWorkspacedata = data;
    this.selectedWorkspace = data.customQueryName;
    this.databaseName = data.databaseName;

    //#region Tab selector
    if (data.tableName) {
      this.selectTab(0)
    }
    else if (!data.tableName) {
      this.selectTab(1)
    }
    //#endregion

    //#region Set Table metadata
    if (data.tableName) {
      this.Tablemetadata = [];
      this.getTableMeatadataForm.patchValue({
        ConnectionStringId: data.connectionStringId,
        ExternalTableName: data.tableName
      });
      if (!this.getTableMeatadataForm.valid) {
        this.getTableMeatadata_loading = false
        return;
      }
      this.analysisService.GetExternalTableMetadata(this.getTableMeatadataForm.value).subscribe(
        (data: any) => {
          this.Tablemetadata = data;
          this.getTableMeatadata_loading = false;
          this.buildCreateTableProfileForm();
        },
        error => {
          this.getTableMeatadata_loading = false
          this.buildCreateTableProfileForm();
        }
      );
    }
    //#endregion

    //#region patchValue
    this.runCustomQueryform.patchValue({
      CustomQueryId: data.customQueryId,
      ConnectionStringId: data.connectionStringId,
      TableName: data.tableName,
      CustomQueryName: data.customQueryName,

      AddedBy: data.addedBy,
      AddedDate: data.addedDate,
      UpdatedBy: data.updatedBy,
      UpdatedDate: data.updatedDate
    });

    if (data.tableName) {
      if (data.functionss.length >= 1) {
        data.functionss.forEach((element: any, index: number) => {
          this.addFunctions();
          var func = this.runCustomQueryform.get('Functions') as FormArray
          func.controls[index].patchValue({
            Id: element.id,
            ColumnName: element.columnName,
            Function: element.function,
          })
          this.onConfirmFunction(index);
        });
      }
      if (data.groupby.length >= 1) {
        data.groupby.forEach((element: any, index: number) => {
          this.addGroupBy();
          var gropuby = this.runCustomQueryform.get('GroupBy') as FormArray
          gropuby.controls[index].patchValue({
            Id: element.id,
            ColumnName: element.columnName
          })
        });
      }
      if (data.sortby.length >= 1) {
        data.sortby.forEach((element: any, index: number) => {
          this.addSortBy();
          var sortby = this.runCustomQueryform.get('SortBy') as FormArray
          sortby.controls[index].patchValue({
            Id: element.id,
            ColumnName: element.columnName,
            SortType: element.sortType
          })
          this.onConfirmSortBy(index);
        });
      }
      if (data.filterby.length >= 1) {
        data.filterby.forEach((element: any, index: number) => {
          this.addFilterBy();
          var filterby = this.runCustomQueryform.get('FilterBy') as FormArray
          filterby.controls[index].patchValue({
            Id: element.id,
            ColumnName: element.columnName,
            FilterOperator: element.filterOperator,
            FilterValue: element.filterValue
          })
          this.onConfirmFilterBy(index);
        });
      }
    }
    if (data.chartinfo.length >= 1) {
      data.chartinfo.forEach((element: any, index: number) => {
        this.addChartInfo();
        this.onSelectChartType(index, element.chartType);
        var chartinfo = this.runCustomQueryform.get('ChartInfo') as FormArray
        chartinfo.controls[index].patchValue({
          Id: element.id != null ? element.id : null,
          ChartName: element.chartName,
          ChartType: element.chartType,
          OptionsPluginsTitleDisplay: element.optionsPluginsTitleDisplay,
          OptionsPluginsTitleText: element.optionsPluginsTitleText,
          OptionsPluginsTitleColor: element.optionsPluginsTitleColor,
          OptionsPluginsTitlePosition: element.optionsPluginsTitlePosition,
          OptionsPluginsTitleAlign: element.optionsPluginsTitleAlign,
          OptionsPluginsTitleFontSize: element.optionsPluginsTitleFontSize,
          OptionsPluginsTitleFontStyle: element.optionsPluginsTitleFontStyle,
          OptionsPluginsTitleFontWeight: element.optionsPluginsTitleFontWeight,
          OptionsPluginsTitlePaddingTop: element.optionsPluginsTitlePaddingTop,
          OptionsPluginsTitlePaddingBottom: element.optionsPluginsTitlePaddingBottom,
          OptionsPluginsSubtitleDisplay: element.optionsPluginsSubtitleDisplay,
          OptionsPluginsSubtitleText: element.optionsPluginsSubtitleText,
          OptionsPluginsSubtitleColor: element.optionsPluginsSubtitleColor,
          OptionsPluginsSubtitlePosition: element.optionsPluginsSubtitlePosition,
          OptionsPluginsSubtitleAlign: element.optionsPluginsSubtitleAlign,
          OptionsPluginsSubtitleFontSize: element.optionsPluginsSubtitleFontSize,
          OptionsPluginsSubtitleFontStyle: element.optionsPluginsSubtitleFontStyle,
          OptionsPluginsSubtitleFontWeight: element.optionsPluginsSubtitleFontWeight,
          OptionsPluginsSubtitlePaddingTop: element.optionsPluginsSubtitlePaddingTop,
          OptionsPluginsSubtitlePaddingBottom: element.optionsPluginsSubtitlePaddingBottom,
          BarOptionsIndexAxis: element.barOptionsIndexAxis,
          BarOptionsScalesXYStacked: element.barOptionsScalesXYStacked,
          BarLineOptionsScalesXYTitleDisplay: element.barLineOptionsScalesXYTitleDisplay,
          BarLineOptionsScalesXTitleText: element.barLineOptionsScalesXTitleText,
          BarLineOptionsScalesYTitleText: element.barLineOptionsScalesYTitleText,
          BarLineOptionsScalesXYTitleFontSize: element.barLineOptionsScalesXYTitleFontSize,
          BarLineOptionsScalesXYTitleFontStyle: element.barLineOptionsScalesXYTitleFontStyle,
          BarLineOptionsScalesXYTitleFontWeight: element.barLineOptionsScalesXYTitleFontWeight,
          BarLineOptionsScalesXYTitleColor: element.barLineOptionsScalesXYTitleColor,
          BarLineOptionsScalesXYTicksColor: element.barLineOptionsScalesXYTicksColor,
          BarLineOptionsScalesXYGridColor: element.barLineOptionsScalesXYGridColor,
          RadarOptionsScalesRPointlabelsColor: element.radarOptionsScalesRPointlabelsColor,
          RadarOptionsScalesRAnglelinesColor: element.radarOptionsScalesRAnglelinesColor,
          RadarPolarareaOptionsScalesRGridColor: element.radarPolarareaOptionsScalesRGridColor,
          ChartXAxis: element.chartXAxis,
          ChartXAxisOrder: element.chartXAxisOrder,
          FinalChartData: element.finalChartData,
          FinalChartOptions: element.finalChartOptions,
        });
        element.chartYAxisinfo.forEach((item: any, indexY: number) => {
          this.addChartYAxisInfo(index)
          this.onChangeChartType(index, element.chartType)
          var chartYAxisInfo = this.ChartInfo.at(index).get('ChartYAxisInfo') as FormArray;
          chartYAxisInfo.controls[indexY].patchValue({
            Id: item.id,
            ChartYAxis: item.chartYAxis,
            ChartYAxisOrder: item.chartYAxisOrder,
            ChartYAxisFunction: item.chartYAxisFunction,
            LineBarRadarPolarDatasetsLabel: item.lineBarRadarPolarDatasetsLabel,
            LineBarRadarDatasetsBackgroundColor: item.lineBarRadarDatasetsBackgroundColor,
            LineDatasetsFill: item.lineDatasetsFill,
            LineDatasetsBorderDash: item.lineDatasetsBorderDash,
            LineDatasetsTension: item.lineDatasetsTension,
            LineRadarDatasetsBorderColor: item.lineRadarDatasetsBorderColor,
            RadarDatasetsPointBackgroundColor: item.radarDatasetsPointBackgroundColor,
            RadarDatasetsPointBorderColor: item.radarDatasetsPointBorderColor,
            RadarDatsetsPointHoverBackgroundColor: item.radarDatsetsPointHoverBackgroundColor,
            RadarDatasetsPointHoverBorderColor: item.radarDatsetsPointHoverBorderColor,
          })
        })
      });
    }
    //#endregion

    if (data.tableName) {
      this.GetAllTables(data.connectionStringId);
      this.onSubmitRunCustomQuery()
    }
    else {
      this.analysisService.GetQueriesByConnectionStringId(data.connectionStringId).subscribe(
        res => {
          this.queries = res;

          this.runExistingQueryPostSelect(data, this.queries)
        },
        err => { }
      );
    }
  }

  SetCustomQueryDataAfterSave(data: any) {
    this.buildRunCustomQueryform();
    this.onHideAllQueriesDialog();

    this.selectedWorkspacedata = data;
    this.selectedWorkspace = data.customQueryName;
    this.Tablemetadata = [];
    this.tables = [];
    this.externalTables = [];
    this.viewTables = [];


    this.databaseName = data.databaseName;

    if (data.tableName) {
      this.getTableMeatadataForm.patchValue({
        ConnectionStringId: data.connectionStringId,
        ExternalTableName: data.tableName
      });
      if (!this.getTableMeatadataForm.valid) {
        this.getTableMeatadata_loading = false
        return;
      }
      this.analysisService.GetExternalTableMetadata(this.getTableMeatadataForm.value).subscribe(
        (data: any) => {
          this.Tablemetadata = data;
          this.getTableMeatadata_loading = false;
          this.buildCreateTableProfileForm();
        },
        error => {
          this.getTableMeatadata_loading = false
          this.buildCreateTableProfileForm();
        }
      );
    }
    this.runCustomQueryform.patchValue({
      CustomQueryId: data.customQueryId,
      ConnectionStringId: data.connectionStringId,
      TableName: data.tableName,
      CustomQueryName: data.customQueryName,
      AddedBy: data.addedBy,
      AddedDate: data.addedDate,
      UpdatedBy: data.updatedBy,
      UpdatedDate: data.updatedDate
    });

    if (data.tableName) {
      if (data.functionss.length >= 1) {
        data.functionss.forEach((element: any, index: number) => {
          this.addFunctions();
          var func = this.runCustomQueryform.get('Functions') as FormArray
          func.controls[index].patchValue({
            Id: element.id,
            ColumnName: element.columnName,
            Function: element.function,
          })
          this.onConfirmFunction(index);
        });
      }
      if (data.groupby.length >= 1) {
        data.groupby.forEach((element: any, index: number) => {
          this.addGroupBy();
          var gropuby = this.runCustomQueryform.get('GroupBy') as FormArray
          gropuby.controls[index].patchValue({
            Id: element.id,
            ColumnName: element.columnName
          })
        });
      }
      if (data.sortby.length >= 1) {
        data.sortby.forEach((element: any, index: number) => {
          this.addSortBy();
          var sortby = this.runCustomQueryform.get('SortBy') as FormArray
          sortby.controls[index].patchValue({
            Id: element.id,
            ColumnName: element.columnName,
            SortType: element.sortType
          })
          this.onConfirmSortBy(index);
        });
      }
      if (data.filterby.length >= 1) {
        data.filterby.forEach((element: any, index: number) => {
          this.addFilterBy();
          var filterby = this.runCustomQueryform.get('FilterBy') as FormArray
          filterby.controls[index].patchValue({
            Id: element.id,
            ColumnName: element.columnName,
            FilterOperator: element.filterOperator,
            FilterValue: element.filterValue
          })
          this.onConfirmFilterBy(index);
        });
      }
    }
    if (data.chartinfo.length >= 1) {
      data.chartinfo.forEach((element: any, index: number) => {
        this.addChartInfo();
        this.onSelectChartType(index, element.chartType);
        var chartinfo = this.runCustomQueryform.get('ChartInfo') as FormArray
        chartinfo.controls[index].patchValue({
          Id: element.id != null ? element.id : null,
          ChartName: element.chartName,
          ChartType: element.chartType,
          OptionsPluginsTitleDisplay: element.optionsPluginsTitleDisplay,
          OptionsPluginsTitleText: element.optionsPluginsTitleText,
          OptionsPluginsTitleColor: element.optionsPluginsTitleColor,
          OptionsPluginsTitlePosition: element.optionsPluginsTitlePosition,
          OptionsPluginsTitleAlign: element.optionsPluginsTitleAlign,
          OptionsPluginsTitleFontSize: element.optionsPluginsTitleFontSize,
          OptionsPluginsTitleFontStyle: element.optionsPluginsTitleFontStyle,
          OptionsPluginsTitleFontWeight: element.optionsPluginsTitleFontWeight,
          OptionsPluginsTitlePaddingTop: element.optionsPluginsTitlePaddingTop,
          OptionsPluginsTitlePaddingBottom: element.optionsPluginsTitlePaddingBottom,
          OptionsPluginsSubtitleDisplay: element.optionsPluginsSubtitleDisplay,
          OptionsPluginsSubtitleText: element.optionsPluginsSubtitleText,
          OptionsPluginsSubtitleColor: element.optionsPluginsSubtitleColor,
          OptionsPluginsSubtitlePosition: element.optionsPluginsSubtitlePosition,
          OptionsPluginsSubtitleAlign: element.optionsPluginsSubtitleAlign,
          OptionsPluginsSubtitleFontSize: element.optionsPluginsSubtitleFontSize,
          OptionsPluginsSubtitleFontStyle: element.optionsPluginsSubtitleFontStyle,
          OptionsPluginsSubtitleFontWeight: element.optionsPluginsSubtitleFontWeight,
          OptionsPluginsSubtitlePaddingTop: element.optionsPluginsSubtitlePaddingTop,
          OptionsPluginsSubtitlePaddingBottom: element.optionsPluginsSubtitlePaddingBottom,
          BarOptionsIndexAxis: element.barOptionsIndexAxis,
          BarOptionsScalesXYStacked: element.barOptionsScalesXYStacked,
          BarLineOptionsScalesXYTitleDisplay: element.barLineOptionsScalesXYTitleDisplay,
          BarLineOptionsScalesXTitleText: element.barLineOptionsScalesXTitleText,
          BarLineOptionsScalesYTitleText: element.barLineOptionsScalesYTitleText,
          BarLineOptionsScalesXYTitleFontSize: element.barLineOptionsScalesXYTitleFontSize,
          BarLineOptionsScalesXYTitleFontStyle: element.barLineOptionsScalesXYTitleFontStyle,
          BarLineOptionsScalesXYTitleFontWeight: element.barLineOptionsScalesXYTitleFontWeight,
          BarLineOptionsScalesXYTitleColor: element.barLineOptionsScalesXYTitleColor,
          BarLineOptionsScalesXYTicksColor: element.barLineOptionsScalesXYTicksColor,
          BarLineOptionsScalesXYGridColor: element.barLineOptionsScalesXYGridColor,
          RadarOptionsScalesRPointlabelsColor: element.radarOptionsScalesRPointlabelsColor,
          RadarOptionsScalesRAnglelinesColor: element.radarOptionsScalesRAnglelinesColor,
          RadarPolarareaOptionsScalesRGridColor: element.radarPolarareaOptionsScalesRGridColor,
          ChartXAxis: element.chartXAxis,
          ChartXAxisOrder: element.chartXAxisOrder,
          FinalChartData: element.finalChartData,
          FinalChartOptions: element.finalChartOptions,
        });
        element.chartYAxisinfo.forEach((item: any, indexY: number) => {
          this.addChartYAxisInfo(index)
          this.onChangeChartType(index, element.chartType)
          var chartYAxisInfo = this.ChartInfo.at(index).get('ChartYAxisInfo') as FormArray;
          chartYAxisInfo.controls[indexY].patchValue({
            Id: item.id,
            ChartYAxis: item.chartYAxis,
            ChartYAxisOrder: item.chartYAxisOrder,
            ChartYAxisFunction: item.chartYAxisFunction,
            LineBarRadarPolarDatasetsLabel: item.lineBarRadarPolarDatasetsLabel,
            LineBarRadarDatasetsBackgroundColor: item.lineBarRadarDatasetsBackgroundColor,
            LineDatasetsFill: item.lineDatasetsFill,
            LineDatasetsBorderDash: item.lineDatasetsBorderDash,
            LineDatasetsTension: item.lineDatasetsTension,
            LineRadarDatasetsBorderColor: item.lineRadarDatasetsBorderColor,
            RadarDatasetsPointBackgroundColor: item.radarDatasetsPointBackgroundColor,
            RadarDatasetsPointBorderColor: item.radarDatasetsPointBorderColor,
            RadarDatsetsPointHoverBackgroundColor: item.radarDatsetsPointHoverBackgroundColor,
            RadarDatasetsPointHoverBorderColor: item.radarDatsetsPointHoverBorderColor,
          })
        })

      });
    }
    if (data.tableName) {
      this.GetAllTables(data.connectionStringId);
      this.onSubmitRunCustomQuery()
    }
    else {
      this.runCustomQueryform.get('TableName')?.clearValidators(); this.runCustomQueryform.get('TableName')?.updateValueAndValidity();
      this.runCustomQueryform.get('Functions')?.clearValidators(); this.runCustomQueryform.get('Functions')?.updateValueAndValidity();
      this.runCustomQueryform.get('GroupBy')?.clearValidators(); this.runCustomQueryform.get('GroupBy')?.updateValueAndValidity();
      // this.analysisService.GetQueriesByConnectionStringId(data.connectionStringId).subscribe(
      //   res => {
      //     this.queries = res;

      //     this.runExistingQueryPostSelect(data, this.queries)
      //   },
      //   err => { }
      // );
    }
  }

  runExistingQueryPostSelect(data: any, queries: any) {

    this.databaseName = this.connectionStrings.find(x => x.connectionStringId == data.connectionStringId).databaseName;
    var querySQL = queries.find((x: any) => x.queryId == data.customQueryId).querySQL
    this.buildExecuteQueryForm()
    this.executeQueryForm.patchValue({
      QueryId: data.customQueryId,
      DatabaseName: this.databaseName,
      ConnectionStringId: data.connectionStringId,
      QuerySQL: querySQL,
      AddedBy: this.todayDate,
      AddedDate: this.todayDate,
    })

    this.onSubmitExecuteQueryForm();
  }

  renderSavedCharts() {
    if (this.resultData.length > 0) {
      if (this.selectedWorkspacedata.chartType1 != null) {
        this.createChart(1, this.selectedWorkspacedata.chartName1, this.selectedWorkspacedata.chartType1, this.selectedWorkspacedata.xAxis1, this.selectedWorkspacedata.yAxis1);
      }
      if (this.selectedWorkspacedata.chartName2 != null) {
        this.createChart(2, this.selectedWorkspacedata.chartName2, this.selectedWorkspacedata.chartType2, this.selectedWorkspacedata.xAxis2, this.selectedWorkspacedata.yAxis2);
      }
      if (this.selectedWorkspacedata.chartName3 != null) {
        this.createChart(3, this.selectedWorkspacedata.chartName3, this.selectedWorkspacedata.chartType3, this.selectedWorkspacedata.xAxis3, this.selectedWorkspacedata.yAxis3);
      }
      if (this.selectedWorkspacedata.chartName4 != null) {
        this.createChart(4, this.selectedWorkspacedata.chartName4, this.selectedWorkspacedata.chartType4, this.selectedWorkspacedata.xAxis4, this.selectedWorkspacedata.yAxis4);
      }
    }
  }

  setValidatorToWorkspaceName() {
    this.runCustomQueryform.controls.CustomQueryName.enable();
    this.runCustomQueryform.controls.CustomQueryName.setValidators([Validators.required]);
    this.runCustomQueryform.controls.CustomQueryName.updateValueAndValidity();
  }

  removeValidatorToWorkspaceName() {
    this.runCustomQueryform.controls.CustomQueryName.disable();
    this.runCustomQueryform.controls.CustomQueryName.clearValidators();
    this.runCustomQueryform.controls.CustomQueryName.updateValueAndValidity();
  }

  save() {
    this.setValidatorToWorkspaceName();
    this.showSaveQueryDialog()
  }

  clieckedOnSave() {
    this.isSave = true;
    this.isSaveAs = false;
  }

  clieckedOnSaveAs() {
    this.isSave = false;
    this.isSaveAs = true;
  }

  instantSave() {
    try {
      this.setValidatorToWorkspaceName()
      this.saveChartData();
    }
    finally {
      this.removeValidatorToWorkspaceName();
    }
  }
  //#endregion

  onSelectChartType(i: number, _chartType: any) {
    // var chartType = (<HTMLInputElement>event.target).value
    var chartInfo = this.runCustomQueryform.get('ChartInfo') as FormArray;

    if (_chartType == null || _chartType == undefined || _chartType == "") {
      this.chartTypeSelected = false;
      chartInfo.at(i).get('BarOptionsIndexAxis')!.disable(); chartInfo.at(i).get('BarOptionsIndexAxis')!.clearValidators(); chartInfo.at(i).get('BarOptionsIndexAxis')!.updateValueAndValidity();
      chartInfo.at(i).get('BarOptionsScalesXYStacked')!.disable(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.clearValidators(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.disable(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.clearValidators(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.updateValueAndValidity();
    }
    else if (_chartType == 'bar') {
      this.chartTypeSelected = true;
      chartInfo.at(i).get('BarOptionsIndexAxis')!.enable(); chartInfo.at(i).get('BarOptionsIndexAxis')!.setValidators([Validators.required]); chartInfo.at(i).get('BarOptionsIndexAxis')!.updateValueAndValidity();
      chartInfo.at(i).get('BarOptionsScalesXYStacked')!.enable(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.setValidators([Validators.required]); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.updateValueAndValidity();


      chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.updateValueAndValidity();

      chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.disable(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.clearValidators(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.updateValueAndValidity();
    }
    else if (_chartType == 'line') {
      this.chartTypeSelected = true;
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.enable(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.setValidators([Validators.required]); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.updateValueAndValidity();

      chartInfo.at(i).get('BarOptionsIndexAxis')!.disable(); chartInfo.at(i).get('BarOptionsIndexAxis')!.clearValidators(); chartInfo.at(i).get('BarOptionsIndexAxis')!.updateValueAndValidity();
      chartInfo.at(i).get('BarOptionsScalesXYStacked')!.disable(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.clearValidators(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.disable(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.clearValidators(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.updateValueAndValidity();
    }
    else if (_chartType == 'pie') {
      this.chartTypeSelected = true;
      chartInfo.at(i).get('BarOptionsIndexAxis')!.disable(); chartInfo.at(i).get('BarOptionsIndexAxis')!.clearValidators(); chartInfo.at(i).get('BarOptionsIndexAxis')!.updateValueAndValidity();
      chartInfo.at(i).get('BarOptionsScalesXYStacked')!.disable(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.clearValidators(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.disable(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.clearValidators(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.updateValueAndValidity();
    }
    else if (_chartType == 'doughnut') {
      this.chartTypeSelected = true;
      chartInfo.at(i).get('BarOptionsIndexAxis')!.disable(); chartInfo.at(i).get('BarOptionsIndexAxis')!.clearValidators(); chartInfo.at(i).get('BarOptionsIndexAxis')!.updateValueAndValidity();
      chartInfo.at(i).get('BarOptionsScalesXYStacked')!.disable(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.clearValidators(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.disable(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.clearValidators(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.updateValueAndValidity();
    }
    else if (_chartType == 'radar') {
      this.chartTypeSelected = true;
      chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.enable(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.setValidators([Validators.required]); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.enable(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.setValidators([Validators.required]); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.enable(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.setValidators([Validators.required]); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.updateValueAndValidity();

      chartInfo.at(i).get('BarOptionsIndexAxis')!.disable(); chartInfo.at(i).get('BarOptionsIndexAxis')!.clearValidators(); chartInfo.at(i).get('BarOptionsIndexAxis')!.updateValueAndValidity();
      chartInfo.at(i).get('BarOptionsScalesXYStacked')!.disable(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.clearValidators(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.updateValueAndValidity();
    }
    else if (_chartType == 'polarArea') {
      this.chartTypeSelected = true;
      chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.enable(); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.setValidators([Validators.required]); chartInfo.at(i).get('RadarPolarareaOptionsScalesRGridColor')!.updateValueAndValidity();

      chartInfo.at(i).get('BarOptionsIndexAxis')!.disable(); chartInfo.at(i).get('BarOptionsIndexAxis')!.clearValidators(); chartInfo.at(i).get('BarOptionsIndexAxis')!.updateValueAndValidity();
      chartInfo.at(i).get('BarOptionsScalesXYStacked')!.disable(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.clearValidators(); chartInfo.at(i).get('BarOptionsScalesXYStacked')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleDisplay')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontSize')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontStyle')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTitleFontWeight')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYTicksColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXYGridColor')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesXTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.disable(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.clearValidators(); chartInfo.at(i).get('BarLineOptionsScalesYTitleText')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRPointlabelsColor')!.updateValueAndValidity();
      chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.disable(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.clearValidators(); chartInfo.at(i).get('RadarOptionsScalesRAnglelinesColor')!.updateValueAndValidity();
    }

  }

  onChangeChartType(i: number, _chartType: any) {
    var _x = this.ChartInfo.at(i).get('ChartYAxisInfo') as FormArray;

    for (var j = 0; j < _x.length; j++) {
      if (_chartType == null || _chartType == undefined || _chartType == "") {
        _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.disable(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.clearValidators(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.updateValueAndValidity();
        _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.disable(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.clearValidators(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsFill')?.disable(); _x.at(j).get('LineDatasetsFill')?.clearValidators(); _x.at(j).get('LineDatasetsFill')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsBorderDash')?.disable(); _x.at(j).get('LineDatasetsBorderDash')?.clearValidators(); _x.at(j).get('LineDatasetsBorderDash')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsTension')?.disable(); _x.at(j).get('LineDatasetsTension')?.clearValidators(); _x.at(j).get('LineDatasetsTension')?.updateValueAndValidity();
        _x.at(j).get('LineRadarDatasetsBorderColor')?.disable(); _x.at(j).get('LineRadarDatasetsBorderColor')?.clearValidators(); _x.at(j).get('LineRadarDatasetsBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBackgroundColor')?.disable(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.disable(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.updateValueAndValidity();
      }
      else if (_chartType == 'bar') {

        _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.enable(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.setValidators([Validators.required]); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.updateValueAndValidity();
        _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.enable(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.setValidators([Validators.required]); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.updateValueAndValidity();

        _x.at(j).get('LineDatasetsFill')?.disable(); _x.at(j).get('LineDatasetsFill')?.clearValidators(); _x.at(j).get('LineDatasetsFill')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsBorderDash')?.disable(); _x.at(j).get('LineDatasetsBorderDash')?.clearValidators(); _x.at(j).get('LineDatasetsBorderDash')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsTension')?.disable(); _x.at(j).get('LineDatasetsTension')?.clearValidators(); _x.at(j).get('LineDatasetsTension')?.updateValueAndValidity();
        _x.at(j).get('LineRadarDatasetsBorderColor')?.disable(); _x.at(j).get('LineRadarDatasetsBorderColor')?.clearValidators(); _x.at(j).get('LineRadarDatasetsBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBackgroundColor')?.disable(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.disable(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.updateValueAndValidity();
      }
      else if (_chartType == 'line') {
        _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.enable(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.setValidators([Validators.required]); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.updateValueAndValidity();
        _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.enable(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.setValidators([Validators.required]); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsFill')?.enable(); _x.at(j).get('LineDatasetsFill')?.setValidators([Validators.required]); _x.at(j).get('LineDatasetsFill')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsBorderDash')?.enable(); _x.at(j).get('LineDatasetsBorderDash')?.setValidators([Validators.required]); _x.at(j).get('LineDatasetsBorderDash')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsTension')?.enable(); _x.at(j).get('LineDatasetsTension')?.setValidators([Validators.required]); _x.at(j).get('LineDatasetsTension')?.updateValueAndValidity();
        _x.at(j).get('LineRadarDatasetsBorderColor')?.enable(); _x.at(j).get('LineRadarDatasetsBorderColor')?.setValidators([Validators.required]); _x.at(j).get('LineRadarDatasetsBorderColor')?.updateValueAndValidity();

        _x.at(j).get('RadarDatasetsPointBackgroundColor')?.disable(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.disable(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.updateValueAndValidity();
      }
      else if (_chartType == 'pie') {
        _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.disable(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.clearValidators(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.updateValueAndValidity();
        _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.disable(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.clearValidators(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsFill')?.disable(); _x.at(j).get('LineDatasetsFill')?.clearValidators(); _x.at(j).get('LineDatasetsFill')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsBorderDash')?.disable(); _x.at(j).get('LineDatasetsBorderDash')?.clearValidators(); _x.at(j).get('LineDatasetsBorderDash')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsTension')?.disable(); _x.at(j).get('LineDatasetsTension')?.clearValidators(); _x.at(j).get('LineDatasetsTension')?.updateValueAndValidity();
        _x.at(j).get('LineRadarDatasetsBorderColor')?.disable(); _x.at(j).get('LineRadarDatasetsBorderColor')?.clearValidators(); _x.at(j).get('LineRadarDatasetsBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBackgroundColor')?.disable(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.disable(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.updateValueAndValidity();
      }
      else if (_chartType == 'doughnut') {
        _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.disable(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.clearValidators(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.updateValueAndValidity();
        _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.disable(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.clearValidators(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsFill')?.disable(); _x.at(j).get('LineDatasetsFill')?.clearValidators(); _x.at(j).get('LineDatasetsFill')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsBorderDash')?.disable(); _x.at(j).get('LineDatasetsBorderDash')?.clearValidators(); _x.at(j).get('LineDatasetsBorderDash')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsTension')?.disable(); _x.at(j).get('LineDatasetsTension')?.clearValidators(); _x.at(j).get('LineDatasetsTension')?.updateValueAndValidity();
        _x.at(j).get('LineRadarDatasetsBorderColor')?.disable(); _x.at(j).get('LineRadarDatasetsBorderColor')?.clearValidators(); _x.at(j).get('LineRadarDatasetsBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBackgroundColor')?.disable(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.disable(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.updateValueAndValidity();
      }
      else if (_chartType == 'radar') {
        _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.enable(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.setValidators([Validators.required]); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.updateValueAndValidity();
        _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.enable(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.setValidators([Validators.required]); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.updateValueAndValidity()
        _x.at(j).get('LineRadarDatasetsBorderColor')?.enable(); _x.at(j).get('LineRadarDatasetsBorderColor')?.setValidators([Validators.required]); _x.at(j).get('LineRadarDatasetsBorderColor')?.updateValueAndValidity()
        _x.at(j).get('RadarDatasetsPointBackgroundColor')?.enable(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.setValidators([Validators.required]); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.updateValueAndValidity()
        _x.at(j).get('RadarDatasetsPointBorderColor')?.enable(); _x.at(j).get('RadarDatasetsPointBorderColor')?.setValidators([Validators.required]); _x.at(j).get('RadarDatasetsPointBorderColor')?.updateValueAndValidity()
        _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.enable(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.setValidators([Validators.required]); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.updateValueAndValidity()
        _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.enable(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.setValidators([Validators.required]); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.updateValueAndValidity()

        _x.at(j).get('LineDatasetsFill')?.disable(); _x.at(j).get('LineDatasetsFill')?.clearValidators(); _x.at(j).get('LineDatasetsFill')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsBorderDash')?.disable(); _x.at(j).get('LineDatasetsBorderDash')?.clearValidators(); _x.at(j).get('LineDatasetsBorderDash')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsTension')?.disable(); _x.at(j).get('LineDatasetsTension')?.clearValidators(); _x.at(j).get('LineDatasetsTension')?.updateValueAndValidity();


      }
      else if (_chartType == 'polarArea') {
        _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.enable(); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.setValidators([Validators.required]); _x.at(j).get('LineBarRadarPolarDatasetsLabel')?.updateValueAndValidity();

        _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.disable(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.clearValidators(); _x.at(j).get('LineBarRadarDatasetsBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsFill')?.disable(); _x.at(j).get('LineDatasetsFill')?.clearValidators(); _x.at(j).get('LineDatasetsFill')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsBorderDash')?.disable(); _x.at(j).get('LineDatasetsBorderDash')?.clearValidators(); _x.at(j).get('LineDatasetsBorderDash')?.updateValueAndValidity();
        _x.at(j).get('LineDatasetsTension')?.disable(); _x.at(j).get('LineDatasetsTension')?.clearValidators(); _x.at(j).get('LineDatasetsTension')?.updateValueAndValidity();
        _x.at(j).get('LineRadarDatasetsBorderColor')?.disable(); _x.at(j).get('LineRadarDatasetsBorderColor')?.clearValidators(); _x.at(j).get('LineRadarDatasetsBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBackgroundColor')?.disable(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointBorderColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.disable(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.clearValidators(); _x.at(j).get('RadarDatsetsPointHoverBackgroundColor')?.updateValueAndValidity();
        _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.disable(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.clearValidators(); _x.at(j).get('RadarDatasetsPointHoverBorderColor')?.updateValueAndValidity();
      }
    }
  }

  getDatasetKeys(data: any) {
    this.datasetKeys = Object.keys(data);

  }

  parseJson(strData: any): any {

    return JSON.parse(strData);
  }

  //#region Generate Charts

  CreateChart(chartNumber: number) {
    var chartInfo = this.ChartInfo.at(chartNumber) as FormArray;
    var chartType = chartInfo.get('ChartType')?.value;
    if (chartType == '' || chartType == null) {
      window.alert('Please select a chart type');
    }
    else if (chartType == 'bar') {
      this.BuildBarData(chartInfo.value, chartNumber)
      this.BuildBarOptions(chartInfo.value, chartNumber)
    }
    else if (chartType == 'line') {
      this.BuildLineData(chartInfo.value, chartNumber)
      this.BuildLineOptions(chartInfo.value, chartNumber)
    }
    else if (chartType == 'radar') {
      this.BuildRadarData(chartInfo.value, chartNumber)
      this.BuildRadarOptions(chartInfo.value, chartNumber)
    }
    else if (chartType == 'polarArea') {
      this.BuildPolarAreaData(chartInfo.value, chartNumber)
      this.BuildPolarAreaOptions(chartInfo.value, chartNumber)
    }
    else if (chartType == 'doughnut') {
      this.BuildDoughnutData(chartInfo.value, chartNumber)
      this.BuildDoughnutOptions(chartInfo.value, chartNumber)
    }
    else if (chartType == 'pie') {
      this.BuildPieData(chartInfo.value, chartNumber)
      this.BuildPieOptions(chartInfo.value, chartNumber)
    }
  }

  BuildBarData(chartInfo: any, chartNumber: number) {
    var _barData: any
    var xandyaxisarraydata = this.GetXAndYAxisArray(chartInfo)

    var _datasets: any = [];
    chartInfo.ChartYAxisInfo.forEach((element: any, i: number) => {
      _datasets.push({
        label: element.LineBarRadarPolarDatasetsLabel,
        backgroundColor: element.LineBarRadarDatasetsBackgroundColor,
        data: xandyaxisarraydata.tmpdatasetsData[i]
      })
    })
    _barData = {
      labels: xandyaxisarraydata.tmpLabel,
      datasets: _datasets
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartData')?.setValue(JSON.stringify(_barData));
  }
  BuildBarOptions(chartInfo: any, chartNumber: number) {
    var _barOptions: any;
    _barOptions = {
      indexAxis: chartInfo.BarOptionsIndexAxis,
      plugins: {
        title: {
          display: chartInfo.OptionsPluginsTitleDisplay,
          text: chartInfo.OptionsPluginsTitleText,
          color: chartInfo.OptionsPluginsTitleColor,
          position: chartInfo.OptionsPluginsTitlePosition,
          align: chartInfo.OptionsPluginsTitleAlign,
          font: {
            size: chartInfo.OptionsPluginsTitleFontSize,
            style: chartInfo.OptionsPluginsTitleFontStyle,
            weight: chartInfo.OptionsPluginsTitleFontWeight,
          },
          padding: {
            top: chartInfo.OptionsPluginsTitlePaddingTop,
            bottom: chartInfo.OptionsPluginsTitlePaddingBottom
          }
        },
        subtitle: {
          display: chartInfo.OptionsPluginsSubtitleDisplay,
          text: chartInfo.OptionsPluginsSubtitleText,
          color: chartInfo.OptionsPluginsSubtitleColor,
          position: chartInfo.OptionsPluginsSubtitlePosition,
          align: chartInfo.OptionsPluginsSubtitleAlign,
          font: {
            size: chartInfo.OptionsPluginsSubtitleFontSize,
            style: chartInfo.OptionsPluginsSubtitleFontStyle,
            weight: chartInfo.OptionsPluginsSubtitleFontWeight,
          },
          padding: {
            top: chartInfo.OptionsPluginsSubtitlePaddingTop,
            bottom: chartInfo.OptionsPluginsSubtitlePaddingBottom
          }
        },
        tooltips: {
          mode: chartInfo.OptionsPluginsTooltipsMode,
          intersect: chartInfo.OptionsPluginsTooltipsIntersect
        },
        legend: {
          labels: {
            color: chartInfo.OptionsPluginsLegendLabelsColor
          }
        }
      },
      scales: {
        x: {
          stacked: chartInfo.BarOptionsScalesXYStacked,
          title: {
            color: chartInfo.BarLineOptionsScalesXYTitleColor,
            display: chartInfo.BarLineOptionsScalesXYTitleDisplay,
            text: chartInfo.BarLineOptionsScalesXTitleText,
            font: {
              size: chartInfo.BarLineOptionsScalesXYTitleFontSize,
              style: chartInfo.BarLineOptionsScalesXYTitleFontStyle,
              weight: chartInfo.BarLineOptionsScalesXYTitleFontWeight,
            }
          },
          ticks: {
            color: chartInfo.BarLineOptionsScalesXYTicksColor
          },
          grid: {
            color: chartInfo.BarLineOptionsScalesXYGridColor
          }
        },
        y: {
          stacked: chartInfo.BarOptionsScalesXYStacked,
          title: {
            color: chartInfo.BarLineOptionsScalesXYTitleColor,
            display: chartInfo.BarLineOptionsScalesXYTitleDisplay,
            text: chartInfo.BarLineOptionsScalesYTitleText,
            font: {
              size: chartInfo.BarLineOptionsScalesXYTitleFontSize,
              style: chartInfo.BarLineOptionsScalesXYTitleFontStyle,
              weight: chartInfo.BarLineOptionsScalesXYTitleFontWeight,
            }
          },
          ticks: {
            color: chartInfo.BarLineOptionsScalesXYTicksColor
          },
          grid: {
            color: chartInfo.BarLineOptionsScalesXYGridColor
          }
        }
      }
    };
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartOptions')?.setValue(JSON.stringify(_barOptions));
  }
  BuildLineData(chartInfo: any, chartNumber: number) {
    var _lineData: any
    var xandyaxisarraydata = this.GetXAndYAxisArray(chartInfo)
    var _datasets: any = [];
    chartInfo.ChartYAxisInfo.forEach((element: any, i: number) => {
      _datasets.push({
        label: element.LineBarRadarPolarDatasetsLabel,
        data: xandyaxisarraydata.tmpdatasetsData[i],
        fill: element.LineDatasetsFill,
        borderDash: [0, 0],
        tension: element.LineDatasetsTension,
        borderColor: element.LineRadarDatasetsBorderColor,
        backgroundColor: element.LineBarRadarDatasetsBackgroundColor,
      })
    })
    _lineData = {
      labels: xandyaxisarraydata.tmpLabel,
      datasets: _datasets
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartData')?.setValue(JSON.stringify(_lineData));
  }
  BuildLineOptions(chartInfo: any, chartNumber: number) {
    var _lineOptions: any;
    _lineOptions = {
      plugins: {
        title: {
          display: chartInfo.OptionsPluginsTitleDisplay,
          text: chartInfo.OptionsPluginsTitleText,
          color: chartInfo.OptionsPluginsTitleColor,
          position: chartInfo.OptionsPluginsTitlePosition,
          align: chartInfo.OptionsPluginsTitleAlign,
          font: {
            size: chartInfo.OptionsPluginsTitleFontSize,
            style: chartInfo.OptionsPluginsTitleFontStyle,
            weight: chartInfo.OptionsPluginsTitleFontWeight,
          },
          padding: {
            top: chartInfo.OptionsPluginsTitlePaddingTop,
            bottom: chartInfo.OptionsPluginsTitlePaddingBottom
          }
        },
        subtitle: {
          display: chartInfo.OptionsPluginsSubtitleDisplay,
          text: chartInfo.OptionsPluginsSubtitleText,
          color: chartInfo.OptionsPluginsSubtitleColor,
          position: chartInfo.OptionsPluginsSubtitlePosition,
          align: chartInfo.OptionsPluginsSubtitleAlign,
          font: {
            size: chartInfo.OptionsPluginsSubtitleFontSize,
            style: chartInfo.OptionsPluginsSubtitleFontStyle,
            weight: chartInfo.OptionsPluginsSubtitleFontWeight,
          },
          padding: {
            top: chartInfo.OptionsPluginsSubtitlePaddingTop,
            bottom: chartInfo.OptionsPluginsSubtitlePaddingBottom
          }
        },
        tooltips: {
          mode: chartInfo.OptionsPluginsTooltipsMode,
          intersect: chartInfo.OptionsPluginsTooltipsIntersect
        },
        legend: {
          labels: {
            color: chartInfo.OptionsPluginsLegendLabelsColor
          }
        }
      },
      scales: {
        x: {
          title: {
            color: chartInfo.BarLineOptionsScalesXYTitleColor,
            display: chartInfo.BarLineOptionsScalesXYTitleDisplay,
            text: chartInfo.BarLineOptionsScalesXTitleText,
            font: {
              size: chartInfo.BarLineOptionsScalesXYTitleFontSize,
              style: chartInfo.BarLineOptionsScalesXYTitleFontStyle,
              weight: chartInfo.BarLineOptionsScalesXYTitleFontWeight,
            }
          },
          ticks: {
            color: chartInfo.BarLineOptionsScalesXYTicksColor
          },
          grid: {
            color: chartInfo.BarLineOptionsScalesXYGridColor
          }
        },
        y: {
          title: {
            color: chartInfo.BarLineOptionsScalesXYTitleColor,
            display: chartInfo.BarLineOptionsScalesXYTitleDisplay,
            text: chartInfo.BarLineOptionsScalesYTitleText,
            font: {
              size: chartInfo.BarLineOptionsScalesXYTitleFontSize,
              style: chartInfo.BarLineOptionsScalesXYTitleFontStyle,
              weight: chartInfo.BarLineOptionsScalesXYTitleFontWeight,
            }
          },
          ticks: {
            color: chartInfo.BarLineOptionsScalesXYTicksColor
          },
          grid: {
            color: chartInfo.BarLineOptionsScalesXYGridColor
          }
        }
      }
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartOptions')?.setValue(JSON.stringify(_lineOptions));
  }
  BuildRadarData(chartInfo: any, chartNumber: number) {
    var _radarData: any
    var xandyaxisarraydata = this.GetXAndYAxisArray(chartInfo)
    var _datasets: any = [];
    chartInfo.ChartYAxisInfo.forEach((element: any, i: number) => {
      _datasets.push({
        label: element.LineBarRadarPolarDatasetsLabel,
        data: xandyaxisarraydata.tmpdatasetsData[i],
        backgroundColor: element.LineBarRadarDatasetsBackgroundColor,
        borderColor: element.LineRadarDatasetsBorderColor,
        pointBackgroundColor: element.RadarDatasetsPointBackgroundColor,
        pointBorderColor: element.RadarDatasetsPointBorderColor,
        pointHoverBackgroundColor: element.RadarDatsetsPointHoverBackgroundColor,
        pointHoverBorderColor: element.RadarDatasetsPointHoverBorderColor
      })
    })
    _radarData = {
      labels: xandyaxisarraydata.tmpLabel,
      datasets: _datasets
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartData')?.setValue(JSON.stringify(_radarData));
  }
  BuildRadarOptions(chartInfo: any, chartNumber: number) {
    var _radarOptions: any;
    _radarOptions = {
      plugins: {
        title: {
          display: chartInfo.OptionsPluginsTitleDisplay,
          text: chartInfo.OptionsPluginsTitleText,
          color: chartInfo.OptionsPluginsTitleColor,
          position: chartInfo.OptionsPluginsTitlePosition,
          align: chartInfo.OptionsPluginsTitleAlign,
          font: {
            size: chartInfo.OptionsPluginsTitleFontSize,
            style: chartInfo.OptionsPluginsTitleFontStyle,
            weight: chartInfo.OptionsPluginsTitleFontWeight
          },
          padding: {
            top: chartInfo.OptionsPluginsTitlePaddingTop,
            bottom: chartInfo.OptionsPluginsTitlePaddingBottom
          }
        },
        subtitle: {
          display: chartInfo.OptionsPluginsSubtitleDisplay,
          text: chartInfo.OptionsPluginsSubtitleText,
          color: chartInfo.OptionsPluginsSubtitleColor,
          position: chartInfo.OptionsPluginsSubtitlePosition,
          align: chartInfo.OptionsPluginsSubtitleAlign,
          font: {
            size: chartInfo.OptionsPluginsSubtitleFontSize,
            style: chartInfo.OptionsPluginsSubtitleFontStyle,
            weight: chartInfo.OptionsPluginsSubtitleFontWeight,
          },
          padding: {
            top: chartInfo.OptionsPluginsSubtitlePaddingTop,
            bottom: chartInfo.OptionsPluginsSubtitlePaddingBottom
          }
        },
        tooltips: {
          mode: chartInfo.OptionsPluginsTooltipsMode,
          intersect: chartInfo.OptionsPluginsTooltipsIntersect
        },
        legend: {
          labels: {
            color: chartInfo.OptionsPluginsLegendLabelsColor
          }
        }
      },
      scales: {
        r: {
          pointLabels: {
            color: chartInfo.RadarOptionsScalesRPointlabelsColor
          },
          grid: {
            color: chartInfo.RadarPolarareaOptionsScalesRGridColor
          },
          angleLines: {
            color: chartInfo.RadarOptionsScalesRAnglelinesColor
          }
        }
      }
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartOptions')?.setValue(JSON.stringify(_radarOptions));
  }
  BuildPolarAreaData(chartInfo: any, chartNumber: number) {
    var _polarAreaData: any
    var xandyaxisarraydata = this.GetXAndYAxisArray(chartInfo)
    var _datasets: any = [];
    chartInfo.ChartYAxisInfo.forEach((element: any, i: number) => {
      var _backgroundColor: any = [];
      xandyaxisarraydata.tmpdatasetsData[i].forEach((element: any, i: number) => {
        _backgroundColor.push('#' + Math.floor(Math.random() * 16777215).toString(16))
      })
      _datasets.push({
        data: xandyaxisarraydata.tmpdatasetsData[i],
        backgroundColor: _backgroundColor,
        label: element.LineBarRadarPolarDatasetsLabel,
      })
    })
    _polarAreaData = {
      labels: xandyaxisarraydata.tmpLabel,
      datasets: _datasets
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartData')?.setValue(JSON.stringify(_polarAreaData));
  }
  BuildPolarAreaOptions(chartInfo: any, chartNumber: number) {
    var _polarAreaOptions: any
    _polarAreaOptions = {
      plugins: {
        title: {
          display: chartInfo.OptionsPluginsTitleDisplay,
          text: chartInfo.OptionsPluginsTitleText,
          color: chartInfo.OptionsPluginsTitleColor,
          position: chartInfo.OptionsPluginsTitlePosition,
          align: chartInfo.OptionsPluginsTitleAlign,
          font: {
            size: chartInfo.OptionsPluginsTitleFontSize,
            style: chartInfo.OptionsPluginsTitleFontStyle,
            weight: chartInfo.OptionsPluginsTitleFontWeight
          },
          padding: {
            top: chartInfo.OptionsPluginsTitlePaddingTop,
            bottom: chartInfo.OptionsPluginsTitlePaddingBottom
          }
        },
        subtitle: {
          display: chartInfo.OptionsPluginsSubtitleDisplay,
          text: chartInfo.OptionsPluginsSubtitleText,
          color: chartInfo.OptionsPluginsSubtitleColor,
          position: chartInfo.OptionsPluginsSubtitlePosition,
          align: chartInfo.OptionsPluginsSubtitleAlign,
          font: {
            size: chartInfo.OptionsPluginsSubtitleFontSize,
            style: chartInfo.OptionsPluginsSubtitleFontStyle,
            weight: chartInfo.OptionsPluginsSubtitleFontWeight,
          },
          padding: {
            top: chartInfo.OptionsPluginsSubtitlePaddingTop,
            bottom: chartInfo.OptionsPluginsSubtitlePaddingBottom
          }
        },
        tooltips: {
          mode: chartInfo.OptionsPluginsTooltipsMode,
          intersect: chartInfo.OptionsPluginsTooltipsIntersect
        },
        legend: {
          labels: {
            color: chartInfo.OptionsPluginsLegendLabelsColor
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: chartInfo.RadarPolarareaOptionsScalesRGridColor
          }
        }
      }
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartOptions')?.setValue(JSON.stringify(_polarAreaOptions));
  }
  BuildDoughnutData(chartInfo: any, chartNumber: number) {
    var _doughnutData: any
    var xandyaxisarraydata = this.GetXAndYAxisArray(chartInfo)
    var _datasets: any = [];
    chartInfo.ChartYAxisInfo.forEach((element: any, i: number) => {
      var _backgroundColor: any = [];
      xandyaxisarraydata.tmpdatasetsData[i].forEach((element: any, j: number) => {
        _backgroundColor.push('#' + Math.floor(Math.random() * 16777215).toString(16))
      })
      _datasets.push({
        data: xandyaxisarraydata.tmpdatasetsData[i],
        backgroundColor: _backgroundColor,
        hoverBackgroundColor: _backgroundColor
      })
    })
    _doughnutData = {
      labels: xandyaxisarraydata.tmpLabel,
      datasets: _datasets
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartData')?.setValue(JSON.stringify(_doughnutData));
  }
  BuildDoughnutOptions(chartInfo: any, chartNumber: number) {
    var _doughnutOptions: any
    _doughnutOptions = {
      plugins: {
        title: {
          display: chartInfo.OptionsPluginsTitleDisplay,
          text: chartInfo.OptionsPluginsTitleText,
          color: chartInfo.OptionsPluginsTitleColor,
          position: chartInfo.OptionsPluginsTitlePosition,
          align: chartInfo.OptionsPluginsTitleAlign,
          font: {
            size: chartInfo.OptionsPluginsTitleFontSize,
            style: chartInfo.OptionsPluginsTitleFontStyle,
            weight: chartInfo.OptionsPluginsTitleFontWeight
          },
          padding: {
            top: chartInfo.OptionsPluginsTitlePaddingTop,
            bottom: chartInfo.OptionsPluginsTitlePaddingBottom
          }
        },
        subtitle: {
          display: chartInfo.OptionsPluginsSubtitleDisplay,
          text: chartInfo.OptionsPluginsSubtitleText,
          color: chartInfo.OptionsPluginsSubtitleColor,
          position: chartInfo.OptionsPluginsSubtitlePosition,
          align: chartInfo.OptionsPluginsSubtitleAlign,
          font: {
            size: chartInfo.OptionsPluginsSubtitleFontSize,
            style: chartInfo.OptionsPluginsSubtitleFontStyle,
            weight: chartInfo.OptionsPluginsSubtitleFontWeight,
          },
          padding: {
            top: chartInfo.OptionsPluginsSubtitlePaddingTop,
            bottom: chartInfo.OptionsPluginsSubtitlePaddingBottom
          }
        },
        tooltips: {
          mode: chartInfo.OptionsPluginsTooltipsMode,
          intersect: chartInfo.OptionsPluginsTooltipsIntersect
        },
        legend: {
          labels: {
            color: chartInfo.OptionsPluginsLegendLabelsColor
          }
        }
      }
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartOptions')?.setValue(JSON.stringify(_doughnutOptions));
  }
  BuildPieData(chartInfo: any, chartNumber: number) {
    var _pieData: any
    var xandyaxisarraydata = this.GetXAndYAxisArray(chartInfo)
    var _datasets: any = [];
    chartInfo.ChartYAxisInfo.forEach((element: any, i: number) => {
      var _backgroundColor: any = [];
      xandyaxisarraydata.tmpdatasetsData[i].forEach((element: any, j: number) => {
        _backgroundColor.push('#' + Math.floor(Math.random() * 16777215).toString(16))
      })
      _datasets.push({
        data: xandyaxisarraydata.tmpdatasetsData[i],
        backgroundColor: _backgroundColor,
        hoverBackgroundColor: _backgroundColor
      })
    })
    _pieData = {
      labels: xandyaxisarraydata.tmpLabel,
      datasets: _datasets
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartData')?.setValue(JSON.stringify(_pieData));
  }
  BuildPieOptions(chartInfo: any, chartNumber: number) {
    var _pieOptions: any
    _pieOptions = {
      plugins: {
        title: {
          display: chartInfo.OptionsPluginsTitleDisplay,
          text: chartInfo.OptionsPluginsTitleText,
          color: chartInfo.OptionsPluginsTitleColor,
          position: chartInfo.OptionsPluginsTitlePosition,
          align: chartInfo.OptionsPluginsTitleAlign,
          font: {
            size: chartInfo.OptionsPluginsTitleFontSize,
            style: chartInfo.OptionsPluginsTitleFontStyle,
            weight: chartInfo.OptionsPluginsTitleFontWeight
          },
          padding: {
            top: chartInfo.OptionsPluginsTitlePaddingTop,
            bottom: chartInfo.OptionsPluginsTitlePaddingBottom
          }
        },
        subtitle: {
          display: chartInfo.OptionsPluginsSubtitleDisplay,
          text: chartInfo.OptionsPluginsSubtitleText,
          color: chartInfo.OptionsPluginsSubtitleColor,
          position: chartInfo.OptionsPluginsSubtitlePosition,
          align: chartInfo.OptionsPluginsSubtitleAlign,
          font: {
            size: chartInfo.OptionsPluginsSubtitleFontSize,
            style: chartInfo.OptionsPluginsSubtitleFontStyle,
            weight: chartInfo.OptionsPluginsSubtitleFontWeight,
          },
          padding: {
            top: chartInfo.OptionsPluginsSubtitlePaddingTop,
            bottom: chartInfo.OptionsPluginsSubtitlePaddingBottom
          }
        },
        tooltips: {
          mode: chartInfo.OptionsPluginsTooltipsMode,
          intersect: chartInfo.OptionsPluginsTooltipsIntersect
        },
        legend: {
          labels: {
            color: chartInfo.OptionsPluginsLegendLabelsColor
          }
        }
      }
    }
    var _chartInfo = this.ChartInfo.at(chartNumber) as FormArray
    _chartInfo.get('FinalChartOptions')?.setValue(JSON.stringify(_pieOptions));
  }
  //#endregion

  //#region Math Functions
  Count(number_array: any[]) {
    let count = 0;
    for (let i = 0; i < number_array.length; i++) {
      count += number_array[i];
    }
    return count;
  }
  Sum(number_array: any[]) {
    return number_array.reduce((a, b) => a + b, 0);
  }
  Average(number_array: any[]) {
    return this.Sum(number_array) / number_array.length;
  }
  Minimum(number_array: any[]) {
    return Math.min(...number_array);
  }
  Maximum(number_array: any[]) {
    return Math.max(...number_array);
  }
  //#endregion

  GetXAndYAxisArray(chartInfo: any) {
    let x_axis_array: any = [];
    let y_axis_array: any = [];

    let datasetsData: any[] = []
    let labels = []


    var x_axis_object = [...new Map(this.resultData.map(item => [item[chartInfo.ChartXAxis], item])).values()];
    x_axis_array = x_axis_object.map(x => x[chartInfo.ChartXAxis])
    labels = x_axis_array;

    chartInfo.ChartYAxisInfo.forEach((element: any, i: number) => {
      y_axis_array = [];
      var _ChartYAxisFunction = element.ChartYAxisFunction;
      x_axis_array.forEach((x_axis_value: any, index: number) => {
        var filteredResultData = this.resultData.filter(x => x[chartInfo.ChartXAxis] == x_axis_value).map(x => x[element.ChartYAxis])
        if (_ChartYAxisFunction = "COUNT") {
          y_axis_array.push(this.Count(filteredResultData));
        }
        else if (_ChartYAxisFunction = "SUM") {
          y_axis_array.push(this.Sum(filteredResultData));
        }
        else if (_ChartYAxisFunction = "AVG") {
          y_axis_array.push(this.Average(filteredResultData));
        }
        else if (_ChartYAxisFunction = "MIN") {
          y_axis_array.push(this.Minimum(filteredResultData));
        }
        else if (_ChartYAxisFunction = "MAX") {
          y_axis_array.push(this.Maximum(filteredResultData));
        }
      })
      datasetsData.push(y_axis_array)
    })
    var _tempArray: any[] = [];
    _tempArray.push(labels)
    datasetsData.forEach(element => {
      _tempArray.push(element)
    });
    var modifiesdArry = this.SortArray(_tempArray, chartInfo.ChartXAxisOrder)

    var tmpLabel = modifiesdArry[0]
    var tmpdatasetsData: any[] = []

    for (let i = 1; i < modifiesdArry.length; i++) {
      tmpdatasetsData.push(modifiesdArry[i])
    }

    return { tmpLabel, tmpdatasetsData };
  }

  downloadChart(chartid: string, chartName: string) {
    html2canvas(<HTMLElement>document.getElementById(chartid), {
      allowTaint: true,
      useCORS: true,
    })
      .then(function (canvas) {
        let image = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
        var link = document.createElement('a');
        link.download = chartName + ".png";
        link.href = image;
        link.click();
      })
      .catch((e) => {

      });
  }

  copyChartToClipboard(chartid: string, chartName: string) {
    html2canvas(<HTMLElement>document.getElementById(chartid), {
      allowTaint: true,
      useCORS: true,
    })
      .then((canvas) => {
        canvas.toBlob((blob: any) => {
          if (blob) {
            const clipboardItemInput = new ClipboardItem({ "image/png": blob });
            (navigator.clipboard as any).write([clipboardItemInput]);
          }
        })
        this.toastr.success("Image copied to clipboard", 'Success', { positionClass: 'toast-bottom-right' });
      })
      .catch((e) => {
        this.toastr.error("Error in copying image to clipboard", 'Error', { positionClass: 'toast-bottom-right' });
      });
  }

  minimizeChart(chartId: number, chartName: string, minimize: boolean) {
    if (minimize) {
      this.minimizedChartLists.push({
        chartId: chartId,
        chartName: chartName,
        minimized: minimize
      })
    }
    else {
      var x = this.minimizedChartLists.find(x => x.chartId == chartId);
      this.minimizedChartLists.splice(this.minimizedChartLists.indexOf(x), 1);
    }
  }

  minimizeResultset(resultsetId: number, resultsetName: string, minimize: boolean) {
    if (minimize) {
      this.minimizedResultset.push({
        resultsetId: resultsetId,
        resultsetName: resultsetName,
        minimized: minimize
      })
    }
    else {
      var x = this.minimizedResultset.find(x => x.resultsetId == resultsetId);
      this.minimizedResultset.splice(this.minimizedResultset.indexOf(x), 1);
    }
  }

  isChartMaximised(chartId: number) {
    var x = this.minimizedChartLists.find(x => x.chartId == chartId);
    if (x == undefined) {
      return true
    }
    else {
      return false;
    }
  }

  isResultsetMaximised(resultsetId: number) {
    var x = this.minimizedResultset.find(x => x.resultsetId == resultsetId);
    if (x == undefined) {
      return true
    }
    else {
      return false;
    }
  }

  downloadChartData(chartNumber: number, chartName: string) {
    var csvHeaders: any[] = [];

    var fullChartInfo = this.ChartInfo.at(chartNumber) as FormArray
    csvHeaders.push(fullChartInfo.get('ChartXAxis')?.value)

    fullChartInfo.get('ChartYAxisInfo')?.value.forEach((element: any) => {
      csvHeaders.push(element.ChartYAxis + "(" + element.ChartYAxisFunction + ")")
    });

    // get the labels and datasets data
    var finalParsedChartData = JSON.parse(fullChartInfo.get('FinalChartData')?.value)
    var labels: any[] = finalParsedChartData.labels
    var datasets: any[] = finalParsedChartData.datasets

    // push the labels and datatset datas to ana array
    var arrayOfLabelsAndData: any[] = [];
    arrayOfLabelsAndData.push(labels)
    datasets.forEach((element: any) => {
      arrayOfLabelsAndData.push(element.data)
    });

    var chartDataToDownload = arrayOfLabelsAndData[0].map((_: any, colIndex: string | number) => arrayOfLabelsAndData.map(row => row[colIndex]));

    var options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: chartName,
      useBom: true,
      noDownload: false,
      headers: csvHeaders,
    };

    new ngxCsv(chartDataToDownload, chartName, options);
  }

  SortArray(arrayToSort: any[], sortBy: string) {
    var transposedArray = arrayToSort[0].map((_: any, colIndex: string | number) => arrayToSort.map(row => row[colIndex]));
    transposedArray.sort((a: any, b: any) => {
      if (moment(a[0]).isValid() && moment(b[0]).isValid()) {
        return sortBy == 'ASC' ? Date.parse(a[0]) - Date.parse(b[0]) : Date.parse(b[0]) - Date.parse(a[0]);
      }
      else if (a[0] instanceof String || typeof a[0] == 'string' || isNaN(a[0])) {
        return sortBy == "ASC" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]);
      }
      else if (a[0] instanceof Number || typeof a[0] == 'number' || !isNaN(a[0])) {
        return sortBy == 'ASC' ? a[0] - b[0] : b[0] - a[0]
      }

      // return (sortBy == 'ASC' ? Date.parse(a[0]) - Date.parse(b[0]) : Date.parse(b[0]) - Date.parse(a[0])) || (sortBy[1] == 'ASC' ? a[1] - b[1] : b[1] - a[1]) || (sortBy[2] == 'ASC' ? a[2] - b[2] : b[2] - a[2])
    })
    return transposedArray[0].map((_: any, colIndex: string | number) => transposedArray.map((row: any) => row[colIndex]));
  }

  selectTab(tabId: number) {
    if (this.staticTabs?.tabs[tabId]) {
      this.staticTabs.tabs[tabId].active = true;
    }
  }
}
