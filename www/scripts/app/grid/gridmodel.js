System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var GridModel;
    return {
        setters:[],
        execute: function() {
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
                GridModel.prototype.getFieldValueName = function () {
                    return this.gridData.fieldValueName;
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
                GridModel.prototype.removeRow = function (index) {
                    if (index >= 0 && index < this.gridData.rows.length) {
                        this.gridData.rows.splice(index, 1);
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
//# sourceMappingURL=c:/Users/pam/programmierung/typescript-playground/scripts/app/grid/gridmodel.js.map