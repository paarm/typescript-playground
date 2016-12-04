export class RowRange {
	constructor(public from: number, public to: number) {}
}

export class RowCacheElement {
	private mHtmlElement:HTMLDivElement;
	constructor(private mGlobalRowIndex: number) {}
	public set htmlElement(htmlElement:HTMLDivElement) {
		this.mHtmlElement=htmlElement;
	}
	public get htmlElement() : HTMLDivElement {
		return this.mHtmlElement;
	}
	public get globalRowIndex() : number {
		return this.mGlobalRowIndex;
	}
}

export class RowCacheHandler {
	private rowCacheElements: RowCacheElement[]=[];

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

	public deleteOutsideRowCacheElements(rowRange : RowRange) : RowCacheElement[] {
		var tmpRowCacheElements : RowCacheElement[]=null;
		var count=this.rowCacheElements.length;
		for(var i=count-1;i>=0;i--) {
			if (this.rowCacheElements[i].globalRowIndex<rowRange.from||this.rowCacheElements[i].globalRowIndex>rowRange.to) {
				if (tmpRowCacheElements==null) {
					tmpRowCacheElements=[];
				}
				tmpRowCacheElements.push(this.rowCacheElements[i]);
				this.rowCacheElements.splice(i,1);
				//delete this.rowCacheElements[i];
			}
		}		
		return tmpRowCacheElements;
	}

	public addNotExistingRowCacheElements(rowRange : RowRange) : RowCacheElement[] {
		var tmpRowCacheElements : RowCacheElement[]=null;
		for (var i=rowRange.from; i<rowRange.to+1;i++) {
			if (this.searchRowCacheElementByGlobalRowIndex(i)==null) {
				if (tmpRowCacheElements==null) {
					tmpRowCacheElements=[];
				}
				tmpRowCacheElements.push(this.addRowCacheEntry(i));
			}
		}
		return tmpRowCacheElements;
	}
}
