import { ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalysisService } from 'src/app/services/auth/analysis.service';
import { BridgeManagerService } from 'src/app/services/auth/bridge-manager.service';
import { ReportsService } from 'src/app/services/auth/reports.service';
import { ConfirmationService } from 'primeng/api';
import { ChartdataService } from 'src/app/services/auth/chartdata.service';
import { MsalAuthenticationService } from 'src/app/services/msal-authentication.service';
import { ToastrService } from 'ngx-toastr';
import { SideBarService } from 'src/app/services/side-bar.service';


@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  userName!: string;
  todayDate = new Date().toISOString();

  //#region 
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

  //#endregion

  selectedWorkspace: string = '';
  selectedWorkspacedata: any;

  isSave: boolean = false;
  isSaveAs: boolean = false;

  //#region 
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
  //#endregion

  //#region For SQL on Dataset
  datasetKeys: any[] = []
  //#endregion

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
  lineDatasetsBorderDashRangeValues: number[] = [10, 20];

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

    //#region 
    this.barData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: '#42A5F5',
          data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
          label: 'My Second dataset',
          backgroundColor: '#FFA726',
          data: [28, 48, 40, 19, 86, 27, 90]
        }
      ]
    };
    this.barOptions = {
      indexAxis: 'x',
      plugins: {
        title: {
          display: true,
          text: 'Custom Chart Title',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 20,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        subtitle: {
          display: true,
          text: 'Custom Chart Subtitle',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 15,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        tooltips: {
          mode: 'index',  //point,nearest,index,dataset, x, y
          intersect: false
        },
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        x: {
          stacked: false,
          title: {
            color: 'white',
            display: true,
            text: 'X - Axis',
            font: {
              size: 20,
              style: 'normal',  // normal, italic, oblique, initial, inherit
              weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
            }
          },
          ticks: {
            color: 'white'
          },
          grid: {
            color: 'white'
          }
        },
        y: {
          stacked: false,
          title: {
            color: 'white',
            display: true,
            text: 'Y -Axis',
            font: {
              size: 20,
              style: 'normal',  // normal, italic, oblique, initial, inherit
              weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
            }
          },
          ticks: {
            color: 'white'
          },
          grid: {
            color: 'white'
          }
        }
      }
    };
    this.lineData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderDash: [0, 0],
          tension: 0,
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(255,167,38,0.2)'
        },
        {
          label: 'Second Dataset',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          borderDash: [5, 5],
          tension: .4,
          borderColor: '#66BB6A',
          backgroundColor: 'rgba(255,167,38,0.2)'
        },
        {
          label: 'Third Dataset',
          data: [12, 51, 62, 33, 21, 62, 45],
          fill: true,
          borderDash: [0, 0],
          tension: .4,
          borderColor: '#FFA726',
          backgroundColor: 'rgba(255,167,38,0.2)'
        }
      ]
    }
    this.lineOptions = {
      indexAxis: 'x',
      plugins: {
        title: {
          display: true,
          text: 'Custom Chart Title',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 20,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        subtitle: {
          display: true,
          text: 'Custom Chart Subtitle',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 15,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        tooltips: {
          mode: 'index',  //point,nearest,index,dataset, x, y
          intersect: false
        },
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        x: {
          title: {
            color: 'white',
            display: true,
            text: 'X - Axis',
            font: {
              size: 20,
              style: 'normal',  // normal, italic, oblique, initial, inherit
              weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
            }
          },
          ticks: {
            color: 'white'
          },
          grid: {
            color: 'white'
          }
        },
        y: {
          title: {
            color: 'white',
            display: true,
            text: 'Y -Axis',
            font: {
              size: 20,
              style: 'normal',  // normal, italic, oblique, initial, inherit
              weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
            }
          },
          ticks: {
            color: 'white'
          },
          grid: {
            color: 'white'
          }
        }
      }
    }
    this.pieData = {
      labels: ['A', 'B', 'C'],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: [
            "#42A5F5",
            "#66BB6A",
            "#FFA726"
          ],
          hoverBackgroundColor: [
            "#64B5F6",
            "#81C784",
            "#FFB74D"
          ]
        }
      ]
    }
    this.pieOptions = {
      plugins: {
        title: {
          display: true,
          text: 'Custom Chart Title',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 20,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        subtitle: {
          display: true,
          text: 'Custom Chart Subtitle',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 15,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        tooltips: {
          mode: 'index',  //point,nearest,index,dataset, x, y
          intersect: false
        },
        legend: {
          labels: {
            color: 'white'
          }
        }
      }
    }
    this.doughnutData = {
      labels: ['A', 'B', 'C'],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ]
        }
      ]
    }
    this.doughnutOptions = {
      plugins: {
        title: {
          display: true,
          text: 'Custom Chart Title',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 20,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        subtitle: {
          display: true,
          text: 'Custom Chart Subtitle',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 15,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        tooltips: {
          mode: 'index',  //point,nearest,index,dataset, x, y
          intersect: false
        },
        legend: {
          labels: {
            color: 'white'
          }
        }
      }
    }
    this.radarData = {
      labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: 'rgba(179,181,198,0.2)',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          data: [65, 59, 90, 81, 56, 55, 400]
        },
        {
          label: 'My Second dataset',
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          pointBackgroundColor: 'rgba(255,99,132,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255,99,132,1)',
          data: [28, 48, 40, 19, 96, 27, 100]
        }
      ]
    }
    this.radarOptions = {
      plugins: {
        title: {
          display: true,
          text: 'Custom Chart Title',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 20,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        subtitle: {
          display: true,
          text: 'Custom Chart Subtitle',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 15,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        tooltips: {
          mode: 'index',  //point,nearest,index,dataset, x, y
          intersect: false
        },
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        r: {
          pointLabels: {
            color: 'white',
          },
          grid: {
            color: 'white',
          },
          angleLines: {
            color: 'white'
          }
        }
      }
    }
    this.polarAreaData = {
      datasets: [{
        data: [
          11,
          16,
          7,
          3,
          14
        ],
        backgroundColor: [
          "#42A5F5",
          "#66BB6A",
          "#FFA726",
          "#26C6DA",
          "#7E57C2"
        ],
        label: 'My dataset'
      }],
      labels: [
        "Red",
        "Green",
        "Yellow",
        "Grey",
        "Blue"
      ]
    }
    this.polarAreaOptions = {
      plugins: {
        title: {
          display: true,
          text: 'Custom Chart Title',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 20,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        subtitle: {
          display: true,
          text: 'Custom Chart Subtitle',
          color: 'white',
          position: 'top',  // top, bottom, left, right
          align: 'center',  //start, center, end
          font: {
            size: 15,
            style: 'normal',  // normal, italic, oblique, initial, inherit
            weight: 'bold',  // normal, bold, bolder, lighter, initial, inherit
          },
          padding: {
            top: 0,
            bottom: 0
          }
        },
        tooltips: {
          mode: 'index',  //point,nearest,index,dataset, x, y
          intersect: false
        },
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: 'white'
          }
        }
      }
    }
    //#endregion

    this.userName = this.msalAuthenticationService.userName();
    this.GetSqlConnectionStrings()
    this.GetAllCustomQuery()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sideBarService.toggleSideNav()
    })

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

      ChartName1: [''],
      ChartName2: [''],
      ChartName3: [''],
      ChartName4: [''],
      xAxis1: [''],
      xAxis2: [''],
      xAxis3: [''],
      xAxis4: [''],
      yAxis1: [''],
      yAxis2: [''],
      yAxis3: [''],
      yAxis4: [''],
      ChartType1: [''],
      ChartType2: [''],
      ChartType3: [''],
      ChartType4: [''],

      AddedBy: this.userName,
      AddedDate: this.todayDate,
      UpdatedBy: this.userName,
      UpdatedDate: this.todayDate
    });
  }

  get f() { return this.runCustomQueryform.controls; }

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
      ChartYAxisInfo: this.formBuilder.array([]),

      FinalChartData: ['', Validators.required],
      FinalChartOptions: ['', Validators.required]
    });
  }
  addChartInfo() {
    this.ChartInfo.push(this.newChartInfo());
    console.log("Chart info triggered")
  }
  removeChartInfo(i: number) {
    this.ChartInfo.removeAt(i);
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

  //#region 
  onSubmitRunCustomQuery() {
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
        this.runcustomQueryForm_loading = false
      },
      (err: any) => {
        this.error_message = err.error;
        this.isError = true;
        this.runcustomQueryForm_loading = false
      }
    );
  }

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

  GetAllCustomQuery() {
    this.reportsService.GetAllCustomQuery().subscribe(
      (res) => {
        this.allWorkSpaces = res;
        console.log(this.allWorkSpaces);
      },
      (err) => { console.log(err); }
    )
  }

  onSelectConnectionString(event: Event) {
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

  GetAllTables(connectionStringId: string) {
    this.analysisService.GetAllTables(connectionStringId).subscribe(
      (res: any) => {
        console.log(res);
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

  onSelectTable(event: Event) {
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

  buildLineChart() { }
  buildBarChart() { }
  buildPieChart() { }
  buildDoughnutChart() { }

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

  saveChartData() {
    this.saveCustomQuery_loading = true;
    this.todayDate = new Date().toISOString()
    this.runCustomQueryform.patchValue({
      AddedBy: this.userName,
      UpdatedBy: this.userName,
      AddedDate: this.todayDate,
      UpdatedDate: this.todayDate
    })
    console.log(this.runCustomQueryform.value);
    this.reportsService.SaveCustomQuery(this.runCustomQueryform.value).subscribe((res: any) => {
      console.log(res);
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
        console.log(res);
        this.SetCustomQueryDataAfterSave(res);
        this.GetAllCustomQuery();
        this.toastr.success('Successfully saved', 'Success', { positionClass: 'toast-bottom-right' })
        this.todayDate = new Date().toISOString();
        this.saveCustomQuery_loading = false;
        this.onHideSaveQueryDialog();
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
    this.selectedWorkspacedata = null;
    this.selectedWorkspace = '';
    this.databaseName = '';
    this.tables = [];
    this.externalTables = [];
    this.viewTables = [];
    var data = this.allWorkSpaces.find(x => x.customQueryId == queryId);
    console.log(data);
    this.GetAllTables(data.connectionStringId);
    this.selectedWorkspacedata = data;
    this.selectedWorkspace = data.customQueryName;


    //#region Set Table metadata
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
    //#endregion

    //#region patchValue
    this.runCustomQueryform.patchValue({
      CustomQueryId: data.customQueryId,
      ConnectionStringId: data.connectionStringId,
      TableName: data.tableName,
      CustomQueryName: data.customQueryName,
      ChartName1: data.chartName1,
      ChartName2: data.chartName2,
      ChartName3: data.chartName3,
      ChartName4: data.chartName4,
      xAxis1: data.xAxis1,
      xAxis2: data.xAxis2,
      xAxis3: data.xAxis3,
      xAxis4: data.xAxis4,
      yAxis1: data.yAxis1,
      yAxis2: data.yAxis2,
      yAxis3: data.yAxis3,
      yAxis4: data.yAxis4,
      ChartType1: data.chartType1,
      ChartType2: data.chartType2,
      ChartType3: data.chartType3,
      ChartType4: data.chartType4,
      AddedBy: data.addedBy,
      AddedDate: data.addedDate,
      UpdatedBy: data.updatedBy,
      UpdatedDate: data.updatedDate
    });

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
    data.groupby.forEach((element: any, index: number) => {
      this.addGroupBy();
      var gropuby = this.runCustomQueryform.get('GroupBy') as FormArray
      gropuby.controls[index].patchValue({
        Id: element.id,
        ColumnName: element.columnName
      })
    });
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
    data.chartinfo.forEach((element: any, index: number) => {
      this.addChartInfo();
      this.onClickChartType(index, element.chartType);
      var chartinfo = this.runCustomQueryform.get('ChartInfo') as FormArray
      chartinfo.controls[index].patchValue({
        Id: element.id,
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
        FinalChartData: element.finalChartData,
        FinalChartOptions: element.finalChartOptions,
      });
      element.chartYAxisinfo.forEach((item: any, indexY: number) => {
        this.addChartYAxisInfo(index)
        var chartYAxisInfo = this.ChartInfo.at(index).get('ChartYAxisInfo') as FormArray;
        chartYAxisInfo.controls[indexY].patchValue({
          Id: item.id,
          ChartYAxis: item.chartYAxis,
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

    this.onSubmitRunCustomQuery()
    this.onHideAllQueriesDialog();
    console.log(this.runCustomQueryform.value)
  }

  SetCustomQueryDataAfterSave(data: any) {
    this.selectedWorkspacedata = data;
    this.selectedWorkspace = data.customQueryName;
    this.GetAllTables(data.connectionStringId);

    //#region Set Table metadata
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
    //#endregion

    //#region patchValue
    this.runCustomQueryform.patchValue({
      CustomQueryId: data.customQueryId,
      ConnectionStringId: data.connectionStringId,
      TableName: data.tableName,
      CustomQueryName: data.customQueryName,
      ChartName1: data.chartName1,
      ChartName2: data.chartName2,
      ChartName3: data.chartName3,
      ChartName4: data.chartName4,
      xAxis1: data.xAxis1,
      xAxis2: data.xAxis2,
      xAxis3: data.xAxis3,
      xAxis4: data.xAxis4,
      yAxis1: data.yAxis1,
      yAxis2: data.yAxis2,
      yAxis3: data.yAxis3,
      yAxis4: data.yAxis4,
      ChartType1: data.chartType1,
      ChartType2: data.chartType2,
      ChartType3: data.chartType3,
      ChartType4: data.chartType4,
      AddedBy: data.addedBy,
      AddedDate: data.addedDate,
      UpdatedBy: data.updatedBy,
      UpdatedDate: data.updatedDate
    });
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
    data.groupby.forEach((element: any, index: number) => {
      this.addGroupBy();
      var gropuby = this.runCustomQueryform.get('GroupBy') as FormArray
      gropuby.controls[index].patchValue({
        Id: element.id,
        ColumnName: element.columnName
      })
    });
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
    data.chartinfo.forEach((element: any, index: number) => {
      this.addChartInfo();
      this.onClickChartType(index, element.chartType);
      var chartinfo = this.runCustomQueryform.get('ChartInfo') as FormArray
      chartinfo.controls[index].patchValue({
        Id: element.id,
        ChartName: element.chartName,
        ChartType: element.chartType,
        OptionsPluginsTitleDisplay: element.optionsPluginsTitleDisplay,
        OptionsPluginsTitleText: element.optionsPluginsTitleText,
        OptionsPluginsTitleColor: element.optionsPluginsTitleColor,
        OptionsPluginsTitlePosition: element.optionsPluginsTitlePosition,
        OptionsPluginsTitleAlign: element.optionsPluginsTitleAlign,
        OptionsPluginsTitleFontSize: element.optionsPluginsTitleFontSize,
        OptionsPluginsTitleFontStyle: element.optionsPluginsTitleFontStyle,
        OptionsPluginsTitleFontWeight: element.OptionsPluginsTitleFontWeight,
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
        FinalChartData: element.finalChartData,
        FinalChartOptions: element.finalChartOptions,

        // need more code for ChartYAxisInfo
      });
    });

    //#endregion
    this.onSubmitRunCustomQuery()
    this.onHideAllQueriesDialog();
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

  onSelectChartType(i: number, event: Event) {
    // var x = JSON.parse((<HTMLInputElement>event.target).value);
    var chartType = (<HTMLInputElement>event.target).value
    var chartInfo = this.runCustomQueryform.get('ChartInfo') as FormArray;

    if (chartType == null) {
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
    else if (chartType == 'bar') {
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
    else if (chartType == 'line') {
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
    else if (chartType == 'pie') {
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
    else if (chartType == 'doughnut') {
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
    else if (chartType == 'radar') {
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
    else if (chartType == 'polarArea') {
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

  onChangeChartType(i: number, event: Event) {
    // var _chartTypeObject = JSON.parse((<HTMLInputElement>event.target).value);
    var _chartType = (<HTMLInputElement>event.target).value;
    var _x = this.ChartInfo.at(i).get('ChartYAxisInfo') as FormArray;

    for (var j = 0; j < _x.length; j++) {
      if (_chartType == null) {
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
        console.log(_chartType)
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

  onClickChartType(i: number, _chartType: any) {
    // var _chartTypeObject = JSON.parse(chartTypeObject);
    // var _chartType = _chartTypeObject.chartType;
    var _x = this.ChartInfo.at(i).get('ChartYAxisInfo') as FormArray;

    for (var j = 0; j < _x.length; j++) {
      if (_chartType == null) {
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
        console.log(_chartType)
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

  testConsole() {
    console.log(this.runCustomQueryform.value);
  }

}
