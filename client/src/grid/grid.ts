import {IGridModel, GridModel, IGridData} from './gridmodel';

export class Grid {
	modelOK: boolean;
	lineHeight: number;
	constructor(private mParentContainer: JQuery, private mGridModel : IGridModel) {
		this.modelOK=this.checkModel();
		this.createList();
	}

	get parentContainer() : JQuery {
		return this.mParentContainer;
	}
	get gridModel() : IGridModel {
		return this.mGridModel;
	}
	pg2 : JQuery;
	pg2_header : JQuery;
	pg2_header_row : JQuery;
	pg2_viewport : JQuery;
	pg2_canvas : JQuery;


	checkModel() : boolean {
		var rv:boolean=true;
		if (!this.mGridModel.isHeaderColumnsDefined()) {
			rv=false;
			console.error("Grid: no headerColumns defined in model");
		} else if (!this.mGridModel.isRowsDefined()) {
			rv=false;
			console.error("Grid: no rows defined in model");
		}
		var headerColumnCount: number = this.mGridModel.getColumnCount();
		for (var i=0, count=this.mGridModel.getColumnCount();i<count;i++) {
			if (this.mGridModel.getRow(i).rowId==undefined || this.mGridModel.getRow(i).rowId==null) {
				console.error("Grid: grid row with rowIndex "+i+" has no rowId");
			} 
			if (this.mGridModel.getRow(i).columns.length!=headerColumnCount) {
				rv=false;
				console.error("Grid: Column count in grid row with rowIndex "+i+" is "+this.mGridModel.getRow(i).columns.length+" columns, but the header has a count of "+headerColumnCount+" columns");
			}
		}
		return rv;
	}

	createList() {
		if (this.modelOK) {
			var headerColsCount : number=this.mGridModel.getColumnCount();
			console.log("Header Columns count: "+headerColsCount);
			var lines : number=this.mGridModel.getRowCount();

			this.pg2=$("<div class='pg2' style='width: 600px; height: 500px; overflow: hidden; position: relative'></div>");
			this.mParentContainer.append(this.pg2);
			this.pg2_header=$("<div class='pg2-header' style='overflow: hidden; position: relative;'></div>");
			// header
			this.pg2.append(this.pg2_header);
			this.pg2_header_row=$("<div class='pg2-header-row' style='width: 1600px;'></div>");
			this.pg2_header.append(this.pg2_header_row);
			for (var i=0;i<headerColsCount;i++) {
				this.pg2_header_row.append("<div class='pg2-header-cell pg2-header-cell-unsorted pg2-col-"+i+"' style='width: 100px;' onclick='onColumnHeaderClicked(this,"+i+",true)'>"+this.mGridModel.getHeaderColumn(i).value+"</div>");
			}
			// body
			this.pg2_viewport=$("<div class='pg2-viewport'  onscroll='onScrollCanvas(this)' style='width: 100%; overflow: auto; position: relative; height: 474px;'></div>");
			this.pg2.append(this.pg2_viewport);
			this.pg2_canvas=$("<div class='pg2-canvas' style='width: "+(headerColsCount*103.6)+"px; height: 12000px;'></div>");
			this.pg2_viewport.append(this.pg2_canvas);
			for (var l=0;l<lines;l++) {
				let row:JQuery=this.buildRow(l);
				this.pg2_canvas.append(row);
				if (l==0) {
					this.lineHeight=$(row).outerHeight(true);
				}
			}
		}
	}

	buildRow(modelRowIndex : number) : JQuery {
		var row : JQuery=$("<div class='pg2-row pg2-row-"+modelRowIndex+"' style='top: "+(this.lineHeight*modelRowIndex)+"px;'></div>");
		this.appendColumnsToRow(modelRowIndex, row);
		return row;
	}
	appendColumnsToRow(modelRowIndex: number, row : JQuery) {
		var rowColsCount=this.mGridModel.getRow(modelRowIndex).columns.length;
		console.log("Columns count for this row: "+rowColsCount);

		for (var i=0, headerColsCount=this.mGridModel.getColumnCount();i<headerColsCount && i<rowColsCount;i++) {
			row.append($("<div class='pg2-cell pg2-col-"+i+"' style='width: 100px;'>"+this.gridModel.getRow(modelRowIndex).rowId+"/"+this.gridModel.getRow(modelRowIndex).columns[i].value+"</div>"));
		}
	}
}
