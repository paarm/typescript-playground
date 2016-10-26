System.register(['./grid/gridmodel', './grid/grid'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var gridmodel_1, grid_1;
    return {
        setters:[
            function (gridmodel_1_1) {
                gridmodel_1 = gridmodel_1_1;
            },
            function (grid_1_1) {
                grid_1 = grid_1_1;
            }],
        execute: function() {
            $(document).ready(function () {
                console.log('Document is ready');
                var myGridData = {
                    headerColumns: [
                        {
                            value: 'Überschrift 1'
                        },
                        {
                            value: 'Überschrift 2'
                        }
                    ],
                    rows: [
                        {
                            rowId: 1,
                            columns: [
                                {
                                    value: 'Column 1'
                                },
                                {
                                    value: 'Column 2'
                                }
                            ]
                        },
                        {
                            rowId: 2,
                            columns: [
                                {
                                    value: 'Column 1'
                                },
                                {
                                    value: 'Column 2'
                                }
                            ]
                        },
                        {
                            rowId: 3,
                            columns: [
                                {
                                    value: 'Column 1'
                                },
                                {
                                    value: 'Column 2'
                                }
                            ]
                        },
                        {
                            rowId: 4,
                            columns: [
                                {
                                    value: 'Column 1'
                                },
                                {
                                    value: 'Column 2'
                                }
                            ]
                        },
                        {
                            rowId: 5,
                            columns: [
                                {
                                    value: 'Column 1'
                                },
                                {
                                    value: 'Column 2'
                                }
                            ]
                        },
                        {
                            rowId: 6,
                            columns: [
                                {
                                    value: 'Column 1'
                                },
                                {
                                    value: 'Column 2'
                                }
                            ]
                        }
                    ]
                };
                var myParentContainer = $('body');
                var myGrid = new grid_1.Grid(myParentContainer, new gridmodel_1.GridModel(myGridData));
            });
        }
    }
});
//# sourceMappingURL=c:/Users/Martin/typescript_playground/NodeServer/scripts/app/test.js.map