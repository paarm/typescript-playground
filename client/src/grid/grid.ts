import { IGridModel, GridModel, IGridData } from './gridmodel';


export class Grid {
	modelOK: boolean;
	rowHeight: number;
	rowCount: number;
	colsCount: number;
	canvasHeight: number;
	domRows: JQuery[]=[];
	visibleRowsCount: number;
	
	constructor(private width: number, private height: number, private mParentContainer: JQuery, private mGridModel: IGridModel) {
		this.modelOK = this.checkModel();
		this.rowCount = this.mGridModel.getRowCount();
		this.colsCount = this.mGridModel.getColumnCount();
		this.createBaseList();
		this.handleRows();
	}

	get parentContainer(): JQuery {
		return this.mParentContainer;
	}
	get gridModel(): IGridModel {
		return this.mGridModel;
	}
	pg2: JQuery;
	pg2_header: JQuery;
	pg2_header_row: JQuery;
	pg2_viewport: JQuery;
	pg2_canvas: JQuery;


	checkModel(): boolean {
		var rv: boolean = true;
		if (!this.mGridModel.isHeaderColumnsDefined()) {
			rv = false;
			console.error("Grid: no headerColumns defined in model");
		} else if (!this.mGridModel.isRowsDefined()) {
			rv = false;
			console.error("Grid: no rows defined in model");
		}
		var headerColumnCount: number = this.mGridModel.getColumnCount();
		for (var i = 0, count = this.mGridModel.getColumnCount(); i < count; i++) {
			if (this.mGridModel.getRow(i).rowId == undefined || this.mGridModel.getRow(i).rowId == null) {
				console.error("Grid: grid row with rowIndex " + i + " has no rowId");
			}
			if (this.mGridModel.getRow(i).columns.length != headerColumnCount) {
				rv = false;
				console.error("Grid: Column count in grid row with rowIndex " + i + " is " + this.mGridModel.getRow(i).columns.length + " columns, but the header has a count of " + headerColumnCount + " columns");
			}
		}
		return rv;
	}

	createBaseList() {
		if (this.modelOK) {
			console.log("Header Columns count: " + this.colsCount);
			var lines: number = this.mGridModel.getRowCount();

			this.pg2 = $("<div class='pg2' style='width: 600px; height: 500px; overflow: hidden; position: relative'></div>");
			this.mParentContainer.append(this.pg2);
			this.pg2_header = $("<div class='pg2-header' style='overflow: hidden; position: relative;'></div>");
			// header
			this.pg2.append(this.pg2_header);
			this.pg2_header_row = $("<div class='pg2-header-row' style='width: 1600px;'></div>");
			this.pg2_header.append(this.pg2_header_row);
			for (var i = 0; i < this.colsCount; i++) {
				this.pg2_header_row.append("<div class='pg2-header-cell pg2-header-cell-unsorted pg2-col-" + i + "' style='width: 100px;' onclick='onColumnHeaderClicked(this," + i + ",true)'>" + this.mGridModel.getHeaderColumn(i).value + "</div>");
			}
			// body
			this.pg2_viewport = $("<div class='pg2-viewport'  onscroll='onScrollCanvas(this)' style='width: 100%; overflow: auto; position: relative; height: "+this.height+"px;'></div>");
			this.pg2.append(this.pg2_viewport);
			this.pg2_canvas = $("<div class='pg2-canvas' style='width: " + (this.colsCount * 103.6) + "px; height: 30px;'></div>");
			this.pg2_viewport.append(this.pg2_canvas);
			this.measureRow();
			this.measureCanvasHeight();
			this.measureVisibleRows();
			this.pg2_viewport.css('height: '+this.canvasHeight+'px');
		}
	}
	measureRow() {
		var dummyRow : JQuery=this.buildRow(0);
		dummyRow.css('top: -200px');
		this.pg2_canvas.append(dummyRow);
		this.rowHeight=dummyRow.outerHeight(true);
		this.pg2_canvas.remove('.pg2-row');
		this.domRows.push(dummyRow);
	}

	measureCanvasHeight() {
		this.canvasHeight=this.rowHeight*this.rowCount;
	}

	measureVisibleRows() {
		this.visibleRowsCount=this.height/this.rowHeight;
		this.visibleRowsCount=Math.ceil(this.visibleRowsCount);
	}

	handleRows() {
		for (var l = 0; l < this.rowCount; l++) {
			let row: JQuery = this.buildRow(l);
			this.pg2_canvas.append(row);
		}
	}

	buildRow(rowIndex: number): JQuery {
		var row: JQuery = $("<div class='pg2-row pg2-row-" + rowIndex + "' style='top: " + (this.rowHeight * rowIndex) + "px;'></div>");
		this.appendColumnsToRow(row);
		return row;
	}
	appendColumnsToRow(row: JQuery) {
		for (var i = 0; i < this.colsCount; i++) {
			row.append($("<div class='pg2-cell pg2-col-" + i + "' style='width: 100px;'></div>"));
		}
	}
}
