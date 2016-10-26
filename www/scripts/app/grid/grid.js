System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Grid;
    return {
        setters:[],
        execute: function() {
            Grid = (function () {
                function Grid(mParentContainer, mGridModel) {
                    this.mParentContainer = mParentContainer;
                    this.mGridModel = mGridModel;
                    this.modelOK = this.checkModel();
                    this.createList();
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
                Grid.prototype.createList = function () {
                    if (this.modelOK) {
                        var headerColsCount = this.mGridModel.getColumnCount();
                        var lines = this.mGridModel.getRowCount();
                        this.pg2 = $("<div class='pg2' style='width: 600px; height: 500px; overflow: hidden; position: relative'></div>");
                        this.mParentContainer.append(this.pg2);
                        this.pg2_header = $("<div class='pg2-header' style='overflow: hidden; position: relative;'></div>");
                        this.pg2.append(this.pg2_header);
                        this.pg2_header_row = $("<div class='pg2-header-row' style='width: 1600px;'></div>");
                        this.pg2_header.append(this.pg2_header_row);
                        for (var i = 0; i < headerColsCount; i++) {
                            this.pg2_header_row.append("<div class='pg2-header-cell pg2-header-cell-unsorted pg2-col-" + i + "' style='width: 100px;' onclick='onColumnHeaderClicked(this," + i + ",true)'>" + this.mGridModel.getHeaderColumn(i).value + "</div>");
                        }
                        this.pg2_viewport = $("<div class='pg2-viewport'  onscroll='onScrollCanvas(this)' style='width: 100%; overflow: auto; position: relative; height: 474px;'></div>");
                        this.pg2.append(this.pg2_viewport);
                        this.pg2_canvas = $("<div class='pg2-canvas' style='width: " + (headerColsCount * 103.6) + "px; height: 12000px;'></div>");
                        this.pg2_viewport.append(this.pg2_canvas);
                        for (var l = 0; l < lines; l++) {
                            this.appendRow(this.pg2_canvas, this.buildRow(l));
                        }
                    }
                };
                Grid.prototype.buildRow = function (modelRowIndex) {
                    var row = $("<div class='pg2-row pg2-row-" + modelRowIndex + "' style='top: " + (30 * modelRowIndex) + "px;'></div>");
                    this.appendColumnsToRow(modelRowIndex, row);
                    return row;
                };
                Grid.prototype.appendColumnsToRow = function (modelRowIndex, row) {
                    var rowColsCount = this.mGridModel.getRow(modelRowIndex).columns.length;
                    for (var i = 0, headerColsCount = this.mGridModel.getColumnCount(); i < headerColsCount && i < rowColsCount; i++) {
                        row.append("<div class='pg2-cell pg2-col-" + i + "' style='width: 100px;'>" + this.gridModel.getRow(modelRowIndex).rowId + "/" + this.gridModel.getRow(modelRowIndex).columns[i].value + "</div>");
                    }
                };
                Grid.prototype.appendRow = function (rowContainer, row) {
                    rowContainer.append(row);
                    return row;
                };
                return Grid;
            }());
            exports_1("Grid", Grid);
        }
    }
});
//# sourceMappingURL=/home/pam/Programmierung/gitrepos/typescript-playground/scripts/app/grid/grid.js.map