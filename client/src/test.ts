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
            },
            {
                value: 'Überschrift 3'
            },
            {
                value: 'Überschrift 4'
            },
            {
                value: 'Überschrift 5'
            },
            {
                value: 'Überschrift 6'
            }
        ],
        rows: []
    }
    for (var i=0;i<100000;i++) {
        myGridData.rows.push({
            rowId: i,
            columns: [
                {
                    value: 'column 1'
                },{
                    value: 'column 2'
                },{
                    value: 'column 3'
                },{
                    value: 'column 4'
                },{
                    value: 'column 5'
                },{
                    value: 'column 6'
                }
            ]
        });
    }

    var myParentContainer = $('body');
    var myGrid = new Grid(300, 500, myParentContainer, new GridModel(myGridData)); 
});
