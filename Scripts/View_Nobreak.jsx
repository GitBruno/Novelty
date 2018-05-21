//DESCRIPTION: Highlight nobreak
//Peter Kahrel -- www.kahrel.plus.com

#target indesign;

if (parseInt (app.version) > 5 && app.documents.length > 0)
    try {highlight_nobreak (app.documents[0])}
        catch (e) {alert (e.message + "\r(line " + e.line + ")")};


function highlight_nobreak (doc)
    {
    var nobreak = check_condition (doc, "nobreak");
    app.findGrepPreferences = app.changeGrepPreferences = null;
    app.findGrepPreferences.noBreak = true;
    app.changeGrepPreferences.appliedConditions = [nobreak];
    app.documents[0].changeGrep ();
    // Conditional text is visible only in Normal screen mode
    app.documents[0].layoutWindows[0].screenMode = ScreenModeOptions.previewOff;
    }


function check_condition (doc, name_)
    {
    // Delete condition if it exists
    if (doc.conditions.item (name_) != null)
        doc.conditions.item (name_).remove ();
    doc.conditions.add ({
        name: name_, 
        indicatorColor: [225,225,255], 
        indicatorMethod: ConditionIndicatorMethod.useHighlight});
    return doc.conditions.item (name_)
    }