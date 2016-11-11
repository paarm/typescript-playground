System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var DomRow, HeaderColumnResizeData, Grid;
    return {
        setters:[],
        execute: function() {
            DomRow = (function () {
                function DomRow(domRowElement, linkedModelRowIndex, top) {
                    this.domRowElement = domRowElement;
                    this.linkedModelRowIndex = linkedModelRowIndex;
                    this.top = top;
                }
                return DomRow;
            }());
            HeaderColumnResizeData = (function () {
                function HeaderColumnResizeData() {
                }
                return HeaderColumnResizeData;
            }());
            Grid = (function () {
                function Grid(width, height, mParentContainer, mGridModel) {
                    this.width = width;
                    this.height = height;
                    this.mParentContainer = mParentContainer;
                    this.mGridModel = mGridModel;
                    this.modelOK = true;
                    this.headerHeight = 0;
                    this.viewportHeight = 0;
                    this.rowHeightInPixel = 0;
                    this.modelColumnsCount = 0;
                    this.canvasHeightInPixel = 0;
                    this.currentDomRowsCount = 0;
                    this.maxDomRowsCount = 0;
                    this.maxVisibleDomRows = 0;
                    this.overflowRowBufferCount = 0;
                    this.overflowRowBufferInPixel = 0;
                    this.domRows = [];
                    this.scrollTop = 0;
                    this.scrollLeft = 0;
                    this.renderedScrollTop = 0;
                    this.renderedScrollLeft = 0;
                    this.topDomRowIndex = 0;
                    this.bottomDomRowIndex = 0;
                    this.pg2_canvasInitialChildsFragment = document.createDocumentFragment();
                    this.scrollVRenderTimer = -1;
                    this.scrollDiffRows = 0;
                    this.headerColumnResizeData = new HeaderColumnResizeData();
                    this.modelOK = this.checkModel();
                    console.log("Model Rows count: " + this.modelRowCount);
                    this.modelColumnsCount = this.mGridModel.getColumnCount();
                    console.log("Model Columns count: " + this.modelColumnsCount);
                    this.createBaseList();
                    this.createInitialDomRows();
                    document.documentElement.addEventListener("mouseup", $.proxy(this.onGlobalMouseUp, this));
                    document.documentElement.addEventListener("mousemove", $.proxy(this.onGlobalMouseMove, this));
                }
                Object.defineProperty(Grid.prototype, "modelRowCount", {
                    get: function () {
                        return this.mGridModel.getRowCount();
                    },
                    enumerable: true,
                    configurable: true
                });
                Grid.prototype.appendModelRow = function (rIGridRow) {
                    if (rIGridRow != null) {
                        this.gridModel.addRow(rIGridRow);
                        this.onNewModelRowAddedLater();
                    }
                };
                Grid.prototype.appendModelRows = function (rIGridRows) {
                    if (rIGridRows != null) {
                        for (var i = 0; i < rIGridRows.length; i++) {
                            this.gridModel.addRow(rIGridRows[i]);
                        }
                        this.onNewModelRowAddedLater();
                    }
                };
                Grid.prototype.removeModelRow = function (index) {
                    this.gridModel.removeRow(index);
                    this.onModelRowDeletedLater();
                };
                Grid.prototype.removeModelRows = function (indexes) {
                    if (indexes != null) {
                        indexes.sort(function (a, b) {
                            var r = 0;
                            if (a > b) {
                                r = 1;
                            }
                            else if (a < b) {
                                r = -1;
                            }
                            return r;
                        });
                        for (var i = indexes.length - 1; i >= 0; i--) {
                            this.gridModel.removeRow(indexes[i]);
                        }
                        this.onModelRowDeletedLater();
                    }
                };
                Object.defineProperty(Grid.prototype, "parentContainer", {
                    get: function () {
                        return this.mParentContainer;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Grid.prototype, "gridModel", {
                    get: function () {
                        return this.mGridModel;
                    },
                    enumerable: true,
                    configurable: true
                });
                Grid.prototype.checkModel = function () {
                    var rv = true;
                    if (!this.mGridModel.isHeaderColumnsDefined()) {
                        rv = false;
                        console.error("Grid: no headerColumns defined in model");
                    }
                    else if (!this.mGridModel.isRowsDefined()) {
                        rv = false;
                        console.error("Grid: no rows defined in model");
                    }
                    var headerColumnCount = this.mGridModel.getColumnCount();
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
                };
                Grid.prototype.createBaseList = function () {
                    if (this.modelOK) {
                        console.log("Header Columns count: " + this.modelColumnsCount);
                        var lines = this.mGridModel.getRowCount();
                        this.pg2 = document.createElement("div");
                        this.pg2.style.cssText = "width: " + this.width + "px; height: " + this.height + "px; overflow: hidden; position: relative";
                        this.pg2.className = "pg2";
                        this.mParentContainer.appendChild(this.pg2);
                        this.pg2_header = document.createElement("div");
                        this.pg2_header.style.cssText = 'overflow: hidden; position: relative;';
                        this.pg2_header.className = "pg2-header";
                        this.pg2.appendChild(this.pg2_header);
                        this.pg2_header_row = document.createElement("div");
                        this.pg2_header_row.className = "pg2-header-row";
                        this.pg2_header.appendChild(this.pg2_header_row);
                        var headerWidth = 0;
                        for (var i = 0; i < this.modelColumnsCount; i++) {
                            var headerColumn = document.createElement("div");
                            headerColumn.style.cssText = 'width: 100px;';
                            headerColumn.className = "pg2-header-cell pg2-header-cell-unsorted pg2-col-" + i + "";
                            this.pg2_header_row.appendChild(headerColumn);
                            if (i == 0) {
                                headerWidth = headerColumn.clientWidth;
                            }
                            var span = document.createElement("span");
                            var textElement = document.createTextNode(this.mGridModel.getHeaderColumn(i).name);
                            span.appendChild(textElement);
                            var handleElement = document.createElement("div");
                            handleElement.addEventListener("mousedown", $.proxy(this.onHandlerElementMouseDown, this, handleElement, headerColumn));
                            handleElement.className = "columnSizeHandle";
                            headerColumn.appendChild(span);
                            headerColumn.appendChild(handleElement);
                        }
                        this.pg2_header_row.style.width = "" + headerWidth + "px;";
                        this.headerHeight = this.pg2_header_row.clientHeight;
                        this.viewportHeight = this.height - this.headerHeight;
                        this.pg2_viewport = document.createElement("div");
                        this.pg2_viewport.style.cssText = "width: 100%; overflow: auto; position: relative; height: " + this.viewportHeight + "px;";
                        this.pg2_viewport.className = "pg2-viewport";
                        this.pg2.appendChild(this.pg2_viewport);
                        this.pg2_canvas = document.createElement("div");
                        this.pg2_canvas.style.cssText = "width: " + (this.modelColumnsCount * 103.6) + "px; height: 30px;";
                        this.pg2_canvas.className = "pg2-canvas";
                        this.pg2_viewport.appendChild(this.pg2_canvas);
                        this.measureRow();
                        this.measureCanvasHeight();
                        this.measureVisibleRows();
                        this.measureMaxDomRows();
                        $(".pg2-viewport").scroll({ grid: this, caller: this.pg2_viewport }, function (eventObject) {
                            eventObject.data.grid.onScroll.call(eventObject.data.grid, eventObject.data.caller);
                        });
                    }
                };
                Grid.prototype.onHandlerElementMouseDown = function (handleElement, headerColumn, ev) {
                    this.headerColumnResizeData.headerColumn = headerColumn;
                    this.headerColumnResizeData.startX = ev.clientX;
                    this.headerColumnResizeData.clientLeft = this.headerColumnResizeData.startX - headerColumn.clientWidth;
                    this.headerColumnResizeData.origWidth = headerColumn.clientWidth;
                    console.log("on mouse down. X: " + this.headerColumnResizeData.startX);
                };
                Grid.prototype.onGlobalMouseMove = function (ev) {
                    if (this.headerColumnResizeData.headerColumn != null) {
                        this.onColumnUpdateResize(ev);
                    }
                };
                Grid.prototype.onGlobalMouseUp = function (ev) {
                    if (this.headerColumnResizeData.headerColumn != null) {
                        this.onColumnResizeEnded(ev);
                        this.headerColumnResizeData.headerColumn = null;
                        this.headerColumnResizeData.startX = 0;
                    }
                };
                Grid.prototype.onColumnUpdateResize = function (ev) {
                    console.log("on column resize update. X: " + ev.clientX);
                    var diff = ev.clientX - this.headerColumnResizeData.startX;
                    var min = this.headerColumnResizeData.clientLeft + 30;
                    console.log("client left: " + this.headerColumnResizeData.clientLeft);
                    if (ev.clientX >= min) {
                        this.headerColumnResizeData.headerColumn.style.width = (this.headerColumnResizeData.origWidth + diff) + "px";
                    }
                };
                Grid.prototype.onColumnResizeEnded = function (ev) {
                    console.log("on column resize ended");
                };
                Grid.prototype.onHandlerHeaderRowMouseMove = function (headerRow, ev) {
                    if (this.headerColumnResizeData.headerColumn != null) {
                        this.headerColumnResizeData.headerColumn.style.width = (this.headerColumnResizeData.headerColumn.clientWidth + 1) + "px";
                    }
                };
                Grid.prototype.startRenderTimer = function () {
                    this.scrollVRenderTimer = setTimeout($.proxy(this.onScrollVRenderTimerTimedOut, this), 50);
                };
                Grid.prototype.clearRenderTimer = function () {
                    var rv = false;
                    if (this.scrollVRenderTimer != -1) {
                        clearTimeout(this.scrollVRenderTimer);
                        this.scrollVRenderTimer = -1;
                        rv = true;
                    }
                    return rv;
                };
                Grid.prototype.onScrollVRenderTimerTimedOut = function () {
                    console.log("renderer called");
                    if (this.scrollDiffRows < this.currentDomRowsCount) {
                        if (this.scrollTop > this.renderedScrollTop) {
                            while (true) {
                                if (this.domRows[this.bottomDomRowIndex].linkedModelRowIndex + 1 >= this.modelRowCount) {
                                    break;
                                }
                                var topElementDiff = this.scrollTop - this.domRows[this.topDomRowIndex].top;
                                if (topElementDiff > this.overflowRowBufferInPixel) {
                                    this.moveTopDomRowToBottom();
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        else if (this.scrollTop < this.renderedScrollTop) {
                            while (true) {
                                if (this.domRows[this.topDomRowIndex].linkedModelRowIndex <= 0) {
                                    break;
                                }
                                var topElementDiff = this.scrollTop - this.domRows[this.topDomRowIndex].top;
                                if (topElementDiff < this.overflowRowBufferInPixel) {
                                    this.moveBottomDomRowToTop();
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        this.displayTemporaryUndisplayedRows();
                    }
                    else {
                        var firstRowIndexIs = this.calculateModelRowIndexForFirstDomRow(this.scrollTop);
                        this.resyncDomRowsInModelOrder(firstRowIndexIs);
                    }
                    this.renderedScrollTop = this.scrollTop;
                };
                Grid.prototype.calculateModelRowIndexForFirstDomRow = function (scrollTopExplizit) {
                    var firstModelRowIndex = Math.floor(scrollTopExplizit / this.rowHeightInPixel);
                    console.log("First visible model row index is: " + firstModelRowIndex);
                    firstModelRowIndex -= this.overflowRowBufferCount;
                    if (firstModelRowIndex + this.currentDomRowsCount > this.modelRowCount) {
                        firstModelRowIndex = this.modelRowCount - this.currentDomRowsCount;
                    }
                    if (firstModelRowIndex < 0) {
                        firstModelRowIndex = 0;
                    }
                    console.log("Model row for dom row 0 is: " + firstModelRowIndex);
                    return firstModelRowIndex;
                };
                Grid.prototype.undisplayRowTemporary = function (domRowIndex) {
                    this.domRows[domRowIndex].domRowElement.style.display = "none";
                    this.domRows[domRowIndex].tempHidden = true;
                };
                Grid.prototype.displayTemporaryUndisplayedRow = function (domRowIndex) {
                    if (this.domRows[domRowIndex].tempHidden == true) {
                        this.domRows[domRowIndex].domRowElement.style.display = "block";
                        this.domRows[domRowIndex].tempHidden = false;
                    }
                };
                Grid.prototype.undisplayRowsTemporary = function () {
                    for (var i = 0; i < this.currentDomRowsCount; i++) {
                        this.undisplayRowTemporary(i);
                    }
                };
                Grid.prototype.displayTemporaryUndisplayedRows = function () {
                    for (var i = 0; i < this.currentDomRowsCount; i++) {
                        this.displayTemporaryUndisplayedRow(i);
                    }
                };
                Grid.prototype.resyncDomRowsInModelOrder = function (firstModelRowIndex) {
                    this.undisplayRowsTemporary();
                    var i = 0;
                    this.topDomRowIndex = 0;
                    for (var i = 0; i < this.currentDomRowsCount; i++) {
                        this.domRows[i].top = (firstModelRowIndex + i) * this.rowHeightInPixel;
                        this.domRows[i].domRowElement.style.top = "" + this.domRows[i].top + "px";
                        this.domRows[i].linkedModelRowIndex = firstModelRowIndex + i;
                        this.updateViewContent(this.domRows[i]);
                        this.bottomDomRowIndex = i;
                    }
                    this.displayTemporaryUndisplayedRows();
                    for (var i = 0; i < this.currentDomRowsCount; i++) {
                        this.pg2_canvas.appendChild(this.domRows[i].domRowElement);
                    }
                };
                Grid.prototype.onScrollH = function (currentScrollLeft) {
                    if (this.scrollLeft != currentScrollLeft) {
                        this.scrollLeft = currentScrollLeft;
                        var count = this.pg2_header_row.childElementCount;
                        for (var i = 0; i < count; i++) {
                            var child = this.pg2_header_row.children[i];
                            child.style.left = "" + (-this.scrollLeft) + "px";
                        }
                    }
                };
                Grid.prototype.onScrollV = function (currentScrollTop) {
                    var timerStopped = false;
                    if (currentScrollTop != this.scrollTop) {
                        timerStopped = this.clearRenderTimer();
                    }
                    this.scrollDiffRows = Math.abs(currentScrollTop - this.renderedScrollTop) / this.rowHeightInPixel;
                    if (timerStopped || (this.scrollDiffRows > 0 && this.scrollDiffRows > this.overflowRowBufferCount)) {
                        this.scrollTop = currentScrollTop;
                        if (this.scrollTop > (this.canvasHeightInPixel - this.height)) {
                            this.scrollTop = (this.canvasHeightInPixel - this.height);
                        }
                        this.startRenderTimer();
                    }
                };
                Grid.prototype.onScroll = function (caller) {
                    this.onScrollH(caller.scrollLeft);
                    this.onScrollV(caller.scrollTop);
                };
                Grid.prototype.moveTopDomRowToBottom = function () {
                    console.log("move top dom row to bottom");
                    this.undisplayRowTemporary(this.topDomRowIndex);
                    this.domRows[this.topDomRowIndex].tempHidden = true;
                    this.domRows[this.topDomRowIndex].top = this.domRows[this.bottomDomRowIndex].top + this.rowHeightInPixel;
                    this.domRows[this.topDomRowIndex].domRowElement.style.top = "" + this.domRows[this.topDomRowIndex].top + "px";
                    this.domRows[this.topDomRowIndex].linkedModelRowIndex = this.domRows[this.bottomDomRowIndex].linkedModelRowIndex + 1;
                    this.updateViewContent(this.domRows[this.topDomRowIndex]);
                    this.bottomDomRowIndex = this.topDomRowIndex;
                    this.topDomRowIndex++;
                    if (this.topDomRowIndex >= this.currentDomRowsCount) {
                        this.topDomRowIndex = 0;
                    }
                    this.pg2_canvas.appendChild(this.domRows[this.bottomDomRowIndex].domRowElement);
                };
                Grid.prototype.moveBottomDomRowToTop = function () {
                    console.log("move bottom dom row to top");
                    this.undisplayRowTemporary(this.bottomDomRowIndex);
                    var currentTopDomRowIndex = this.topDomRowIndex;
                    this.domRows[this.bottomDomRowIndex].top = this.domRows[this.topDomRowIndex].top - this.rowHeightInPixel;
                    this.domRows[this.bottomDomRowIndex].domRowElement.style.top = "" + this.domRows[this.bottomDomRowIndex].top + "px";
                    this.domRows[this.bottomDomRowIndex].linkedModelRowIndex = this.domRows[this.topDomRowIndex].linkedModelRowIndex - 1;
                    this.updateViewContent(this.domRows[this.bottomDomRowIndex]);
                    this.topDomRowIndex = this.bottomDomRowIndex;
                    this.bottomDomRowIndex--;
                    if (this.bottomDomRowIndex < 0) {
                        this.bottomDomRowIndex = this.currentDomRowsCount - 1;
                    }
                    this.pg2_canvas.insertBefore(this.domRows[this.topDomRowIndex].domRowElement, this.domRows[currentTopDomRowIndex].domRowElement);
                };
                Grid.prototype.updateViewContent = function (domRow) {
                    if (domRow.linkedModelRowIndex >= 0) {
                        var columnCount = domRow.domRowElement.childElementCount;
                        var modelGridRow = this.gridModel.getRow(domRow.linkedModelRowIndex);
                        for (var i = 0; i < columnCount; i++) {
                            var columnElement = domRow.domRowElement.childNodes[i];
                            while (columnElement.firstChild != null) {
                                columnElement.removeChild(columnElement.firstChild);
                            }
                            if (this.gridModel.getHeaderColumn(i).renderer != null) {
                                var customRenderedElement = this.gridModel.getHeaderColumn(i).renderer(this.gridModel, modelGridRow, modelGridRow.columns[i]);
                                if (customRenderedElement != null) {
                                    columnElement.appendChild(customRenderedElement);
                                }
                            }
                            else {
                                var textElement = document.createTextNode(modelGridRow.columns[i].value);
                                columnElement.appendChild(textElement);
                            }
                        }
                    }
                };
                Grid.prototype.measureRow = function () {
                    var dummyRow = this.buildDomElementForRow(0);
                    this.pg2_canvas.appendChild(dummyRow);
                    this.rowHeightInPixel = dummyRow.clientHeight;
                    console.log("Row height: " + this.rowHeightInPixel + "px");
                    this.pg2_canvas.removeChild(dummyRow);
                };
                Grid.prototype.measureCanvasHeight = function () {
                    this.canvasHeightInPixel = this.rowHeightInPixel * this.modelRowCount;
                    this.pg2_canvas.style.height = "" + this.canvasHeightInPixel + "px";
                    console.log("Canvas Height: " + this.canvasHeightInPixel);
                };
                Grid.prototype.measureVisibleRows = function () {
                    this.maxVisibleDomRows = this.viewportHeight / this.rowHeightInPixel;
                    this.maxVisibleDomRows = Math.ceil(this.maxVisibleDomRows);
                    console.log("Max visible Dom rows: " + this.maxVisibleDomRows);
                };
                Grid.prototype.measureMaxDomRows = function () {
                    this.maxDomRowsCount = this.maxVisibleDomRows * 2;
                    this.overflowRowBufferCount = Math.max(1, Math.floor((this.maxDomRowsCount - this.maxVisibleDomRows) / 2));
                    this.overflowRowBufferInPixel = this.overflowRowBufferCount * this.rowHeightInPixel;
                    console.log("Max Dom rows count: " + this.maxDomRowsCount);
                    console.log("Overflow row buffer count: " + this.overflowRowBufferCount);
                };
                Grid.prototype.createInitialDomRows = function () {
                    var initialDomRowsCount = Math.min(this.maxDomRowsCount, this.modelRowCount);
                    this.topDomRowIndex = -1;
                    this.bottomDomRowIndex = -1;
                    for (var l = 0; l < initialDomRowsCount; l++) {
                        var domRow = this.prepareNewDomRow();
                        if (domRow != null) {
                            domRow.linkedModelRowIndex = l;
                            this.updateViewContent(domRow);
                            this.pg2_canvasInitialChildsFragment.appendChild(domRow.domRowElement);
                        }
                    }
                    this.pg2_canvas.appendChild(this.pg2_canvasInitialChildsFragment);
                };
                Grid.prototype.onNewModelRowAddedLater = function () {
                    this.measureCanvasHeight();
                    var requiredRows = Math.max(0, this.modelRowCount - this.currentDomRowsCount);
                    requiredRows = Math.min(requiredRows, this.maxDomRowsCount - this.currentDomRowsCount);
                    for (var i = 0; i < requiredRows; i++) {
                        var domRow = this.prepareNewDomRow();
                        domRow.linkedModelRowIndex = 0;
                        if (domRow != null) {
                            this.pg2_canvas.appendChild(domRow.domRowElement);
                        }
                    }
                    var firstRowIndexIs = this.calculateModelRowIndexForFirstDomRow(this.pg2_viewport.scrollTop);
                    this.resyncDomRowsInModelOrder(firstRowIndexIs);
                };
                Grid.prototype.onModelRowDeletedLater = function () {
                    var domRowRemoved = [];
                    this.measureCanvasHeight();
                    if (this.currentDomRowsCount > this.modelRowCount) {
                        var toRemoveRowsCount = this.currentDomRowsCount - this.modelRowCount;
                        for (var i = 0; i < toRemoveRowsCount; i++) {
                            domRowRemoved.push(this.domRows.pop());
                            console.log("Removed dom row with index " + (this.currentDomRowsCount - 1));
                            this.currentDomRowsCount--;
                        }
                    }
                    var firstRowIndexIs = this.calculateModelRowIndexForFirstDomRow(this.pg2_viewport.scrollTop);
                    this.resyncDomRowsInModelOrder(firstRowIndexIs);
                    if (domRowRemoved != null) {
                        for (var i = 0; i < domRowRemoved.length; i++) {
                            domRowRemoved[i].domRowElement.remove();
                        }
                    }
                };
                Grid.prototype.prepareNewDomRow = function () {
                    var domRow = null;
                    if (this.topDomRowIndex == -1) {
                        this.topDomRowIndex = 0;
                    }
                    var newDomRowIndex = this.currentDomRowsCount;
                    var row = this.buildDomElementForRow(newDomRowIndex);
                    domRow = new DomRow(row, -1, this.rowHeightInPixel * newDomRowIndex);
                    this.domRows.push(domRow);
                    this.currentDomRowsCount++;
                    this.bottomDomRowIndex++;
                    console.log("Added dom row with index " + newDomRowIndex);
                    return domRow;
                };
                Grid.prototype.buildDomElementForRow = function (domRowIndex) {
                    var evenodd = (domRowIndex % 2 == 0) ? "even" : "odd";
                    var row = document.createElement("div");
                    row.className = "pg2-row pg2-row-" + domRowIndex + " pg2-row-" + evenodd;
                    row.style.cssText = "top: " + (this.rowHeightInPixel * domRowIndex) + "px;";
                    this.appendColumnsToDomRow(row, domRowIndex);
                    return row;
                };
                Grid.prototype.appendColumnsToDomRow = function (row, domRowIndex) {
                    for (var i = 0; i < this.modelColumnsCount; i++) {
                        var col = document.createElement("div");
                        col.className = "pg2-cell pg2-col-" + i;
                        col.style.cssText = 'width: 100px;';
                        row.appendChild(col);
                    }
                };
                return Grid;
            }());
            exports_1("Grid", Grid);
        }
    }
});
//# sourceMappingURL=c:/Users/pam/programmierung/typescript-playground/scripts/app/grid/grid.js.map