import { IGridModel, GridModel, IGridData, IGridRow} from './gridmodel';
import {RowCacheHandler, RowRange, RowCacheElement} from './rowcache';

class HeaderCell {
	public origWidth: number;
	public newWidth: number;
	public htmlElement: HTMLDivElement;
	public htmlResizeElement: HTMLDivElement;
	public viewIndex: number;
	constructor() {
	}
	setOrigWidth(origWidth:number) {
		this.origWidth=origWidth;
	}
	setNewWidth(newWidth:number) {
		this.newWidth=newWidth;
	}
	setHTMLElement(htmlElement:HTMLDivElement) {
		this.htmlElement=htmlElement;
	}
	setHTMLRezizeElement(htmlResizeElement:HTMLDivElement) {
		this.htmlResizeElement=htmlResizeElement;
	}
	snapshotOrigWidht() {
		this.origWidth=Math.floor($(this.htmlElement).width());
		this.newWidth=this.origWidth;
	}
	setViewIndex(viewIndex:number) {
		this.viewIndex=viewIndex;
	}
}

class ColumnResizeContext {
	public headerCell: HeaderCell;
	public initialPageX: number;
}

interface ColumnHeaderCallback {
	onColumnResizeEnded: ()=>void;
}

class HeaderHandler {
	headerCellArray: HeaderCell[]=[];
	columnResizeContext : ColumnResizeContext=new ColumnResizeContext();
	headerColumnMinWidth: number=30;
	resizeHandleElementWidth: number=15;
	isTouchDevice: boolean=typeof window.ontouchstart !== 'undefined';
	columnHeaderCallback: ColumnHeaderCallback;

	constructor (columnHeaderCallback: ColumnHeaderCallback) {
		this.columnHeaderCallback=columnHeaderCallback;
		if (this.isTouchDevice) {
			console.log("Touch device detected");
			this.resizeHandleElementWidth=50;
			this.headerColumnMinWidth=65;
		}
	}

	public appendHeaderCell(viewIndex: number) : HeaderCell {
		var headerCell:HeaderCell=new HeaderCell();
		headerCell.setViewIndex(viewIndex);
		this.headerCellArray.push(headerCell);
		return headerCell;
	}
	public getHeaderCellCount() : number {
		return this.headerCellArray.length;
	}
	public getHeaderCellFromIndex(index:number) : HeaderCell {
		return this.headerCellArray[index]; 
	}
	public onResizeColumnBegin(headerCell: HeaderCell, initialPageX: number) {
		for (var i=0;i<this.headerCellArray.length;i++) {
			this.headerCellArray[i].snapshotOrigWidht();
		}
		this.columnResizeContext.headerCell=headerCell;
		this.columnResizeContext.initialPageX=initialPageX;
	}
	onColumnResizeTouchStart(headerCell: HeaderCell, ev: TouchEvent) {
		headerCell.htmlResizeElement.className="pg2-columnResizeHandle-touch-active";
		$(headerCell.htmlResizeElement).on("touchend.gp2", $.proxy(this.onColumnResizeTouchEnd, this, headerCell));
		$(headerCell.htmlResizeElement).on("touchmove.gp2", $.proxy(this.onColumnResizeTouchMove, this, headerCell));

		this.onColumnStartResize(headerCell, ev.targetTouches[ev.targetTouches.length-1].pageX);
		return false;
	}
	
	onColumnResizeMouseDown(headerCell: HeaderCell, ev: MouseEvent) {
		headerCell.htmlResizeElement.className="pg2-columnResizeHandle-notouch-active";
		$(document).on("mouseup.pg2", $.proxy(this.onColumnResizeMouseUp, this, headerCell));
		$(document).on("mousemove.pg2", $.proxy(this.onColumnResizeMouseMove, this, headerCell));
		this.onColumnStartResize(headerCell, ev.pageX);
		return false;
	}
	onColumnResizeMouseUp(headerCell: HeaderCell, ev: MouseEvent) {
		if (this.columnResizeContext.headerCell!=null) {
			headerCell.htmlResizeElement.className="pg2-columnResizeHandle-notouch";

			$(document).unbind("mousemove.pg2");
			$(document).unbind("mouseup.pg2");
			this.columnHeaderCallback.onColumnResizeEnded.call(this.columnHeaderCallback);
			this.columnResizeContext.headerCell = null;
		}
	}

	onColumnResizeTouchEnd(headerCell: HeaderCell, ev: TouchEvent) {
		if (this.columnResizeContext.headerCell!=null) {
			headerCell.htmlResizeElement.className="pg2-columnResizeHandle-touch";
			$(headerCell.htmlResizeElement).unbind("tochmove.gp2");
			$(headerCell.htmlResizeElement).unbind("touchend.gp2");
			this.columnHeaderCallback.onColumnResizeEnded.call(this.columnHeaderCallback);
			this.columnResizeContext.headerCell = null;
		}
	}

	onColumnStartResize(headerCell: HeaderCell, pageX: number) {
		this.onResizeColumnBegin(headerCell, pageX);
	}

	onColumnResizeMouseMove(domColumn: HeaderCell, ev: MouseEvent) {
		if (this.columnResizeContext.headerCell!=null) {
			this.onColumnUpdateResize(ev.pageX);
		}
		return false;
	}

	onColumnResizeTouchMove(domColumn: HeaderCell, ev: TouchEvent) {
		if (this.columnResizeContext.headerCell!=null) {
			this.onColumnUpdateResize(ev.changedTouches.item(ev.changedTouches.length-1).pageX);
		}
		return false;
	}
	onColumnUpdateResize(pageX:number) {
		console.log("on column resize update. X: "+ pageX);
		var moveDistance=pageX-this.columnResizeContext.initialPageX;
		var newWidth=Math.floor(this.columnResizeContext.headerCell.origWidth+moveDistance);
		if (newWidth<this.headerColumnMinWidth) {
			newWidth=this.headerColumnMinWidth;
		}
		var diff=Math.abs(this.columnResizeContext.headerCell.newWidth-newWidth);
		if (diff>=1) {
			this.columnResizeContext.headerCell.newWidth=newWidth;
			this.columnResizeContext.headerCell.htmlElement.style.width=newWidth+"px";
		}
	}
}



class CanvasProperties {
	canvasHeightForRowsInPixel: number=0;
	viewportHightForRowsInPixel: number=0;
	rowHeightInPixel: number=0;
	maxRowCount: number=0;
	maxVisibleRowCount: number=0;
	overflowRowCount: number=0;

	scrollTop: number=0;
	scrollLeft: number=0;
	renderedScrollTop: number=0;
	renderedScrollLeft: number=0;
	scrollVRenderTimer: number=-1;
	scrollDiffRows:number=0;

	headerHeight: number=0;
	renderedRowRange: RowRange=new RowRange(-1,-1);
	nextRowRange: RowRange=new RowRange(-1,-1);

}

export class Grid implements ColumnHeaderCallback {
	modelOK: boolean=true;
	//modelRowCount: number;
	get modelRowCount() : number {
		return this.mGridModel.getRowCount();
	}
	canvasProperties: CanvasProperties=new CanvasProperties();
	rowCacheHandler: RowCacheHandler=new RowCacheHandler();
	headerHandler: HeaderHandler=new HeaderHandler(this);


	modelColumnsCount: number=0;
	//domRows: DomRow[]=[];
	pg2_canvasFragment:DocumentFragment=document.createDocumentFragment();

	pg2: HTMLDivElement;
	pg2_header: HTMLDivElement;
	pg2_header_resize_handle_row: HTMLDivElement;
	pg2_header_row: HTMLDivElement;
	pg2_header_griprow: HTMLDivElement;
	pg2_viewport: HTMLDivElement;
	pg2_canvas: HTMLDivElement;
	

	constructor(private width: number, private height: number, private mParentContainer: HTMLElement, private mGridModel: IGridModel) {
		this.modelOK = this.checkModel();
		console.log("Model Rows count: " + this.modelRowCount);
		this.modelColumnsCount = this.mGridModel.getColumnCount();
		console.log("Model Columns count: " + this.modelColumnsCount);
		this.createBaseList();
		this.render();
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
			// the grid container
			this.pg2 = <HTMLDivElement>document.createElement("div");
			this.pg2.style.cssText="width: "+this.width+"px; height: "+this.height+"px; ";
			this.pg2.className="pg2";
			this.mParentContainer.appendChild(this.pg2);
			// header container
			this.pg2_header = <HTMLDivElement>document.createElement("div");
			this.pg2_header.className="pg2-header";
			this.pg2.appendChild(this.pg2_header);
			// resize handler row
			this.pg2_header_resize_handle_row = <HTMLDivElement>document.createElement("div");
			//this.pg2_header_resize_handle_row.style.cssText="width: "+this.width+"px; height: 5px;";
			this.pg2_header_resize_handle_row.style.cssText="height: 5px;";
			this.pg2_header_resize_handle_row.className="pg2-header-resize-handle-row";
			this.pg2_header.appendChild(this.pg2_header_resize_handle_row);
			// row in the header
			this.pg2_header_row = <HTMLDivElement>document.createElement("div");
			this.pg2_header_row.className="pg2-header-row";
			this.pg2_header.appendChild(this.pg2_header_row);
			// header row
			for (var i = 0; i < this.modelColumnsCount; i++) {
							

				
				var columnWidth=100;
				var columnHeaderElement :HTMLDivElement =<HTMLDivElement>document.createElement("div");
				columnHeaderElement.style.cssText='width: '+columnWidth+'px;'
				columnHeaderElement.className="pg2-header-cell pg2-header-cell-unsorted pg2-col-" + i + "";
				this.pg2_header_row.appendChild(columnHeaderElement);
				var span:HTMLSpanElement=document.createElement("span");
				var textElement:Text=document.createTextNode(this.mGridModel.getHeaderColumn(i).name);
				span.appendChild(textElement);
				columnHeaderElement.appendChild(span);
				var resizeHandleElement: HTMLDivElement = document.createElement("div");
				resizeHandleElement.style.width=this.headerHandler.resizeHandleElementWidth+"px";
				columnHeaderElement.appendChild(resizeHandleElement);
				// prepare the HeaderCell
				var headerCell: HeaderCell=this.headerHandler.appendHeaderCell(i);
				headerCell.setHTMLElement(columnHeaderElement);
				headerCell.setHTMLRezizeElement(resizeHandleElement);
				headerCell.setOrigWidth(columnWidth);			

				if (this.headerHandler.isTouchDevice) {
					resizeHandleElement.innerHTML=">";
					resizeHandleElement.className="pg2-columnResizeHandle-touch";
					$(resizeHandleElement).bind("touchstart", $.proxy(this.headerHandler.onColumnResizeTouchStart, this.headerHandler, headerCell));
				} else {
					resizeHandleElement.className="pg2-columnResizeHandle-notouch";
					$(resizeHandleElement).bind("mousedown", $.proxy(this.headerHandler.onColumnResizeMouseDown, this.headerHandler, headerCell));
				}
			}
			this.canvasProperties.headerHeight=this.pg2_header.clientHeight;
			this.canvasProperties.viewportHightForRowsInPixel=this.height-this.canvasProperties.headerHeight;
			// body
			this.pg2_viewport=document.createElement("div");
			this.pg2_viewport.style.cssText="height: "+this.canvasProperties.viewportHightForRowsInPixel+"px;";
			this.pg2_viewport.className="pg2-viewport";

			this.pg2.appendChild(this.pg2_viewport);
			this.pg2_canvas = document.createElement("div");
			//this.pg2_canvas.style.cssText="width: " + (this.modelColumnsCount * 103.6) + "px; height: 30px;";
			this.pg2_canvas.className="pg2-canvas";
			this.pg2_viewport.appendChild(this.pg2_canvas);
			this.measureRow();
			this.measureCanvasHeight();
			this.measureVisibleRows();
			this.measureMaxDomRows();
			$(".pg2-viewport").scroll({grid: this, caller: this.pg2_viewport}, 
				(eventObject: JQueryEventObject) => {
					eventObject.data.grid.onScroll.call(eventObject.data.grid, <JQuery>eventObject.data.caller);
				}
			);
		}
	}

	onColumnResizeEnded() : void {
		var count=this.rowCacheHandler.getRowCacheElementCount();
		for (var i=0;i<count;i++) {
			var col=<HTMLDivElement>this.rowCacheHandler.getRowCacheElementByIndex(i).htmlElement.children[this.headerHandler.columnResizeContext.headerCell.viewIndex];
			col.style.width=this.headerHandler.columnResizeContext.headerCell.newWidth+"px";
			this.headerHandler.columnResizeContext.headerCell.origWidth=this.headerHandler.columnResizeContext.headerCell.newWidth;
		}
		console.log("on column resize ended");
	}

	startRenderTimer() {
		this.canvasProperties.scrollVRenderTimer=setTimeout($.proxy(this.onScrollVRenderTimerTimedOut, this), 50);
	}

	clearRenderTimer() : boolean {
		var rv: boolean=false;
		if (this.canvasProperties.scrollVRenderTimer!=-1) {
			clearTimeout(this.canvasProperties.scrollVRenderTimer);
			this.canvasProperties.scrollVRenderTimer=-1;
			rv=true;
		}
		return rv;
	}

	onScrollVRenderTimerTimedOut() {
		this.render();
	}

	render() {
		this.clearRenderTimer();
		console.log("renderer called with scroll top: "+this.canvasProperties.scrollTop);

		if (this.modelRowCount>0) {
			this.canvasProperties.nextRowRange.from=this.calculateModelRowIndexForFirstDomRow(this.canvasProperties.scrollTop);
			var rangeToIndex=Math.min(this.modelRowCount-1,this.canvasProperties.nextRowRange.from+this.canvasProperties.maxRowCount-1);
			this.canvasProperties.nextRowRange.to=Math.max(this.canvasProperties.nextRowRange.from,rangeToIndex);
			this.rowCacheHandler.deleteOutsideRowCacheElements(this.pg2_canvas, this.canvasProperties.nextRowRange);
			var addedRowCacheElements:RowCacheElement[]=this.rowCacheHandler.addNotExistingRowCacheElements(this.canvasProperties.nextRowRange);
		} else {
			this.canvasProperties.nextRowRange.from=-1;
			this.canvasProperties.nextRowRange.to=-1;
			this.rowCacheHandler.deleteOutsideRowCacheElements(this.pg2_canvas, this.canvasProperties.nextRowRange);
		}
		if (addedRowCacheElements!=null && addedRowCacheElements.length>0) {
			for (var i=0, count=addedRowCacheElements.length;i<count;i++) {
				console.log("add row with index "+addedRowCacheElements[i].globalRowIndex);
				var row:HTMLDivElement=this.buildHTMLRow(addedRowCacheElements[i].globalRowIndex);
				addedRowCacheElements[i].htmlElement=row;
				this.updateInnerCellContent(addedRowCacheElements[i]);
				this.pg2_canvasFragment.appendChild(row);
			}
			this.pg2_canvas.appendChild(this.pg2_canvasFragment);
		}
		this.canvasProperties.renderedScrollTop=this.canvasProperties.scrollTop;
		this.canvasProperties.renderedRowRange.from=this.canvasProperties.nextRowRange.from;
		this.canvasProperties.renderedRowRange.to=this.canvasProperties.nextRowRange.to;
	}

	buildHTMLRow(domRowIndex: number): HTMLDivElement {
		var evenodd:string=(domRowIndex%2==0)?"even":"odd";
		var row: HTMLDivElement = <HTMLDivElement> document.createElement("div");
		row.className="pg2-row pg2-row-" + domRowIndex + " pg2-row-"+evenodd;
		row.style.cssText="top: " + (this.canvasProperties.rowHeightInPixel * domRowIndex) + "px;";
		//var row: JQuery = $("<div class='pg2-row pg2-row-" + domRowIndex + " pg2-row-"+evenodd+"' style='top: " + (this.rowHeight * domRowIndex) + "px;'></div>");
		this.buildHTMLCell(row,domRowIndex);
		return row;
	}

	buildHTMLCell(row: HTMLDivElement, domRowIndex: number) {
		for (var i = 0; i < this.modelColumnsCount; i++) {
			var col: HTMLDivElement = <HTMLDivElement> document.createElement("div");
			col.className="pg2-cell pg2-col-" + i;
			col.style.width=this.headerHandler.getHeaderCellFromIndex(i).origWidth+"px";
			row.appendChild(col);			
			//row.append($("<div class='pg2-cell pg2-col-" + i + "' style='width: 100px;'></div>"));
		}
	}

	updateInnerCellContent(rowCacheElement: RowCacheElement) {
		if (rowCacheElement.globalRowIndex>=0) {
			let columnCount: number=rowCacheElement.htmlElement.childElementCount;
			let modelGridRow: IGridRow=this.gridModel.getRow(rowCacheElement.globalRowIndex);
			for (var i=0;i<columnCount;i++) {
				var columnElement: HTMLDivElement=<HTMLDivElement>rowCacheElement.htmlElement.childNodes[i];
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

	calculateModelRowIndexForFirstDomRow(scrollTopExplizit: number) : number {
		var firstModelRowIndex: number=Math.floor(scrollTopExplizit/this.canvasProperties.rowHeightInPixel);
		console.log("First visible model row index is: "+firstModelRowIndex);
		firstModelRowIndex-=this.canvasProperties.overflowRowCount;
		if (firstModelRowIndex+this.rowCacheHandler.getRowCacheElementCount()>this.modelRowCount) {
			firstModelRowIndex=this.modelRowCount-this.rowCacheHandler.getRowCacheElementCount();
		}
		if (firstModelRowIndex<0) {
			firstModelRowIndex=0;
		}
		console.log("Model row for dom row 0 is: "+firstModelRowIndex);
		return firstModelRowIndex;
	}

	onScrollH(currentScrollLeft: number) {
		if (this.canvasProperties.scrollLeft!=currentScrollLeft) {
			this.canvasProperties.scrollLeft=currentScrollLeft;
			var count=this.pg2_header_row.childElementCount;
			for (var i=0;i<count;i++) {
				var child:HTMLDivElement=<HTMLDivElement>this.pg2_header_row.children[i];
				child.style.left=""+(-this.canvasProperties.scrollLeft)+"px";
			}
		}
	}

	onScrollV(currentScrollTop: number) {
		var timerStopped: boolean=false;
		if (currentScrollTop!=this.canvasProperties.scrollTop) {
			timerStopped=this.clearRenderTimer();
		}
		this.canvasProperties.scrollDiffRows=Math.abs(currentScrollTop-this.canvasProperties.renderedScrollTop)/this.canvasProperties.rowHeightInPixel;
		if (timerStopped || (this.canvasProperties.scrollDiffRows>0 && this.canvasProperties.scrollDiffRows>this.canvasProperties.overflowRowCount)) {
			this.canvasProperties.scrollTop=currentScrollTop;
			if (this.canvasProperties.scrollTop>(this.canvasProperties.canvasHeightForRowsInPixel-this.height)) {
				this.canvasProperties.scrollTop=(this.canvasProperties.canvasHeightForRowsInPixel-this.height);
			}
			if (!timerStopped && this.canvasProperties.scrollDiffRows<this.canvasProperties.maxVisibleRowCount) {
				this.render();
			} else {
				this.startRenderTimer();
			}
		}
	}

	onScroll(caller : HTMLDivElement) {
		this.onScrollH(caller.scrollLeft);
		this.onScrollV(caller.scrollTop);
	}

	measureRow() {
		var dummyRow : HTMLDivElement=this.buildHTMLRow(0);
		this.pg2_canvas.appendChild(dummyRow);
		this.canvasProperties.rowHeightInPixel=dummyRow.clientHeight;//.outerHeight(true);
		console.log("Row height: "+this.canvasProperties.rowHeightInPixel+"px");
		this.pg2_canvas.removeChild(dummyRow);//.children().first().remove();
	}

	measureCanvasHeight() {
		this.canvasProperties.canvasHeightForRowsInPixel=this.canvasProperties.rowHeightInPixel*this.modelRowCount;
		this.pg2_canvas.style.height=""+this.canvasProperties.canvasHeightForRowsInPixel+"px";
		console.log("Canvas Height: "+this.canvasProperties.canvasHeightForRowsInPixel);
	}

	measureVisibleRows() {
		this.canvasProperties.maxVisibleRowCount=this.canvasProperties.viewportHightForRowsInPixel/this.canvasProperties.rowHeightInPixel;
		this.canvasProperties.maxVisibleRowCount=Math.ceil(this.canvasProperties.maxVisibleRowCount);
		console.log("Max visible Dom rows: "+this.canvasProperties.maxVisibleRowCount);
	}

	measureMaxDomRows() {
		this.canvasProperties.maxRowCount=this.canvasProperties.maxVisibleRowCount*2;
		this.canvasProperties.overflowRowCount=Math.max(1, Math.floor((this.canvasProperties.maxRowCount-this.canvasProperties.maxVisibleRowCount)/2));

		console.log("Max Dom rows count: "+this.canvasProperties.maxRowCount);
		console.log("Overflow row buffer count: "+this.canvasProperties.overflowRowCount);
	}

	onNewModelRowAddedLater() {
		this.measureCanvasHeight();
		this.render();
	}

	onModelRowDeletedLater() {
		this.measureCanvasHeight();
		this.render();
	}
}
