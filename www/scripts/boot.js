console.log("Booting the application...");

class PGrid {
    constructor(model) {
        this.model=model;
    }
}

var pGrid=new PGrid(
    {
        colCnt: 0,
        rowCnt: 0,
        rows: []
    }
);
pGrid.model.rowCnt=100;
pGrid.model.colCnt=8;
for (var i=0;i<pGrid.model.rowCnt;i++) {
    var cols=[];
    for (var c=0;c<pGrid.model.colCnt;c++) {
        cols.push({v: 'Column '+i+'/'+c});
    }
    pGrid.model.rows.push({
        rowId: i,
        cols: cols
    })
}

class ApplicationContext {
    constructor(parentContainer, gridModel) {
        this.parentContainer=parentContainer;
        this.gridModel=gridModel;
    }

    addBigList() {
        var cols=this.gridModel.model.colCnt;
        var lines=this.gridModel.model.rowCnt;

        this.pg2=$("<div class='pg2' style='width: 600px; height: 500px; overflow: hidden; position: relative'></div>");
        this.parentContainer.append(this.pg2);
        this.pg2_header=$("<div class='pg2-header' style='overflow: hidden; position: relative;'></div>");
        // header
        this.pg2.append(this.pg2_header);
        this.pg2_header_row=$("<div class='pg2-header-row' style='width: 1600px;'></div>");
        this.pg2_header.append(this.pg2_header_row);
        for (var i=0;i<cols;i++) {
            this.pg2_header_row.append("<div class='pg2-header-cell pg2-header-cell-unsorted pg2-col-"+i+"' style='width: 100px;' onclick='onColumnHeaderClicked(this,"+i+",true)'>column "+i+"</div>");
        }
        // body
        this.pg2_viewport=$("<div class='pg2-viewport'  onscroll='onScrollCanvas(this)' style='width: 100%; overflow: auto; position: relative; height: 474px;'></div>");
        this.pg2.append(this.pg2_viewport);
        this.pg2_canvas=$("<div class='pg2-canvas' style='width: "+(this.gridModel.model.colCnt*103.6)+"px; height: 12000px;'></div>");
        this.pg2_viewport.append(this.pg2_canvas);
        for (var l=0;l<lines;l++) {
            var row=$("<div class='pg2-row pg2-row-"+l+"' style='top: "+(30*l)+"px;'></div>");
            this.pg2_canvas.append(row);
            for (var i=0;i<cols;i++) {
                row.append("<div class='pg2-cell pg2-col-"+i+"' style='width: 100px;'>"+this.gridModel.model.rows[l].cols[i].v+"</div>");
            }
        }

        var ul=""
        ul+="<div class='pg2' style='width: 600px; height: 500px; overflow: hidden; position: relative'>";
            ul+="<div class='pg2-header' style='overflow: hidden; position: relative;'>";
                ul+="<div class='pg2-header-row' style='width: 1600px;'>";
                for (var i=0;i<cols;i++) {
                    ul+="<div class='pg2-header-cell pg2-header-cell-unsorted pg2-col-"+i+"' style='width: 100px;' onclick='onColumnHeaderClicked(this,"+i+",true)'>column "+i+"</div>";
                }
                ul+="</div>";
            ul+="</div>";// onscroll='onBodyLeftWritScroll(this)'
            ul+="<div class='pg2-viewport'  onscroll='onScrollCanvas(this)' style='width: 100%; overflow: auto; position: relative; height: 474px;'>";
                ul+="<div class='pg2-canvas' style='width: "+(this.gridModel.model.colCnt*103.6)+"px; height: 12000px;'>";
                    for (var l=0;l<lines;l++) {
                        ul+="<div class='pg2-row pg2-row-"+l+"' style='top: "+(30*l)+"px;'>";
                        for (var i=0;i<cols;i++) {
                            ul+="<div class='pg2-cell pg2-col-"+i+"' style='width: 100px;'>"+this.gridModel.model.rows[l].cols[i].v+"</div>";
                        }
                        ul+="</div>";
                    }
                ul+="</div>";
            ul+="</div>";
        ul+="</div>";
        var x="<div class='scrollX'>X: 0</div>";
        this.parentContainer.append(x);
        var y="<div class='scrollY'>Y: 0</div>";
        this.parentContainer.append(y);

        var el=this.parentContainer.append(ul);
//        this.body.find('.pg-body').on('scroll', function() {
 //           console.log("scroll");
   //         $('.pg-header').scrollLeft($(this).scrollLeft());
 //       });
        //$('#keywords').tablesorter();
    }
}
var myApplicationContext={};

/*function onColumnHeaderClicked(colIndex) {
    console.log("Column Header clicked on index"+colIndex);
}*/

function onScrollCanvas(el) {
    console.log("scroll");
    $('.scrollX').text('X: '+$(el).scrollLeft());
    $('.scrollY').text('Y: '+$(el).scrollTop());
    $(el).prev().scrollLeft($(el).scrollLeft());
    //$(pg_header).scrollLeft($(el).scrollLeft());
}

function onColumnHeaderClicked(el, col, reversex) {
    var reverse=false;
    var ft_rwrapper=$(el).closest('.pg-header')[0];
    var table_header=$(ft_rwrapper).find('table')[0];
    var table_parent=$(ft_rwrapper).next();
    var table=$(ft_rwrapper).next().find('table')[0];
    console.log("Column Header clicked on index"+col);
    var colsLenght=table_header.tBodies[0].rows[0].cells.length;
    for (var i=0;i<colsLenght;i++) {
        var sortClass='pg-header-cell-unsorted';
        if ($(table_header.tBodies[0].rows[0].cells[i]).hasClass('pg-header-cell-unsorted')) {
            $(table_header.tBodies[0].rows[0].cells[i]).removeClass('pg-header-cell-unsorted')
            if (i==col) {
                $(table_header.tBodies[0].rows[0].cells[i]).addClass('pg-header-cell-sortedasc')
            }
        } else if ($(table_header.tBodies[0].rows[0].cells[i]).hasClass('pg-header-cell-sorteddesc')) {
            $(table_header.tBodies[0].rows[0].cells[i]).removeClass('pg-header-cell-sorteddesc')
            if (i==col) {
                $(table_header.tBodies[0].rows[0].cells[i]).addClass('pg-header-cell-sortedasc')
            }
        } else {
            $(table_header.tBodies[0].rows[0].cells[i]).removeClass('pg-header-cell-sortedasc')
            if (i==col) {
                $(table_header.tBodies[0].rows[0].cells[i]).addClass('pg-header-cell-sorteddesc')
                reverse=true;
            }
        }
        if (i!=col) {
            $(table_header.tBodies[0].rows[0].cells[i]).addClass('pg-header-cell-unsorted')
        }
    }
    var tb = table.tBodies[0], // use `<tbody>` to ignore `<thead>` and `<tfoot>` rows
        tr = Array.prototype.slice.call(tb.rows, 0), // put rows into array
        i;

    reverse = -((+reverse) || -1);
    tr = tr.sort(function (a, b) { // sort rows
        return reverse // `-1 *` if want opposite order
            * (a.cells[col].textContent.trim() // using `.textContent.trim()` for test
                .localeCompare(b.cells[col].textContent.trim())
               );
    });

    //table_parent[0].removeChild(table);
    //tb.remove();

    while (tb.firstChild) {
        tb.removeChild(tb.firstChild);
    }


    for(i = 0; i < tr.length; ++i) {
        tb.appendChild(tr[i]); // append each row in order
    }
    //table.appendChild(tb);
}

function onScrollScroller() {
    //var t=$('.ft_rwrapper');
    //var ta=t.child('table');
    var ta=$('.ft_r');
    ta.css('left', ($('.ft_scroller').scrollLeft()*-1));
/*
    $(this).css('left', ($(this).scrollLeft()*-1));
					lc.ft_c.css('top', ($(this).scrollTop()*-1));
				}
				lc.ft_r.css('left', ($(this).scrollLeft()*-1));*/
}

$(document).ready(function() {
    myApplicationContext=new ApplicationContext($('body'), pGrid);
    //myApplicationContext.body.append("<p>Hallo Welt</p>");
    myApplicationContext.addBigList(pGrid);
    //myApplicationContext.addBigList();
/*    var test="<p>Das ist ein neues Element</p>";
    var test2=$('<p></p>').text("Hallo from JQuery");
    $('body').append(test, test2);
    */
});

