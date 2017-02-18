/*////////////////////////////////////////////////////////////////
    
    Selection_2_Clipboard.jsx
    Version 1
    Tested in InDesign CC

    This script saves slection to be placed in Photoshop.
    It adds a new rectangle frame covering the current spread including bleed
    so it is easy to paste in place in Photoshop.

    Note: This does not work when selection is bigger then page bleed!
    
    Bruno Herfst 2016
        
////////////////////////////////////////////////////////////////*/

#target indesign;

try{
    var DOC = app.activeDocument;
    var SPREAD = app.activeWindow.activeSpread;
    var SELECTION = [];
    if(app.selection.length != 0){
        for(var i=0; i<app.selection.length; i++){
            SELECTION.push(app.selection[i]);
        }
    }else{
        alert("Select something first.");
        exit();
    }
    var myItems = SELECTION.slice(0);
    main();
    alert("Copied selection to clipboard");
}catch(e){
    alert("OOPS!\n" + e.description);
    exit();
}

// ------------------------------------------------------ FUNCTIONS ------------------------------------------------------

function main(){
    var myRect = addRectangle(SPREAD.pages[0], "NEW_RECT_48655");
    myItems.unshift(fit2SpreadBleed(myRect));
    app.select(myItems);
    app.copy();
    myItems[0].remove();
    //app.select(SELECTION);
}

function addRectangle( PAGE, LABEL ){
    var myRect = PAGE.rectangles.add();
        myRect.label = LABEL;
        myRect.fillColor    = DOC.swatches.item("None");
        myRect.strokeWeight = 0;
    return myRect;
}

function fit2SpreadBleed(myRect){
    var myPage = myRect.parentPage;
    var mySpread = myPage.parent;
    var firstPage = mySpread.pages[0];
    var lastPage  = mySpread.pages[mySpread.pages.length-1];

    //check bounds
    var rectBounds = myRect.geometricBounds;
        
    var firstPageBounds = firstPage.bounds; //in the format [y1, x1, y2, x2], top-left and bottom-right
    var lastPageBounds  = lastPage.bounds;

    var pageBounds = [firstPageBounds[0],firstPageBounds[1],lastPageBounds[2],lastPageBounds[3]]; 
    var pageWidth = pageBounds[3]-pageBounds[1];
    
    var bleedTop = DOC.documentPreferences.documentBleedTopOffset;
    var bleedBot = DOC.documentPreferences.documentBleedBottomOffset;
    
    if(DOC.documentPreferences.facingPages) {
        var bleedLef = DOC.documentPreferences.documentBleedOutsideOrRightOffset;
        var bleedRig = DOC.documentPreferences.documentBleedOutsideOrRightOffset;
    } else {
        var bleedLef = DOC.documentPreferences.documentBleedInsideOrLeftOffset;
        var bleedRig = DOC.documentPreferences.documentBleedOutsideOrRightOffset;
    }

    var bleedBound = new Array(pageBounds[0]-bleedTop,pageBounds[1]-bleedLef,pageBounds[2]+bleedBot,pageBounds[3]+bleedRig);

    myRect.geometricBounds = bleedBound;

    return myRect;
}
