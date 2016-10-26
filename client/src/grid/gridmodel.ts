interface IGridColumn {
    value : string;
}

interface IGridHeaderColumn {
    value : string;
}

interface IGridRow {
    rowId: number;
    columns : Array<IGridColumn>;
}

export interface IGridData {
    headerColumns : Array<IGridHeaderColumn>;
    rows : Array<IGridRow>;
}

class GridColumn implements IGridColumn {
    constructor(private mValue: string) {
    }
    get value() : string {
        return this.value;
    }
}

class GridRow implements IGridRow {
    columns : Array<IGridColumn>;
    constructor(private mRowId : number) {
        this.columns = new Array<GridColumn>();
    }
    get rowId() : number {
        return this.mRowId;
    }
    public addColumn(gridColumn: IGridColumn) : void {
        this.columns.push(gridColumn);
    }
    public getColumn(columnIndex: number) : IGridColumn {
        var rv: IGridColumn = null;
        if (columnIndex>=0 && columnIndex<this.columns.length) {
            rv=this.columns[columnIndex];
        }
        return rv;
    }
}


export interface IGridModel {
    isRowsDefined() : boolean;
    isHeaderColumnsDefined() : boolean;

    getRowCount() : number;
    getColumnCount(): number;
    addRow(gridRow : IGridRow) :void;
    getRow(rowIndex : number) : IGridRow;
    getHeaderColumn(colIndex: number) : IGridHeaderColumn;
}

export class GridModel implements IGridModel {
    gridData: IGridData;
    constructor(gridData : IGridData) {
        this.gridData=gridData;
    }
    isRowsDefined() : boolean {
        return this.gridData.rows!=null?true:false;
    }
    isHeaderColumnsDefined() : boolean {
        return this.gridData.headerColumns!=null?true:false;
    }

    getRowCount() : number {
        return this.gridData.rows.length;
    }

    getColumnCount() : number {
        return this.gridData.headerColumns.length;
    }
    getHeaderColumn(colIndex: number) : IGridHeaderColumn {
        var rv : IGridHeaderColumn=null;
        if (colIndex>=0 && colIndex<this.getColumnCount()) {
            rv=this.gridData.headerColumns[colIndex];
        }
        return rv;
    }
    
    addRow(gridRow : IGridRow) : void {
        if (gridRow) {
            this.gridData.rows.push(gridRow);
        }
    }
    public getRow(rowIndex: number) : IGridRow {
        var rv: IGridRow = null;
        if (rowIndex>=0 && rowIndex<this.gridData.rows.length) {
            rv=this.gridData.rows[rowIndex];
        }
        return rv;
    }
}
