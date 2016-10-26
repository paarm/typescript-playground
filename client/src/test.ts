import {GridModel, IGridData} from './grid/gridmodel';
import {Grid} from './grid/grid';

//Test
$(document).ready(function() {
    console.log('Document is ready');

    var myGridData : IGridData = {
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
    }
    var myParentContainer = $('body');
    var myGrid = new Grid(myParentContainer, new GridModel(myGridData)); 
});
