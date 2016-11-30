class ColumnHeaderElement {
	public htmlElement:HTMLDivElement;
	public htmlResizeElemnt:HTMLDivElement;
	public modelColumnIndex: number=-1;  
	constructor() {}
}

class ColumnHeaderHandler {
	public columnHeaderElements: ColumnHeaderElement[]=[];
	
	public searchHeaderColumnElementByGlobalColumnIndex(columnIndex:number) {
		if (columnIndex>=0 && columnIndex<this.columnHeaderElements.length) {
			return this.columnHeaderElements[columnIndex];
		}
		return null;
	}

	public appendHeaderColumn() : ColumnHeaderElement {
		var columnHeaderElement:ColumnHeaderElement=new ColumnHeaderElement();
		this.columnHeaderElements.push(columnHeaderElement);
		return columnHeaderElement;	
	}
}
