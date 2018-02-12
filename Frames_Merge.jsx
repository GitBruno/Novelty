// Merge_TextFrames.jsx
// Version 1.0

// Bruno Herfst 2018


var Settings = {
    redrawFrame : true,
    addLineFeed : true // if redrawFrame === True
}

function main() {

    var textframes = [];

    for (i = 0; i < app.selection.length; i++) { 
        if( app.selection[i].constructor.name === "TextFrame" ) {
            textframes.push( app.selection[i] )
        }
    }

    if( textframes.length === 0) {
        alert("Select some textframes before running this script");
        return;
    }

    // Sort textframes on reading order
    textframes.sort(function(a, b) {
        return a.geometricBounds[1] - b.geometricBounds[1];
    });

    textframes.sort(function(a, b) {
        return a.geometricBounds[0] - b.geometricBounds[0];
    });

    var bounds = textframes[0].geometricBounds; //[y1, x1, y2, x2]

    for(var i = textframes.length - 1; i > 0; i--){
        if( Settings.redrawFrame && Settings.addLineFeed ) textframes[i].insertionPoints[0].contents = "\n";
        // Make sure frames are linked
        try {
            textframes[i-1].nextTextFrame = textframes[i];
        } catch( props ) {
            // no probs bro!
        }
        var frameBounds = textframes[i].geometricBounds;
        if(frameBounds[0] < bounds[0]) bounds[0] = frameBounds[0];
        if(frameBounds[1] < bounds[1]) bounds[1] = frameBounds[1];
        if(frameBounds[2] > bounds[2]) bounds[2] = frameBounds[2];
        if(frameBounds[3] > bounds[3]) bounds[3] = frameBounds[3];
        if( Settings.redrawFrame ) textframes[i].remove();
    };

    if( Settings.redrawFrame ) textframes[0].geometricBounds = bounds;
}

main();
