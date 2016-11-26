export class RowRange {
	private marker: boolean;
	constructor(public from: number, public to: number) {}
}

export class RowCacheElement {
	public htmlElement:HTMLDivElement;
	constructor(public globalRowIndex: number) {}
}

export class RowCacheHandler {
	public rowCacheElements: RowCacheElement[]=[];

	public getRowCacheElementCount():number {
		return this.rowCacheElements.length;
	}
	
	public getRowCacheElementByIndex(index:number) : RowCacheElement {
		return this.rowCacheElements[index];
	}

	public searchRowCacheElementByGlobalRowIndex(globalRowIndex: number) : RowCacheElement {
		for(var i=0,count=this.rowCacheElements.length;i<count;i++) {
			if (this.rowCacheElements[i].globalRowIndex==globalRowIndex) {
				return this.rowCacheElements[i];
			}
		}
		return null;
	}
	public addRowCacheEntry(globalRowIndex: number) : RowCacheElement {
		var e=new RowCacheElement(globalRowIndex);
		this.rowCacheElements.push(e);
		return e;
	}

	public deleteOutsideRowCacheElements(parentHTMLElement: HTMLDivElement, rowRange : RowRange) {
		var count=this.rowCacheElements.length;
		for(var i=count-1;i>=0;i--) {
			if (this.rowCacheElements[i].globalRowIndex<rowRange.from||
			this.rowCacheElements[i].globalRowIndex>rowRange.to) {
				parentHTMLElement.removeChild(this.rowCacheElements[i].htmlElement);
				this.rowCacheElements.splice(i,1);
				//delete this.rowCacheElements[i];
			}
		}		
	}

	public addNotExistingRowCacheElements(rowRange : RowRange) : RowCacheElement[] {
		var addedRowCacheElements : RowCacheElement[]=[];
		for (var i=rowRange.from; i<rowRange.to+1;i++) {
			if (this.searchRowCacheElementByGlobalRowIndex(i)==null) {
				addedRowCacheElements.push(this.addRowCacheEntry(i));
			}
		}
		return addedRowCacheElements;
	}
}
