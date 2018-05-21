// Export_Book_2_JPG.jsx
// An indesign javascript based on a snippet from Jongware
// Source: https://forums.adobe.com/thread/619756

// Bruno Herfst 2017

// TODO: UI for settings + save location

var standardSettings = {
    exportingSpread    : true,
    jpegExportRange    : ExportRangeOrAllPages.EXPORT_ALL,
    jpegRenderingStyle : JPEGOptionsFormat.BASELINE_ENCODING,
    exportResolution   : 300,
    antiAlias          : true,
    jpegQuality        : JPEGOptionsQuality.MAXIMUM,
    simulateOverprint  : true,
    useDocumentBleeds  : true,
    jpegColorSpace     : JpegColorSpaceEnum.GRAY,
    embedColorProfile  : false
}

function setExportOptions( options ) {
    // Save original settings
    var originalPrev = new Object();
        originalPrev.exportingSpread    = app.jpegExportPreferences.exportingSpread;
        originalPrev.jpegExportRange    = app.jpegExportPreferences.jpegExportRange;
        originalPrev.jpegRenderingStyle = app.jpegExportPreferences.jpegRenderingStyle;
        originalPrev.exportResolution   = app.jpegExportPreferences.exportResolution;
        originalPrev.antiAlias          = app.jpegExportPreferences.antiAlias;
        originalPrev.jpegQuality        = app.jpegExportPreferences.jpegQuality;
        originalPrev.simulateOverprint  = app.jpegExportPreferences.simulateOverprint;
        originalPrev.useDocumentBleeds  = app.jpegExportPreferences.useDocumentBleeds;
        originalPrev.jpegColorSpace     = app.jpegExportPreferences.jpegColorSpace;
        originalPrev.embedColorProfile  = app.jpegExportPreferences.embedColorProfile;

    app.jpegExportPreferences.exportingSpread    = options.exportingSpread;
    app.jpegExportPreferences.jpegExportRange    = options.jpegExportRange;
    app.jpegExportPreferences.jpegRenderingStyle = options.jpegRenderingStyle;
    app.jpegExportPreferences.exportResolution   = options.exportResolution;
    app.jpegExportPreferences.antiAlias          = options.antiAlias;
    app.jpegExportPreferences.jpegQuality        = options.jpegQuality;
    app.jpegExportPreferences.simulateOverprint  = options.simulateOverprint;
    app.jpegExportPreferences.useDocumentBleeds  = options.useDocumentBleeds;
    app.jpegExportPreferences.jpegColorSpace     = options.jpegColorSpace;
    app.jpegExportPreferences.embedColorProfile  = options.embedColorProfile;

    return originalPrev;
}

if (app.books.length != 1) {
    alert ("This only works when you have one (1) book open");  
} else {
    // Don't show profile mismatches
    var originalUserInteractionLevel = app.scriptPreferences.userInteractionLevel;
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;

    var userExportPref = setExportOptions( standardSettings );

    for (var b=0; b<app.books[0].bookContents.length; b++) {  
        var c = app.open(app.books[0].bookContents[b].fullName);  
        c.exportFile (ExportFormat.JPG, File(app.books[0].bookContents[b].fullName+".jpg"));
        c.close(SaveOptions.NO);
    }

    // Reset original preferences
    setExportOptions( userExportPref );
    app.scriptPreferences.userInteractionLevel = originalUserInteractionLevel;
}