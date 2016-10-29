System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var DomRow, Grid;
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
            Grid = (function () {
                function Grid(width, height, mParentContainer, mGridModel) {
                    this.width = width;
                    this.height = height;
                    this.mParentContainer = mParentContainer;
                    this.mGridModel = mGridModel;
                    this.domRows = [];
                    this.modelOK = this.checkModel();
                    this.rowCount = this.mGridModel.getRowCount();
                    console.log("Model Rows count: " + this.rowCount);
                    this.colsCount = this.mGridModel.getColumnCount();
                    console.log("Model Columns count: " + this.colsCount);
                    this.currentDomRows = 0;
                    this.topDomRowIndex = 0;
                    this.createBaseList();
                    this.createInitialDomRows(this.maxDomRows);
                }
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
                };
                Grid.prototype.createBaseList = function () {
                    if (this.modelOK) {
                        console.log("Header Columns count: " + this.colsCount);
                        var lines = this.mGridModel.getRowCount();
                        this.pg2 = $("<div class='pg2' style='width: 600px; height: 500px; overflow: hidden; position: relative'></div>");
                        this.mParentContainer.append(this.pg2);
                        this.pg2_header = $("<div class='pg2-header' style='overflow: hidden; position: relative;'></div>");
                        this.pg2.append(this.pg2_header);
                        this.pg2_header_row = $("<div class='pg2-header-row' style='width: 1600px;'></div>");
                        this.pg2_header.append(this.pg2_header_row);
                        for (var i = 0; i < this.colsCount; i++) {
                            this.pg2_header_row.append("<div class='pg2-header-cell pg2-header-cell-unsorted pg2-col-" + i + "' style='width: 100px;' onclick='onColumnHeaderClicked(this," + i + ",true)'>" + this.mGridModel.getHeaderColumn(i).value + "</div>");
                        }
                        this.pg2_viewport = $("<div class='pg2-viewport' style='width: 100%; overflow: auto; position: relative; height: " + this.height + "px;'></div>");
                        this.pg2.append(this.pg2_viewport);
                        this.pg2_canvas = $("<div class='pg2-canvas' style='width: " + (this.colsCount * 103.6) + "px; height: 30px;'></div>");
                        this.pg2_viewport.append(this.pg2_canvas);
                        this.measureRow();
                        this.measureCanvasHeight();
                        this.measureVisibleRows();
                        this.measureMaxDomRows();
                        this.pg2_canvas.css('height', "" + this.canvasHeight + "px");
                        this.pg2_viewport.scroll({ grid: this, caller: this.pg2_viewport }, function (eventObject) {
                            eventObject.data.grid.onScroll.call(eventObject.data.grid, eventObject.data.caller);
                        });
                    }
                };
                Grid.prototype.onScroll = function (caller) {
                    var lastScrollTop = this.scrollTop;
                    var lastScrollLeft = this.scrollLeft;
                    this.scrollTop = caller.scrollTop();
                    this.scrollLeft = caller.scrollLeft();
                    var diffRows = 0;
                    if (this.scrollTop > lastScrollTop) {
                        diffRows = (this.scrollTop - lastScrollTop) / this.rowHeight;
                    }
                    else if (this.scrollTop < lastScrollTop) {
                        diffRows = (lastScrollTop - this.scrollTop) / this.rowHeight;
                    }
                    if (diffRows > 0) {
                        if (diffRows < this.maxDomRows) {
                            if (this.scrollTop > lastScrollTop) {
                                while (true) {
                                    var topElementDiff = this.scrollTop - this.domRows[this.topDomRowIndex].top;
                                    if (topElementDiff > this.rollingRowBufferPixel) {
                                        this.moveTopRowToBottom();
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            else if (this.scrollTop < lastScrollTop) {
                                while (true) {
                                    var topElementDiff = this.scrollTop - this.domRows[this.topDomRowIndex].top;
                                    if (topElementDiff < this.rollingRowBufferPixel) {
                                        this.moveBottomRowToTop();
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                        }
                    }
                };
                Grid.prototype.moveTopRowToBottom = function () {
                    console.log("move top row to bottom");
                    this.domRows[this.topDomRowIndex].top = this.domRows[this.bottomDomRowIndex].top + this.rowHeight;
                    this.domRows[this.topDomRowIndex].domRowElement.css('top', this.domRows[this.topDomRowIndex].top);
                    this.bottomDomRowIndex = this.topDomRowIndex;
                    this.topDomRowIndex++;
                    if (this.topDomRowIndex >= this.maxDomRows) {
                        this.topDomRowIndex = 0;
                    }
                };
                Grid.prototype.moveBottomRowToTop = function () {
                    console.log("move bottom row to top");
                    this.domRows[this.bottomDomRowIndex].top = this.domRows[this.topDomRowIndex].top - this.rowHeight;
                    this.domRows[this.bottomDomRowIndex].domRowElement.css('top', this.domRows[this.bottomDomRowIndex].top);
                    this.topDomRowIndex = this.bottomDomRowIndex;
                    this.bottomDomRowIndex--;
                    if (this.bottomDomRowIndex < 0) {
                        this.bottomDomRowIndex = this.maxDomRows - 1;
                    }
                };
                Grid.prototype.measureRow = function () {
                    var dummyRow = this.buildRow(0);
                    dummyRow.css('top', '-200px');
                    this.pg2_canvas.append(dummyRow);
                    this.rowHeight = dummyRow.outerHeight(true);
                    console.log("Row height: " + this.rowHeight + "px");
                    this.pg2_canvas.remove('.pg2-row');
                };
                Grid.prototype.measureCanvasHeight = function () {
                    this.canvasHeight = this.rowHeight * this.rowCount;
                    console.log("Canvas Height: " + this.canvasHeight);
                };
                Grid.prototype.measureVisibleRows = function () {
                    this.maxVisibleDomRows = this.height / this.rowHeight;
                    this.maxVisibleDomRows = Math.ceil(this.maxVisibleDomRows);
                    console.log("Max visible Dom rows: " + this.maxVisibleDomRows);
                };
                Grid.prototype.measureMaxDomRows = function () {
                    this.maxDomRows = this.maxVisibleDomRows * 2;
                    this.rollingRowBufferCount = Math.max(1, this.maxVisibleDomRows / 2);
                    this.rollingRowBufferPixel = this.rollingRowBufferCount * this.rowHeight;
                    console.log("Max Dom rows: " + this.maxDomRows);
                };
                Grid.prototype.createInitialDomRows = function (initialDomRowsCount) {
                    this.topDomRowIndex = 0;
                    this.bottomDomRowIndex = initialDomRowsCount - 1;
                    this.currentDomRows = initialDomRowsCount;
                    for (var l = 0; l < initialDomRowsCount; l++) {
                        var row = this.buildRow(l);
                        this.pg2_canvas.append(row);
                        var domRow = new DomRow(row, -1, this.rowHeight * l);
                        this.domRows.push(domRow);
                    }
                };
                Grid.prototype.buildRow = function (domRowIndex) {
                    var row = $("<div class='pg2-row pg2-row-" + domRowIndex + "' style='top: " + (this.rowHeight * domRowIndex) + "px;'></div>");
                    this.appendColumnsToRow(row, domRowIndex);
                    return row;
                };
                Grid.prototype.appendColumnsToRow = function (row, domRowIndex) {
                    for (var i = 0; i < this.colsCount; i++) {
                        row.append($("<div class='pg2-cell pg2-col-" + i + "' style='width: 100px;'>dom row: # " + domRowIndex + "</div>"));
                    }
                };
                return Grid;
            }());
            exports_1("Grid", Grid);
        }
    }
});
//# sourceMappingURL=/home/pam/Programmierung/gitrepos/typescript-playground/scripts/app/grid/grid.js.map