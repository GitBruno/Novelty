// XML_Runner.jsx

// Expects XML to be allready loaded into template document.
var dataNodeName = "Content"; // The data to be procecced

var templateMasterName = "TEMP-Placeholder";
var pageMasterName     = "A-Master";

// A build script to help process XML elements into a template document.
var doc  = app.documents[0];
var root = doc.xmlElements[0].xmlElements;

var templateRoot = getDataNode(dataNodeName);
var page  = 0;

var masterTemplate = getMasterTemplate();
var masterPageInfo = getMasterPageInfo();

var currX = masterPageInfo.startX;
var currY = masterPageInfo.startY;

function xmlRunner() {
    var count = templateRoot.length;
    for (var i=0; i<count; i++) {
        
        // DATA
        //------
        var element = templateRoot[i];
        // Here we can customise the needed elements
        var entry = element.xmlElements[0];
        var descr = element.xmlElements[1];

        // TEMPLATE
        //----------
        // Add template to page
        var currentTemplate = startTemplate();
        // Add data to template
        entry.placeXML(getFrameByLabel( currentTemplate, 'entryText'       ));
        descr.placeXML(getFrameByLabel( currentTemplate, 'entryDesription' ));
        // Finish template, resize
        finishTemplate(currentTemplate);
    }
}

function getDataNode( dataNodeName ){
    var count = root.length;
    for (var i=0; i<count; i++) {
        if( root[i].markupTag.name == dataNodeName ) {
            return root[i].xmlElements;
        }
    }
    alert("Could not find your data node!");
    return null;
}

function startTemplate() {
    var cloneTemplate = masterTemplate.duplicate();
        cloneTemplate.move ( doc.pages[page] );
        cloneTemplate.move ( [currX, currY]  );
    return cloneTemplate;
}

function finishTemplate( currentTemplate ){
    // resize backgrounds
    var margin = 4;

    var entryText      = getFrameByLabel( currentTemplate, 'entryText'       );
    var desriptionText = getFrameByLabel( currentTemplate, 'entryDesription' );

    // Fit text
    entryText.fit(FitOptions.FRAME_TO_CONTENT);
    desriptionText.fit(FitOptions.FRAME_TO_CONTENT);

    desriptionText.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_LEFT_POINT;
    desriptionText.textFramePreferences.autoSizingType           = AutoSizingTypeEnum.WIDTH_ONLY;

    desriptionText.textFramePreferences.useMinimumWidthForAutoSizing = false;
    desriptionText.textFramePreferences.useMinimumHeightForAutoSizing = false;

    entryText.fit(FitOptions.APPLY_FRAME_FITTING_OPTIONS);
    desriptionText.fit(FitOptions.APPLY_FRAME_FITTING_OPTIONS);
    
    entryText.textFramePreferences.autoSizingType      = AutoSizingTypeEnum.OFF;
    desriptionText.textFramePreferences.autoSizingType = AutoSizingTypeEnum.OFF;
    
    // F I T   B A C K G R O U N D S
    var entryBounds = entryText.geometricBounds;
    var desriptionBounds = desriptionText.geometricBounds;
    
    var leftMarginEntry = 2;

    var entryBG      = getFrameByLabel( currentTemplate, 'entryBackground'       );
    var desriptionBG = getFrameByLabel( currentTemplate, 'descriptionBackground' );

    var entryBGBounds      = entryBG.geometricBounds;
    var desriptionBGBounds = desriptionBG.geometricBounds;

    entryBG.geometricBounds      = [entryBGBounds[0],entryBGBounds[1],entryBGBounds[2],entryBounds[3]+leftMarginEntry];
    desriptionBG.geometricBounds = [desriptionBGBounds[0],desriptionBGBounds[1],desriptionBounds[2],desriptionBounds[3]];

    // Update currX and Y coordinates
    var templateBounds = currentTemplate.geometricBounds;
    currY = templateBounds[2] + margin;
    if(currY > masterPageInfo.endY) {
        page++;
        currY = masterPageInfo.startY;
        if(!doc.pages[page].isValid) {
            doc.pages.add();
        }
    }
}

function getFrameByLabel( group, label ){
    var i = group.allPageItems.length; var t;
    var unlocklayers = true;
    while(i--){
        t = group.allPageItems[i];
        if(t && t.label == label){
            // Check if filtered item is on a locked layer
            if(t.itemLayer.locked && unlocklayers){
                t.itemLayer.locked = false;
            }
            return t;
        }
    }
}

function getMasterPageInfo() {
    var pageMaster = doc.masterSpreads.item(pageMasterName).pages[0];
    if(!pageMaster.isValid) {
        throw("Could not find a valid template on master page " + pageMasterName);
    }
    var infoPage = new Object();

    infoPage.page   = pageMaster;
    infoPage.boundsInfo = getBoundsInfo(pageMaster.bounds);
    infoPage.margin = { top     : pageMaster.marginPreferences.top    ,
                        right   : pageMaster.marginPreferences.right  ,
                        left    : pageMaster.marginPreferences.left   ,
                        bottom  : pageMaster.marginPreferences.bottom };
    // Shortcuts
    infoPage.w = infoPage.boundsInfo.width;
    infoPage.h = infoPage.boundsInfo.height;

    infoPage.startX = infoPage.margin.left;
    infoPage.endX   = infoPage.w-infoPage.margin.right;
    infoPage.startY = infoPage.margin.top;
    infoPage.endY   = infoPage.h-infoPage.margin.bottom;

    return infoPage;
}

function getBoundsInfo(bounds){
    // This functions receives bounds (y1, x1, y2, x2)
    // and returns an object with bounds and info as below
    var topLeftY   = bounds[0];
    var topLeftX   = bounds[1];
    var botRightY  = bounds[2];
    var botRightX  = bounds[3];
    var height     = Math.abs(botRightY - topLeftY);
    var width      = Math.abs(botRightX - topLeftX);
    var halfWidth  = 0;
    var halfHeight = 0;
    if(width > 0) {
        halfWidth = width/2;
    }
    if(height > 0) {
        halfHeight = height/2;
    }

    return {    bounds    : bounds,
                height    : height,
                width     : width,
                topLeft   : {x: topLeftX                , y: topLeftY               } ,
                topCenter : {x: topLeftX + halfWidth    , y: topLeftY               } ,
                topRight  : {x: botRightX               , y: topLeftY               } ,
                midLeft   : {x: topLeftX                , y: topLeftY  + halfHeight } ,
                midCenter : {x: topLeftX + halfWidth    , y: topLeftY  + halfHeight } ,
                midRight  : {x: botRightX               , y: topLeftY  + halfHeight } ,
                botLeft   : {x: topLeftX                , y: botRightY              } ,
                botCenter : {x: topLeftX + halfWidth    , y: botRightY              } ,
                botRight  : {x: botRightX               , y: botRightY              } };
}

function getMasterTemplate() {
    // This function return a copy of template from template master.
    var myMasterTemplate = doc.masterSpreads.item(templateMasterName).groups[0];
    if(myMasterTemplate.isValid) {
        return myMasterTemplate;
    }
    throw("Could not find a valid template on master page " + templateMasterName);
}

function setup(){
    // Set rulers to page
    // Set facingpages to false;
    // Allow document pages to shuffle (otherwise add page will add page to spread)
    // Doc can only have oe page, starting at page 1
}

function main() {
    var originalSettings = setup();
    xmlRunner();
    exit(originalSettings);
}

try {
    main();
} catch ( err ) {
    alert(err.message + " (Line " + err.line + " in file " + err.fileName + ")");
}

