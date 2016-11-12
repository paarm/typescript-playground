import { IGridModel, GridModel, IGridData, IGridRow} from './gridmodel';

class DomRow {
	public tempHidden:boolean;
	constructor(public domRowElement: HTMLDivElement, public linkedModelRowIndex: number, public top: number) {

	}
}

class DomColumn {
	public origWidth: number;
	public newWidth: number;
	public mouseMoveHandler: ()=>any;
	public mouseUpHandler: ()=>any;
	public touchMoveHandler: ()=>any;
	public touchEndHandler: ()=>any;

	constructor(public domColumnElement: HTMLDivElement, public domResizeHandleElement: HTMLDivElement, public displayIndex: number, public linkedModelColumnIndex: number) {
	}
}

class ColumnResizeContext {
	public domColumn: DomColumn;
	public initialPageX: number;
	//public clientLeft: number;
	//public origWidth: number;
}

export class Grid {
	isTouchDevice: boolean=typeof window.ontouchstart !== 'undefined';
	modelOK: boolean=true;
	headerHeight: number=0;
	viewportHeight: number=0;
	rowHeightInPixel: number=0;
	//modelRowCount: number;
	get modelRowCount() : number {
		return this.mGridModel.getRowCount();
	} 
	modelColumnsCount: number=0;
	canvasHeightInPixel: number=0;
	currentDomRowsCount: number=0;
	maxDomRowsCount: number=0;
	maxVisibleDomRows: number=0;
	overflowRowBufferCount: number=0;
	overflowRowBufferInPixel: number=0;
	domRows: DomRow[]=[];
	domColumns: DomColumn[]=[];
	resizeHandleElementWidth: number=15;
	headerColumnMinWidth: number=30;
	scrollTop: number=0;
	scrollLeft: number=0;
	renderedScrollTop: number=0;
	renderedScrollLeft: number=0;
	topDomRowIndex: number=0;
	bottomDomRowIndex: number=0;
	pg2_canvasInitialChildsFragment:DocumentFragment=document.createDocumentFragment();
	scrollVRenderTimer: number=-1;
	scrollDiffRows:number=0;

	pg2: HTMLDivElement;
	pg2_header: HTMLDivElement;
	pg2_header_row: HTMLDivElement;
	pg2_viewport: HTMLDivElement;
	pg2_canvas: HTMLDivElement;
	
	columnResizeContext : ColumnResizeContext=new ColumnResizeContext();

	constructor(private width: number, private height: number, private mParentContainer: HTMLElement, private mGridModel: IGridModel) {
		if (this.isTouchDevice) {
			this.resizeHandleElementWidth=50;
			this.headerColumnMinWidth=65;
		}
		
		this.modelOK = this.checkModel();
		console.log("Model Rows count: " + this.modelRowCount);
		this.modelColumnsCount = this.mGridModel.getColumnCount();
		console.log("Model Columns count: " + this.modelColumnsCount);
		this.createBaseList();
		this.createInitialDomRows();
		//document.documentElement.addEventListener("mouseup", $.proxy(this.onGlobalMouseUp, this));
		//document.documentElement.addEventListener("mousemove", $.proxy(this.onGlobalMouseMove, this));
	}

	public appendModelRow(rIGridRow: IGridRow) {
		if (rIGridRow!=null) {
			this.gridModel.addRow(rIGridRow);
			this.onNewModelRowAddedLater();
		}
	}

	public appendModelRows(rIGridRows: IGridRow[]) {
		if (rIGridRows!=null) {
			for(var i=0;i<rIGridRows.length;i++) {
				this.gridModel.addRow(rIGridRows[i]);
			}
			this.onNewModelRowAddedLater();
		}
	}

	public removeModelRow(index: number) {
		this.gridModel.removeRow(index);
		this.onModelRowDeletedLater();
	}

	public removeModelRows(indexes: number[]) {
		if (indexes!=null) {
			indexes.sort((a: number, b: number): number =>{
				var r:number=0;
				if (a>b) {
					r=1;
				} else if (a<b) {
					r=-1;
				}
				return r;
			})
			for(var i=indexes.length-1;i>=0;i--) {
				this.gridModel.removeRow(indexes[i]);
			}
			this.onModelRowDeletedLater();
		}		
	}

	get parentContainer(): HTMLElement {
		return this.mParentContainer;
	}
	get gridModel(): IGridModel {
		return this.mGridModel;
	}


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
		for (var i = 0, count = this.mGridModel.getRowCount(); i < count; i++) {
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
			console.log("Header Columns count: " + this.modelColumnsCount);
			var lines: number = this.mGridModel.getRowCount();

			this.pg2 = <HTMLDivElement>document.createElement("div");
			this.pg2.style.cssText="width: "+this.width+"px; height: "+this.height+"px; overflow: hidden; position: relative";
			this.pg2.className="pg2";
			//$("<div class='pg2' style='width: "+this.width+"px; height: "+this.height+"px; overflow: hidden; position: relative'></div>");
			this.mParentContainer.appendChild(this.pg2);
			this.pg2_header = <HTMLDivElement>document.createElement("div");
			this.pg2_header.style.cssText='overflow: hidden; position: relative;';
			this.pg2_header.className="pg2-header";
			//this.pg2_header = $("<div class='pg2-header' style='overflow: hidden; position: relative;'></div>");
			// header
			this.pg2.appendChild(this.pg2_header);
			this.pg2_header_row = <HTMLDivElement>document.createElement("div");
			this.pg2_header_row.className="pg2-header-row";
			//this.pg2_header_row.addEventListener("mousemove", $.proxy(this.onHandlerHeaderRowMouseMove, this, this.pg2_header_row));

			//this.pg2_header_row = $("<div class='pg2-header-row'></div>");
			this.pg2_header.appendChild(this.pg2_header_row);
			//var headerWidth=0;
			for (var i = 0; i < this.modelColumnsCount; i++) {
				var columnWidth=100;
				var columnHeaderElement :HTMLDivElement =<HTMLDivElement>document.createElement("div");
				columnHeaderElement.style.cssText='width: '+columnWidth+'px;'
				columnHeaderElement.className="pg2-header-cell pg2-header-cell-unsorted pg2-col-" + i + "";
				this.pg2_header_row.appendChild(columnHeaderElement);
				//if (i==0) {
				//	headerWidth=columnHeaderElement.clientWidth;
				//}
				var span:HTMLSpanElement=document.createElement("span");
				var textElement:Text=document.createTextNode(this.mGridModel.getHeaderColumn(i).name);
				span.appendChild(textElement);
				columnHeaderElement.appendChild(span);

				var resizeHandleElement: HTMLDivElement = document.createElement("div");
				resizeHandleElement.style.width=this.resizeHandleElementWidth+"px";
				columnHeaderElement.appendChild(resizeHandleElement);				
				var domColumn: DomColumn = new DomColumn(columnHeaderElement, resizeHandleElement, i, i);
				domColumn.origWidth=columnWidth;
				this.domColumns.push(domColumn);
				if (this.isTouchDevice) {
					resizeHandleElement.innerHTML=">";
					resizeHandleElement.className="pg2-columnResizeHandle-touch";
					resizeHandleElement.addEventListener("touchstart", $.proxy(this.onColumnResizeTouchStart, this, domColumn));
				} else {
					resizeHandleElement.className="pg2-columnResizeHandle-notouch";
					resizeHandleElement.addEventListener("mousedown", $.proxy(this.onColumnResizeMouseDown, this, domColumn));
				}
				
				//rr.innerHTML=""+this.mGridModel.getHeaderColumn(i).name;
				//this.pg2_header_row.append("<div class='pg2-header-cell pg2-header-cell-unsorted pg2-col-" + i + "' style='width: 100px;' onclick='onColumnHeaderClicked(this," + i + ",true)'>" + this.mGridModel.getHeaderColumn(i).name + "</div>");
			}
			//this.pg2_header_row.style.width=""+headerWidth+"px;";
			//this.pg2_header_row.css("width",this.pg2_header_row.children().first().outerWidth()*this.colsCount);
			this.headerHeight=this.pg2_header_row.clientHeight;
			//this.headerHeight=this.pg2_header_row.outerHeight();
			this.viewportHeight=this.height-this.headerHeight;
			// body
			this.pg2_viewport=document.createElement("div");
			this.pg2_viewport.style.cssText="width: 100%; overflow: auto; position: relative; height: "+this.viewportHeight+"px;";
			this.pg2_viewport.className="pg2-viewport";
			//this.pg2_viewport = $("<div class='pg2-viewport' style='width: 100%; overflow: auto; position: relative; height: "+this.viewportHeight+"px;'></div>");
			this.pg2.appendChild(this.pg2_viewport);
			this.pg2_canvas = document.createElement("div");
			this.pg2_canvas.style.cssText="width: " + (this.modelColumnsCount * 103.6) + "px; height: 30px;";
			this.pg2_canvas.className="pg2-canvas";
			//this.pg2_canvas = $("<div class='pg2-canvas' style='width: " + (this.colsCount * 103.6) + "px; height: 30px;'></div>");
			this.pg2_viewport.appendChild(this.pg2_canvas);
			this.measureRow();
			this.measureCanvasHeight();
			this.measureVisibleRows();
			this.measureMaxDomRows();
			//this.pg2_viewport.scroll({that: this}, function(eventObject: JQueryEventObject) {
			//	eventObject.data.that.onScroll("Huhu");
			//});
			$(".pg2-viewport").scroll({grid: this, caller: this.pg2_viewport}, 
				(eventObject: JQueryEventObject) => {
					eventObject.data.grid.onScroll.call(eventObject.data.grid, <JQuery>eventObject.data.caller);
				}
			);
		}
	}

	onColumnResizeTouchStart(domColumn: DomColumn, ev: TouchEvent) {
		domColumn.touchMoveHandler=$.proxy(this.onColumnResizeTouchMove, this, domColumn);
		domColumn.touchEndHandler=$.proxy(this.onColumnResizeTouchEnd, this, domColumn);

		domColumn.domResizeHandleElement.className="pg2-columnResizeHandle-touch-active";
		document.addEventListener("touchend", domColumn.touchEndHandler);
		document.addEventListener("touchmove", domColumn.touchMoveHandler);

		this.onColumnStartResize(domColumn, ev.targetTouches[ev.targetTouches.length-1].pageX);

	}
	
	onColumnResizeMouseDown(domColumn: DomColumn, ev: MouseEvent) {
		domColumn.mouseMoveHandler=$.proxy(this.onColumnResizeMouseMove, this, domColumn);
		domColumn.mouseUpHandler=$.proxy(this.onColumnResizeMouseUp, this, domColumn);

		domColumn.domResizeHandleElement.className="pg2-columnResizeHandle-notouch-active";
		document.addEventListener("mouseup", domColumn.mouseUpHandler);
		document.addEventListener("mousemove", domColumn.mouseMoveHandler);
		this.onColumnStartResize(domColumn, ev.pageX);
	}

	onColumnStartResize(domColumn: DomColumn, pageX: number) {
		/*var el: HTMLDivElement=document.createElement("div");
		el.className="pg2-header-toolbox";
		var posX=domColumn.domColumnElement.offsetLeft+domColumn.domColumnElement.clientWidth;
		el.style.setProperty("left", posX+"px");
		el.style.setProperty("top", this.pg2_header_row.offsetTop+this.pg2_header_row.clientHeight+"px");
		this.pg2.appendChild(el);
		*/
		for (var i=0, count=this.domColumns.length;i<count;i++) {
			this.domColumns[i].origWidth=Math.floor($(this.domColumns[i].domColumnElement).width());
			this.domColumns[i].newWidth=this.domColumns[i].origWidth;
		}
		this.columnResizeContext.domColumn=domColumn;
		this.columnResizeContext.initialPageX=pageX;
		//this.columnResizeContext.clientLeft=this.columnResizeContext.startX-domColumn.domColumnElement.clientWidth;
		console.log("on mouse down. X: "+ this.columnResizeContext.initialPageX);		
	}

	onColumnResizeMouseMove(domColumn: DomColumn, ev: MouseEvent) {
		if (this.columnResizeContext.domColumn!=null) {
			this.onColumnUpdateResize(ev.pageX);
		}
	}
	onColumnResizeTouchMove(domColumn: DomColumn, ev: TouchEvent) {
		if (this.columnResizeContext.domColumn!=null) {
			this.onColumnUpdateResize(ev.targetTouches[ev.targetTouches.length-1].clientX);
			ev.preventDefault();
			ev.stopPropagation();
		}
	}

	onColumnResizeMouseUp(domColumn: DomColumn, ev: MouseEvent) {
		if (this.columnResizeContext.domColumn!=null) {
			domColumn.domResizeHandleElement.className="pg2-columnResizeHandle-notouch";

			document.removeEventListener("mousemove",domColumn.mouseMoveHandler);
			document.removeEventListener("mouseup", domColumn.mouseUpHandler);
			this.onColumnResizeEnded();
			this.columnResizeContext.domColumn = null;
		}
	}

	onColumnResizeTouchEnd(domColumn: DomColumn, ev: TouchEvent) {
		if (this.columnResizeContext.domColumn!=null) {
			domColumn.domResizeHandleElement.className="pg2-columnResizeHandle-touch";

			document.removeEventListener("touchmove",domColumn.touchMoveHandler);
			document.removeEventListener("touchend", domColumn.touchEndHandler);
			this.onColumnResizeEnded();
			this.columnResizeContext.domColumn = null;
		}
	}

	onColumnUpdateResize(pageX:number) {
		console.log("on column resize update. X: "+ pageX);
		var moveDistance=pageX-this.columnResizeContext.initialPageX;
		var newWidth=Math.floor(this.columnResizeContext.domColumn.origWidth+moveDistance);
		if (newWidth<this.headerColumnMinWidth) {
			newWidth=this.headerColumnMinWidth;
		}
		var diff=Math.abs(this.columnResizeContext.domColumn.newWidth-newWidth);
		if (diff>=1) {
			this.columnResizeContext.domColumn.newWidth=newWidth;
			this.columnResizeContext.domColumn.domColumnElement.style.width=newWidth+"px";
		}
	}

	onColumnResizeEnded() {
		for (var i=0, count=this.domRows.length;i<count;i++) {
			var col=<HTMLDivElement>this.domRows[i].domRowElement.children[this.columnResizeContext.domColumn.displayIndex];
			col.style.width=this.columnResizeContext.domColumn.newWidth+"px";
			this.columnResizeContext.domColumn.origWidth=this.columnResizeContext.domColumn.newWidth;
		}
		console.log("on column resize ended");
	}

	onHandlerHeaderRowMouseMove(headerRow: HTMLDivElement, ev: MouseEvent) {
		if (this.columnResizeContext.domColumn!=null) {
			this.columnResizeContext.domColumn.domColumnElement.style.width=(this.columnResizeContext.domColumn.domColumnElement.clientWidth+1)+"px";
		}
	}

	startRenderTimer() {
		this.scrollVRenderTimer=setTimeout($.proxy(this.onScrollVRenderTimerTimedOut, this), 50);
		//this.renderTimer=setTimeout(this.onRenderTimerTimedOut, 100)
	}

	clearRenderTimer() : boolean {
		var rv: boolean=false;
		if (this.scrollVRenderTimer!=-1) {
			clearTimeout(this.scrollVRenderTimer);
			this.scrollVRenderTimer=-1;
			rv=true;
		}
		return rv;
	}

	onScrollVRenderTimerTimedOut() {
		console.log("renderer called");
		if (this.scrollDiffRows<this.currentDomRowsCount) {
			// move single dom rows up/down
			if (this.scrollTop>this.renderedScrollTop) {
				while(true) {
					if (this.domRows[this.bottomDomRowIndex].linkedModelRowIndex+1>=this.modelRowCount) {
						break;
					}
					var topElementDiff=this.scrollTop-this.domRows[this.topDomRowIndex].top;
					if (topElementDiff>this.overflowRowBufferInPixel) {
						this.moveTopDomRowToBottom();
					} else {
						break;
					}
				}
			} else if (this.scrollTop<this.renderedScrollTop) {
				while(true) {
					if (this.domRows[this.topDomRowIndex].linkedModelRowIndex<=0) {
						break;
					}
					var topElementDiff=this.scrollTop-this.domRows[this.topDomRowIndex].top;
					if (topElementDiff<this.overflowRowBufferInPixel) {
						this.moveBottomDomRowToTop();
					} else {
						break;
					}
				}
			}
			this.displayTemporaryUndisplayedRows();
		} else {
			// to many rows to move... it is better to build list from scatch
			var firstRowIndexIs: number =this.calculateModelRowIndexForFirstDomRow(this.scrollTop);
			this.resyncDomRowsInModelOrder(firstRowIndexIs);
		}
		this.renderedScrollTop=this.scrollTop;
	}

	calculateModelRowIndexForFirstDomRow(scrollTopExplizit: number) : number {
		var firstModelRowIndex: number=Math.floor(scrollTopExplizit/this.rowHeightInPixel);
		console.log("First visible model row index is: "+firstModelRowIndex);
		firstModelRowIndex-=this.overflowRowBufferCount;
		if (firstModelRowIndex+this.currentDomRowsCount>this.modelRowCount) {
			firstModelRowIndex=this.modelRowCount-this.currentDomRowsCount;
		}
		if (firstModelRowIndex<0) {
			firstModelRowIndex=0;
		}
		console.log("Model row for dom row 0 is: "+firstModelRowIndex);
		return firstModelRowIndex;
	}

	undisplayRowTemporary(domRowIndex:number) {
		this.domRows[domRowIndex].domRowElement.style.display="none";
		this.domRows[domRowIndex].tempHidden=true;
	}

	displayTemporaryUndisplayedRow(domRowIndex:number) {
		if (this.domRows[domRowIndex].tempHidden==true) {
			this.domRows[domRowIndex].domRowElement.style.display="block";
			this.domRows[domRowIndex].tempHidden=false;
		}
	}

	undisplayRowsTemporary() {
		for(var i=0;i<this.currentDomRowsCount;i++) {
			this.undisplayRowTemporary(i);
		}
	}
	displayTemporaryUndisplayedRows() {
		for(var i=0;i<this.currentDomRowsCount;i++) {
			this.displayTemporaryUndisplayedRow(i);
		}
	}

	resyncDomRowsInModelOrder(firstModelRowIndex: number) {
		this.undisplayRowsTemporary();
		var i:number=0;
		this.topDomRowIndex=0;
		for(var i=0;i<this.currentDomRowsCount;i++) {
			this.domRows[i].top=(firstModelRowIndex+i)*this.rowHeightInPixel;
			this.domRows[i].domRowElement.style.top=""+this.domRows[i].top+"px";				
			this.domRows[i].linkedModelRowIndex=firstModelRowIndex+i;
			this.updateViewContent(this.domRows[i]);
			this.bottomDomRowIndex=i;
		}
		this.displayTemporaryUndisplayedRows();
		for(var i=0;i<this.currentDomRowsCount;i++) {
			this.pg2_canvas.appendChild(this.domRows[i].domRowElement);
		}
	}

	onScrollH(currentScrollLeft: number) {
		if (this.scrollLeft!=currentScrollLeft) {
			this.scrollLeft=currentScrollLeft;
			var count=this.pg2_header_row.childElementCount;
			for (var i=0;i<count;i++) {
				var child:HTMLDivElement=<HTMLDivElement>this.pg2_header_row.children[i];
				child.style.left=""+(-this.scrollLeft)+"px";
			}
		}
	}

	onScrollV(currentScrollTop: number) {
		var timerStopped: boolean=false;
		if (currentScrollTop!=this.scrollTop) {
			timerStopped=this.clearRenderTimer();
		}
		this.scrollDiffRows=Math.abs(currentScrollTop-this.renderedScrollTop)/this.rowHeightInPixel;
		if (timerStopped || (this.scrollDiffRows>0 && this.scrollDiffRows>this.overflowRowBufferCount)) {
			this.scrollTop=currentScrollTop;
			if (this.scrollTop>(this.canvasHeightInPixel-this.height)) {
				this.scrollTop=(this.canvasHeightInPixel-this.height);
			}
			this.startRenderTimer();
		}
	}

	onScroll(caller : HTMLDivElement) {
		this.onScrollH(caller.scrollLeft);
		this.onScrollV(caller.scrollTop);
	}

	moveTopDomRowToBottom() {
		console.log("move top dom row to bottom");
		this.undisplayRowTemporary(this.topDomRowIndex);
		this.domRows[this.topDomRowIndex].tempHidden=true;

		this.domRows[this.topDomRowIndex].top=this.domRows[this.bottomDomRowIndex].top+this.rowHeightInPixel;
		this.domRows[this.topDomRowIndex].domRowElement.style.top=""+this.domRows[this.topDomRowIndex].top+"px";
		this.domRows[this.topDomRowIndex].linkedModelRowIndex=this.domRows[this.bottomDomRowIndex].linkedModelRowIndex+1;
		this.updateViewContent(this.domRows[this.topDomRowIndex]);

		this.bottomDomRowIndex=this.topDomRowIndex;
		this.topDomRowIndex++;
		if (this.topDomRowIndex>=this.currentDomRowsCount) {
			this.topDomRowIndex=0;
		}
		//this.pg2_canvas
		this.pg2_canvas.appendChild(this.domRows[this.bottomDomRowIndex].domRowElement);
	}
	moveBottomDomRowToTop() {
		console.log("move bottom dom row to top");
		this.undisplayRowTemporary(this.bottomDomRowIndex);
		var currentTopDomRowIndex=this.topDomRowIndex;

		this.domRows[this.bottomDomRowIndex].top=this.domRows[this.topDomRowIndex].top-this.rowHeightInPixel;
		this.domRows[this.bottomDomRowIndex].domRowElement.style.top=""+this.domRows[this.bottomDomRowIndex].top+"px";
		this.domRows[this.bottomDomRowIndex].linkedModelRowIndex=this.domRows[this.topDomRowIndex].linkedModelRowIndex-1;
		this.updateViewContent(this.domRows[this.bottomDomRowIndex]);

		this.topDomRowIndex=this.bottomDomRowIndex;
		this.bottomDomRowIndex--;
		if (this.bottomDomRowIndex<0) {
			this.bottomDomRowIndex=this.currentDomRowsCount-1;
		}
		//pg2_canvas
		this.pg2_canvas.insertBefore(this.domRows[this.topDomRowIndex].domRowElement,this.domRows[currentTopDomRowIndex].domRowElement);
	}

	updateViewContent(domRow:DomRow) {
		if (domRow.linkedModelRowIndex>=0) {
			let columnCount: number=domRow.domRowElement.childElementCount;
			let modelGridRow: IGridRow=this.gridModel.getRow(domRow.linkedModelRowIndex);
			for (var i=0;i<columnCount;i++) {
				var columnElement: HTMLDivElement=<HTMLDivElement>domRow.domRowElement.childNodes[i];
				while(columnElement.firstChild!=null) {
					columnElement.removeChild(columnElement.firstChild);
				}
				if (this.gridModel.getHeaderColumn(i).renderer!=null) {
					let customRenderedElement:HTMLElement=this.gridModel.getHeaderColumn(i).renderer(this.gridModel, modelGridRow, modelGridRow.columns[i]);
					if (customRenderedElement!=null) {
						//columnElement.childNodes.innerHTML="";
						columnElement.appendChild(customRenderedElement);
					}
				} else {
					var textElement: Text=document.createTextNode(modelGridRow.columns[i].value);
					columnElement.appendChild(textElement);//modelGridRow.columns[i].value;
				}
			}
		}
	}

	measureRow() {
		var dummyRow : HTMLDivElement=this.buildDomElementForRow(0);
		this.pg2_canvas.appendChild(dummyRow);
		this.rowHeightInPixel=dummyRow.clientHeight;//.outerHeight(true);
		console.log("Row height: "+this.rowHeightInPixel+"px");
		this.pg2_canvas.removeChild(dummyRow);//.children().first().remove();
	}

	measureCanvasHeight() {
		this.canvasHeightInPixel=this.rowHeightInPixel*this.modelRowCount;
		this.pg2_canvas.style.height=""+this.canvasHeightInPixel+"px";
		console.log("Canvas Height: "+this.canvasHeightInPixel);
	}

	measureVisibleRows() {
		this.maxVisibleDomRows=this.viewportHeight/this.rowHeightInPixel;
		this.maxVisibleDomRows=Math.ceil(this.maxVisibleDomRows);
		console.log("Max visible Dom rows: "+this.maxVisibleDomRows);
	}

	measureMaxDomRows() {
		this.maxDomRowsCount=this.maxVisibleDomRows*2;
		this.overflowRowBufferCount=Math.max(1, Math.floor((this.maxDomRowsCount-this.maxVisibleDomRows)/2));
		this.overflowRowBufferInPixel=this.overflowRowBufferCount*this.rowHeightInPixel;

		console.log("Max Dom rows count: "+this.maxDomRowsCount);
		console.log("Overflow row buffer count: "+this.overflowRowBufferCount);
	}

	createInitialDomRows() {
		var initialDomRowsCount=Math.min(this.maxDomRowsCount,this.modelRowCount);
		this.topDomRowIndex=-1;
		this.bottomDomRowIndex=-1;

		for (var l = 0; l < initialDomRowsCount; l++) {
			var domRow: DomRow=this.prepareNewDomRow();
			if (domRow!=null) {
				domRow.linkedModelRowIndex=l;
				this.updateViewContent(domRow);
				
				this.pg2_canvasInitialChildsFragment.appendChild(domRow.domRowElement);
			}
		}
		// inject the dom fragment to the real dom
		this.pg2_canvas.appendChild(this.pg2_canvasInitialChildsFragment);
	}

	onNewModelRowAddedLater() {
		this.measureCanvasHeight();
		var requiredRows=Math.max(0,this.modelRowCount-this.currentDomRowsCount);
		requiredRows=Math.min(requiredRows, this.maxDomRowsCount-this.currentDomRowsCount);

		for (var i=0;i<requiredRows;i++) {
			var domRow: DomRow=this.prepareNewDomRow();
			domRow.linkedModelRowIndex=0; // dummy
			if (domRow!=null) {
				this.pg2_canvas.appendChild(domRow.domRowElement);
			}
		}
		// rebuild the view list
		var firstRowIndexIs: number =this.calculateModelRowIndexForFirstDomRow(this.pg2_viewport.scrollTop);
		this.resyncDomRowsInModelOrder(firstRowIndexIs);
	}

	onModelRowDeletedLater() {
		var domRowRemoved:DomRow[]=[];
		this.measureCanvasHeight();
		if (this.currentDomRowsCount>this.modelRowCount) {
			var toRemoveRowsCount=this.currentDomRowsCount-this.modelRowCount;
			for (var i=0;i<toRemoveRowsCount;i++) {
				domRowRemoved.push(<DomRow>this.domRows.pop());
				console.log("Removed dom row with index "+(this.currentDomRowsCount-1));
				this.currentDomRowsCount--;
			}
		}
		// rebuild the view list
		var firstRowIndexIs: number =this.calculateModelRowIndexForFirstDomRow(this.pg2_viewport.scrollTop);
		this.resyncDomRowsInModelOrder(firstRowIndexIs);
		
		if (domRowRemoved!=null) {
			for (var i=0;i<domRowRemoved.length;i++) {
				domRowRemoved[i].domRowElement.remove();
			}
		}
	}

	prepareNewDomRow() : DomRow {
		var domRow: DomRow=null;
		if (this.topDomRowIndex==-1) {
			this.topDomRowIndex=0;
		}
		var newDomRowIndex=this.currentDomRowsCount;
		// build the dom element
		let row: HTMLDivElement = this.buildDomElementForRow(newDomRowIndex);
		domRow=new DomRow(row, -1, this.rowHeightInPixel*newDomRowIndex);
		this.domRows.push(domRow);
		this.currentDomRowsCount++;
		this.bottomDomRowIndex++;

		console.log("Added dom row with index "+newDomRowIndex);
		return domRow;
	}

	buildDomElementForRow(domRowIndex: number): HTMLDivElement {
		var evenodd:string=(domRowIndex%2==0)?"even":"odd";
		var row: HTMLDivElement = <HTMLDivElement> document.createElement("div");
		row.className="pg2-row pg2-row-" + domRowIndex + " pg2-row-"+evenodd;
		row.style.cssText="top: " + (this.rowHeightInPixel * domRowIndex) + "px;";
		//var row: JQuery = $("<div class='pg2-row pg2-row-" + domRowIndex + " pg2-row-"+evenodd+"' style='top: " + (this.rowHeight * domRowIndex) + "px;'></div>");
		this.appendColumnsToDomRow(row,domRowIndex);
		return row;
	}

	appendColumnsToDomRow(row: HTMLDivElement, domRowIndex: number) {
		for (var i = 0; i < this.modelColumnsCount; i++) {
			var col: HTMLDivElement = <HTMLDivElement> document.createElement("div");
			col.className="pg2-cell pg2-col-" + i;
			col.style.width=this.domColumns[i].origWidth+"px";
			row.appendChild(col);			
			//row.append($("<div class='pg2-cell pg2-col-" + i + "' style='width: 100px;'></div>"));
		}
	}
}
