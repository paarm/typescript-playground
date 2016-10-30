import { IGridModel, GridModel, IGridData } from './gridmodel';

class DomRow {
	constructor(public domRowElement: JQuery, public linkedModelRowIndex: number, public top: number) {

	}
}

export class Grid {
	modelOK: boolean;
	rowHeight: number;
	rowCount: number;
	colsCount: number;
	canvasHeight: number;
	maxDomRows: number;
	currentDomRows: number;
	maxVisibleDomRows: number;
	rollingRowBufferCount: number;
	rollingRowBufferPixel: number;
	domRows: DomRow[]=[];
	scrollTop: number;
	scrollLeft: number;
	topDomRowIndex: number;
	bottomDomRowIndex: number;
	
	constructor(private width: number, private height: number, private mParentContainer: JQuery, private mGridModel: IGridModel) {
		this.modelOK = this.checkModel();
		this.rowCount = this.mGridModel.getRowCount();
		console.log("Model Rows count: " + this.rowCount);
		this.colsCount = this.mGridModel.getColumnCount();
		console.log("Model Columns count: " + this.colsCount);
		this.currentDomRows=0;
		this.topDomRowIndex=0;
		this.scrollLeft=0;
		this.scrollTop=0;
		this.createBaseList();
		this.createInitialDomRows(this.maxDomRows);
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
			this.pg2_viewport = $("<div class='pg2-viewport' style='width: 100%; overflow: auto; position: relative; height: "+this.height+"px;'></div>");
			this.pg2.append(this.pg2_viewport);
			this.pg2_canvas = $("<div class='pg2-canvas' style='width: " + (this.colsCount * 103.6) + "px; height: 30px;'></div>");
			this.pg2_viewport.append(this.pg2_canvas);
			this.measureRow();
			this.measureCanvasHeight();
			this.measureVisibleRows();
			this.measureMaxDomRows();
			this.pg2_canvas.css('height',""+this.canvasHeight+"px");
			//this.pg2_viewport.scroll({that: this}, function(eventObject: JQueryEventObject) {
			//	eventObject.data.that.onScroll("Huhu");
			//});
			this.pg2_viewport.scroll({grid: this, caller: this.pg2_viewport}, 
				(eventObject: JQueryEventObject) => {
					eventObject.data.grid.onScroll.call(eventObject.data.grid, <JQuery>eventObject.data.caller);
				}
			);
		}
	}

	onScroll(caller : JQuery) {
		var lastScrollTop: number= this.scrollTop;
		var lastScrollLeft: number= this.scrollLeft;
		//this.scrollTop=caller.scrollTop();
		this.scrollLeft=caller.scrollLeft();
		//console.log("Scroll Top: "+this.scrollTop+", Scroll Left: "+this.scrollLeft);
		//console.log("Scroll event called "+eventObject.data.that);
		var diffRows:number=0;
		if (caller.scrollTop()>lastScrollTop) {
			diffRows=(caller.scrollTop()-lastScrollTop)/this.rowHeight;
		} else if (caller.scrollTop()<lastScrollTop) {
			diffRows=(lastScrollTop-caller.scrollTop())/this.rowHeight;
		}
		if (diffRows>0 && diffRows>this.rollingRowBufferCount) {
			this.scrollTop=caller.scrollTop();
			if (this.scrollTop>(this.canvasHeight-this.height)) {
				this.scrollTop=(this.canvasHeight-this.height);
			}
			if (diffRows<this.maxDomRows) {
				if (this.scrollTop>lastScrollTop) {
					while(true) {
						if (this.domRows[this.bottomDomRowIndex].linkedModelRowIndex+1>=this.rowCount) {
							break;
						}
						var topElementDiff=this.scrollTop-this.domRows[this.topDomRowIndex].top;
						if (topElementDiff>this.rollingRowBufferPixel) {
							this.moveTopRowToBottom();
						} else {
							break;
						}
					}
				} else if (this.scrollTop<lastScrollTop) {
					while(true) {
						if (this.domRows[this.topDomRowIndex].linkedModelRowIndex<=0) {
							break;
						}
						var topElementDiff=this.scrollTop-this.domRows[this.topDomRowIndex].top;
						if (topElementDiff<this.rollingRowBufferPixel) {
							this.moveBottomRowToTop();
						} else {
							break;
						}
					}
				}
			} else {
				// reset view
				var firstRowIndex: number=Math.floor(this.scrollTop/this.rowHeight);
				console.log("First Row Index: "+firstRowIndex);
				firstRowIndex-=this.rollingRowBufferCount;
				if (firstRowIndex<0) {
					firstRowIndex=0;
				}
				this.topDomRowIndex=0;
				//this.bottomDomRowIndex=this.maxDomRows-1;
				for(var i=0;i<this.maxDomRows;i++) {
					if (firstRowIndex+i<this.rowCount) {
						//console.log("top: "+(firstRowIndex+i)*this.rowHeight);
						this.domRows[i].top=(firstRowIndex+i)*this.rowHeight;
						this.domRows[i].domRowElement.css('top',this.domRows[i].top);
						this.domRows[i].linkedModelRowIndex=firstRowIndex+i;
						this.updateDomRowModelDataForView(i);
						this.domRows[i].domRowElement.show();
						this.bottomDomRowIndex=i;
					} else {
						console.log("Hide Row Index: "+i);
						this.domRows[i].domRowElement.hide();
						this.domRows[i].top=0;
						this.domRows[i].domRowElement.css('top',this.domRows[i].top.toFixed()+"px");
						this.domRows[i].linkedModelRowIndex=-1;
						this.updateDomRowModelDataForView(i);
					}
				}
			}
		}
		//console.log("Top Element diff: "+topElementDiff);
	}
	moveTopRowToBottom() {
		console.log("move top row to bottom");
		this.domRows[this.topDomRowIndex].top=this.domRows[this.bottomDomRowIndex].top+this.rowHeight;
		this.domRows[this.topDomRowIndex].domRowElement.css('top',this.domRows[this.topDomRowIndex].top);
		this.domRows[this.topDomRowIndex].linkedModelRowIndex=this.domRows[this.bottomDomRowIndex].linkedModelRowIndex+1;
		this.updateDomRowModelDataForView(this.topDomRowIndex);
		this.domRows[this.topDomRowIndex].domRowElement.show();

		this.bottomDomRowIndex=this.topDomRowIndex;
		this.topDomRowIndex++;
		if (this.topDomRowIndex>=this.maxDomRows) {
			this.topDomRowIndex=0;
		}
	}
	moveBottomRowToTop() {
		console.log("move bottom row to top");

		this.domRows[this.bottomDomRowIndex].top=this.domRows[this.topDomRowIndex].top-this.rowHeight;
		this.domRows[this.bottomDomRowIndex].domRowElement.css('top',this.domRows[this.bottomDomRowIndex].top);
		this.domRows[this.bottomDomRowIndex].linkedModelRowIndex=this.domRows[this.topDomRowIndex].linkedModelRowIndex-1;
		this.updateDomRowModelDataForView(this.bottomDomRowIndex);
		this.domRows[this.bottomDomRowIndex].domRowElement.show();

		this.topDomRowIndex=this.bottomDomRowIndex;
		this.bottomDomRowIndex--;
		if (this.bottomDomRowIndex<0) {
			this.bottomDomRowIndex=this.maxDomRows-1;
		}
	}

	updateDomRowModelDataForView(domRowIndex:number) {
		this.domRows[domRowIndex].domRowElement.children().first().text("Zeile: "+(this.domRows[domRowIndex].linkedModelRowIndex+1));
	}

	measureRow() {
		var dummyRow : JQuery=this.buildRow(0);
		dummyRow.css('top', '-200px');
		this.pg2_canvas.append(dummyRow);
		this.rowHeight=dummyRow.outerHeight(true);
		console.log("Row height: "+this.rowHeight+"px");
		this.pg2_canvas.remove('.pg2-row');
	}

	measureCanvasHeight() {
		this.canvasHeight=this.rowHeight*this.rowCount;
		console.log("Canvas Height: "+this.canvasHeight);
	}

	measureVisibleRows() {
		this.maxVisibleDomRows=this.height/this.rowHeight;
		this.maxVisibleDomRows=Math.ceil(this.maxVisibleDomRows);
		console.log("Max visible Dom rows: "+this.maxVisibleDomRows);
	}

	measureMaxDomRows() {
		this.maxDomRows=this.maxVisibleDomRows*2;
		this.rollingRowBufferCount=Math.max(1, Math.floor(this.maxVisibleDomRows/2));
		this.rollingRowBufferPixel=this.rollingRowBufferCount*this.rowHeight;
		console.log("Max Dom rows: "+this.maxDomRows);
	}

	createInitialDomRows(initialDomRowsCount: number) {
		this.topDomRowIndex=0;
		this.bottomDomRowIndex=initialDomRowsCount-1;
		this.currentDomRows=initialDomRowsCount;
		for (var l = 0; l < initialDomRowsCount; l++) {
			let row: JQuery = this.buildRow(l);
			this.pg2_canvas.append(row);
			let domRow=new DomRow(row, l, this.rowHeight*l);
			this.domRows.push(domRow);
		}
	}

	buildRow(domRowIndex: number): JQuery {
		var row: JQuery = $("<div class='pg2-row pg2-row-" + domRowIndex + "' style='top: " + (this.rowHeight * domRowIndex) + "px;'></div>");
		this.appendColumnsToRow(row,domRowIndex);
		return row;
	}
	appendColumnsToRow(row: JQuery, domRowIndex: number) {
		for (var i = 0; i < this.colsCount; i++) {
			row.append($("<div class='pg2-cell pg2-col-" + i + "' style='width: 100px;'>dom row: # "+domRowIndex+"</div>"));
		}
	}
}
