System.register(['./grid/gridmodel', './grid/grid'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var gridmodel_1, grid_1;
    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
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
                    fieldValueName: 'value',
                    headerColumns: [
                        {
                            id: '1',
                            name: 'Zeilennummer',
                        },
                        {
                            id: '1',
                            name: 'Total',
                            renderer: function (grid, row, column) {
                                var r = document.createElement("span");
                                r.style.cssText = "width: " + column.value + "%;";
                                r.className = 'barbox';
                                return r;
                            }
                        },
                        {
                            id: '1',
                            name: 'R2D2',
                            renderer: function (grid, row, column) {
                                var r = document.createElement("span");
                                r.style.cssText = "width: " + column.value + "%; background: coral;";
                                r.className = 'barbox';
                                return r;
                            }
                        },
                        {
                            id: '1',
                            name: '01/2016'
                        },
                        {
                            id: '1',
                            name: '02/2016'
                        },
                        {
                            id: '1',
                            name: '03/2016'
                        },
                        {
                            id: '1',
                            name: '04/2016'
                        },
                        {
                            id: '1',
                            name: '05/2016'
                        },
                        {
                            id: '1',
                            name: '06/2016'
                        },
                        {
                            id: '1',
                            name: '07/2016'
                        },
                        {
                            id: '1',
                            name: '08/2016'
                        },
                        {
                            id: '1',
                            name: '09/2016'
                        },
                        {
                            id: '1',
                            name: '10/2016'
                        }
                    ],
                    rows: []
                };
                for (var i = 0; i < 5; i++) {
                    myGridData.rows.push({
                        rowId: i,
                        columns: [
                            {
                                value: '#' + i
                            }, {
                                value: "" + getRandom(1, 100)
                            }, {
                                value: "" + getRandom(1, 100)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }, {
                                value: "" + getRandom(0, 1000)
                            }
                        ]
                    });
                }
                var myParentContainer = document.querySelector("#container");
                var myGrid = new grid_1.Grid(1200, 700, myParentContainer, new gridmodel_1.GridModel(myGridData));
                var buttonAdd = document.createElement("button");
                buttonAdd.innerHTML = "Add 1K rows";
                buttonAdd.onclick = function () {
                    console.log("Button ADD clicked");
                    var rows = [];
                    for (var i = 0; i < 1000; i++) {
                        rows.push({
                            rowId: i,
                            columns: [
                                {
                                    value: '#' + (myGrid.gridModel.getRowCount() + i)
                                }, {
                                    value: "" + getRandom(1, 100)
                                }, {
                                    value: "" + getRandom(1, 100)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }, {
                                    value: "" + getRandom(0, 1000)
                                }
                            ]
                        });
                    }
                    myGrid.appendModelRows(rows);
                };
                myParentContainer.appendChild(buttonAdd);
                var buttonRemove = document.createElement("button");
                buttonRemove.innerHTML = "Remove 1K rows";
                myParentContainer.appendChild(buttonRemove);
                buttonRemove.onclick = function () {
                    console.log("Button REMOVE clicked");
                    var x = [];
                    for (var i = 0; i < 1000; i++) {
                        x.push(myGrid.gridModel.getRowCount() - 1 - i);
                    }
                    myGrid.removeModelRows(x);
                };
            });
        }
    }
});
