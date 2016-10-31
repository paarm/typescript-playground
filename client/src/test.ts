import {GridModel, IGridData} from './grid/gridmodel';
import {Grid} from './grid/grid';

//Test
$(document).ready(function() {
    console.log('Document is ready');

    var myGridData : IGridData = {
        headerColumns: [
            {
                value: 'Zeilennummer'
            }, 
            {
                value: 'Mama'
            },
            {
                value: 'Papa'
            },
            {
                value: 'Lena'
            },
            {
                value: 'Katharina'
            },
            {
                value: 'Jakob'
            },
            {
                value: 'Melli'
            },
            {
                value: 'Oma'
            },
            {
                value: 'Opa'
            },
            {
                value: 'Sophia'
            },
            {
                value: 'Anika'
            },
            {
                value: 'Mia'
            },
            {
                value: 'Gerhard'
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
                },{
                    value: 'column 7'
                },{
                    value: 'column 8'
                },{
                    value: 'column 9'
                },{
                    value: 'column 10'
                },{
                    value: 'column 11'
                },{
                    value: 'column 12'
                },{
                    value: 'column 13'
                }
            ]
        });
    }

    var myParentContainer = $('body');
    var myGrid = new Grid(1200, 700, myParentContainer, new GridModel(myGridData)); 
});
