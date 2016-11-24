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
                name: 'Total',
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
                name: 'R2D2',
                renderer: function (grid: IGridModel, row: IGridRow, column: IGridColumn) {
                    var r:HTMLSpanElement = <HTMLSpanElement>document.createElement("span");
                    r.style.cssText="width: "+column.value+"%; background: coral;";
                    r.className='barbox';
                    return r;
                    //return $("<span style='width: "+column.value+"%;' class='barbox'></span>")
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

    var myParentContainer =<HTMLElement> document.querySelector("#container");
    var myGrid = new Grid(1200, 700, myParentContainer, new GridModel(myGridData));
    var buttonAdd: HTMLButtonElement= <HTMLButtonElement>document.createElement("button");
    buttonAdd.innerHTML="Add 1K rows";
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
    buttonRemove.innerHTML="Remove 1K rows";
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
