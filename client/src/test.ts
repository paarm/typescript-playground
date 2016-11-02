import {GridModel, IGridData} from './grid/gridmodel';
import {Grid} from './grid/grid';

//Test
$(document).ready(function() {
    console.log('Document is ready');

    var myGridData : IGridData = {
        fieldValueName: 'value',
        headerColumns: [
            {
                id: '1',
                name: 'Zeilennummer'
            }, 
            {
                id: '1',
                name: 'Mama'
            },
            {
                id: '1',
                name: 'Papa'
            },
            {
                id: '1',
                name: 'Lena'
            },
            {
                id: '1',
                name: 'Katharina'
            },
            {
                id: '1',
                name: 'Jakob'
            },
            {
                id: '1',
                name: 'Melli'
            },
            {
                id: '1',
                name: 'Oma'
            },
            {
                id: '1',
                name: 'Opa'
            },
            {
                id: '1',
                name: 'Sophia'
            },
            {
                id: '1',
                name: 'Anika'
            },
            {
                id: '1',
                name: 'Mia'
            },
            {
                id: '1',
                name: 'Gerhard'
            }
        ],
        rows: []
    }
    for (var i=0;i<100000;i++) {
        myGridData.rows.push({
            rowId: i,
            columns: [
                {
                    value: '#'+i
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
