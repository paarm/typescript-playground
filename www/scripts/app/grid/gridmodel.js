System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var GridColumn, GridRow, GridModel;
    return {
        setters:[],
        execute: function() {
            GridColumn = (function () {
                function GridColumn(mValue) {
                    this.mValue = mValue;
                }
                Object.defineProperty(GridColumn.prototype, "value", {
                    get: function () {
                        return this.value;
                    },
                    enumerable: true,
                    configurable: true
                });
                return GridColumn;
            }());
            GridRow = (function () {
                function GridRow(mRowId) {
                    this.mRowId = mRowId;
                    this.columns = new Array();
                }
                Object.defineProperty(GridRow.prototype, "rowId", {
                    get: function () {
                        return this.mRowId;
                    },
                    enumerable: true,
                    configurable: true
                });
                GridRow.prototype.addColumn = function (gridColumn) {
                    this.columns.push(gridColumn);
                };
                GridRow.prototype.getColumn = function (columnIndex) {
                    var rv = null;
                    if (columnIndex >= 0 && columnIndex < this.columns.length) {
                        rv = this.columns[columnIndex];
                    }
                    return rv;
                };
                return GridRow;
            }());
            GridModel = (function () {
                function GridModel(gridData) {
                    this.gridData = gridData;
                }
                GridModel.prototype.isRowsDefined = function () {
                    return this.gridData.rows != null ? true : false;
                };
                GridModel.prototype.isHeaderColumnsDefined = function () {
                    return this.gridData.headerColumns != null ? true : false;
                };
                GridModel.prototype.getRowCount = function () {
                    return this.gridData.rows.length;
                };
                GridModel.prototype.getColumnCount = function () {
                    return this.gridData.headerColumns.length;
                };
                GridModel.prototype.getHeaderColumn = function (colIndex) {
                    var rv = null;
                    if (colIndex >= 0 && colIndex < this.getColumnCount()) {
                        rv = this.gridData.headerColumns[colIndex];
                    }
                    return rv;
                };
                GridModel.prototype.addRow = function (gridRow) {
                    if (gridRow) {
                        this.gridData.rows.push(gridRow);
                    }
                };
                GridModel.prototype.getRow = function (rowIndex) {
                    var rv = null;
                    if (rowIndex >= 0 && rowIndex < this.gridData.rows.length) {
                        rv = this.gridData.rows[rowIndex];
                    }
                    return rv;
                };
                return GridModel;
            }());
            exports_1("GridModel", GridModel);
        }
    }
});
//# sourceMappingURL=c:/Users/Martin/typescript_playground/NodeServer/scripts/app/grid/gridmodel.js.map