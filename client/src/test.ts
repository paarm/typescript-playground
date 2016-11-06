import {IGridModel, IGridData, IGridRow, GridModel, IGridColumn} from './grid/gridmodel';
import {Grid} from './grid/grid';

function getRandom(min : number, max: number) : number {
  return Math.floor(Math.random() * (max - min) + min);
}
//Test
$(document).ready(function() {
    console.log('Document is ready');

    var myGridData : IGridData = {
        fieldValueName: 'value',
        headerColumns: [
            {
                id: '1',
                name: 'Zeilennummer',
            }, 
            {
                id: '1',
                name: 'Mama',
                renderer: function (grid: IGridModel, row: IGridRow, column: IGridColumn) {
                    var r:HTMLSpanElement = <HTMLSpanElement>document.createElement("span");
                    r.style.cssText="width: "+column.value+"%;";
                    r.className='barbox';
                    return r;
                    //return $("<span style='width: "+column.value+"%;' class='barbox'></span>")
                }
            },
            {
                id: '1',
                name: 'Papa',
                renderer: function (grid: IGridModel, row: IGridRow, column: IGridColumn) {
                    var r:HTMLSpanElement = <HTMLSpanElement>document.createElement("span");
                    r.style.cssText="width: "+column.value+"%; background: red;";
                    r.className='barbox';
                    return r;
                    //return $("<span style='width: "+column.value+"%;' class='barbox'></span>")
                }
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
    for (var i=0;i<5;i++) {
        myGridData.rows.push({
            rowId: i,
            columns: [
                {
                    value: '#'+i
                },{
                    value: ""+getRandom(1,100)
                },{
                    value: ""+getRandom(1,100)
                },{
                    value: ""+getRandom(0,1000)
                },{
                    value: ""+getRandom(0,1000)
                },{
                    value: ""+getRandom(0,1000)
                },{
                    value: ""+getRandom(0,1000)
                },{
                    value: ""+getRandom(0,1000)
                },{
                    value: ""+getRandom(0,1000)
                },{
                    value: ""+getRandom(0,1000)
                },{
                    value: ""+getRandom(0,1000)
                },{
                    value: ""+getRandom(0,1000)
                },{
                    value: ""+getRandom(0,1000)
                }
            ]
        });
    }

    var myParentContainer = document.querySelector("body");
    var myGrid = new Grid(1200, 700, myParentContainer, new GridModel(myGridData));
    var buttonAdd: HTMLButtonElement= <HTMLButtonElement>document.createElement("button");
    buttonAdd.innerHTML="Add Row";
    buttonAdd.onclick=()=> {
        console.log("Button ADD clicked");
        var rows:IGridRow[]=[];
        for (var i=0;i<1000;i++) {
            rows.push({
                rowId: i,
                columns: [
                    {
                        value: '#'+(myGrid.gridModel.getRowCount()+i)
                    },{
                        value: ""+getRandom(1,100)
                    },{
                        value: ""+getRandom(1,100)
                    },{
                        value: ""+getRandom(0,1000)
                    },{
                        value: ""+getRandom(0,1000)
                    },{
                        value: ""+getRandom(0,1000)
                    },{
                        value: ""+getRandom(0,1000)
                    },{
                        value: ""+getRandom(0,1000)
                    },{
                        value: ""+getRandom(0,1000)
                    },{
                        value: ""+getRandom(0,1000)
                    },{
                        value: ""+getRandom(0,1000)
                    },{
                        value: ""+getRandom(0,1000)
                    },{
                        value: ""+getRandom(0,1000)
                    }
                ]
            });
        }
        myGrid.appendModelRows(rows);
    }
    myParentContainer.appendChild(buttonAdd);
    var buttonRemove: HTMLButtonElement= <HTMLButtonElement>document.createElement("button");
    buttonRemove.innerHTML="Remove Row";
    myParentContainer.appendChild(buttonRemove);
    buttonRemove.onclick=()=> {
        console.log("Button REMOVE clicked");
        var x:number[]=[];
        for (var i=0;i<1000;i++) {
            x.push(myGrid.gridModel.getRowCount()-1-i);
        }
        myGrid.removeModelRows(x);
    }
});
