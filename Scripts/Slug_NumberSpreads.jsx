// Slug_NumberSpreads.jsx

// Places the spread number in the spreads slug.

// Bruno Herfst 2018

// TODO: Support for layer/ layer locked

var keyValue = "spreadNumberScriptLabel";

var Settings = {
    pointSize  : 60,
    offset     : {y:0,x:0},
    startIndex : 1
};

function removeLabeledItems( DocPageOrSpread, labelKey, labelValue ) {
    var i, count = DocPageOrSpread.textFrames.length;

    // We need to iterate backwards
    // as we delete frames on the go...
    for (i = count - 1; i >= 0; i--) {
        var tf = DocPageOrSpread.textFrames[i];
        if( tf.extractLabel( labelKey ) === labelValue) {
            tf.remove();
        };
    };
};

function placeSpreadNumber( num, Spread, offset ) {
    // Place the number in the slug
    // of first page in spread
    var targetPage = Spread.pages[0];
    var tf = targetPage.textFrames.add();
    tf.insertLabel(keyValue, keyValue);
    tf.contents = String(num);
    tf.paragraphs.everyItem().pointSize = Settings.pointSize;
    tf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
    
    // Move item into slug

    // Bounds: y1, x1, y2, x2
    var pageBounds = targetPage.bounds;
    var itemBounds = tf.geometricBounds;
    var itemWidth  = itemBounds[3] - itemBounds[1];
    var itemHeight = itemBounds[2] - itemBounds[0];

    var newBounds = [ pageBounds[0] + Settings.offset.y,
                      pageBounds[1] + Settings.offset.x,
                      pageBounds[0] + Settings.offset.y,
                      pageBounds[1] + Settings.offset.x];

    newBounds[0] += itemHeight;
    newBounds[1] -= itemWidth;
    tf.geometricBounds = newBounds;
};

function main(){
    var Doc = app.activeDocument;
    // Remove any existing numbers
    Settings.offset.x -= Doc.documentPreferences.documentBleedOutsideOrRightOffset;
    removeLabeledItems( Doc, keyValue, keyValue );
    var count = Doc.spreads.length;
    var counter = Settings.startIndex;
    for( var i = 0; i < count; i++ ) {
        placeSpreadNumber( counter+i, Doc.spreads[i] );
    };
};

main();
