//DESCRIPTION:CopyCutter -- Run Me On A Text Frame To Shred It Into Strips
// A Jongware script 7-Aug-2011
// w/Thanks to SebastiaoV to find a working version

// Updated 2018 by Bruno Herfst 
// - Use findGrep() instead of changeGrep()
// - Add single undo
// - Move any RegEx

var regex  = "^(.+\n?)+$"; // Paragraphs
var toSide = true;

// Run script with single undo if supported
if (parseFloat(app.version) < 6) {
  main();
} else {
  app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Expand State Abbreviations");
};

function main() {
  try {
    if (app.selection.length == 1 && app.selection[0].hasOwnProperty("baseline") && app.selection[0].length > 1) {
      app.findGrepPreferences   = null;
      app.changeGrepPreferences = null;
      app.findGrepPreferences.findWhat = regex;
      var result = app.selection[0].findGrep();
      var i = result.length;
      while ( i-- ) { 
          app.select(result[i]);
          var ptf = app.selection[0].parentTextFrames[0];
          var txt = app.selection[0].texts[0];
          var topBL = txt.characters[0].baseline;
          var botBL = txt.characters[-1].baseline;
          // [ y1 , x1 , y2 , x2 ]  
          if( toSide ) {
            var bnds = [ topBL, ptf.geometricBounds[3], botBL+500, ptf.geometricBounds[3]+(ptf.geometricBounds[3]-ptf.geometricBounds[1]) ];
          } else {
            var bnds = [ topBL, ptf.geometricBounds[1], botBL+500, ptf.geometricBounds[3] ];
          }
          var f = app.activeDocument.layoutWindows[0].activePage.textFrames.add ({geometricBounds:bnds});
          txt.move (LocationOptions.AFTER, f.texts[0]);
          var nbl = f.characters[0].baseline;
          var offset = nbl - topBL;
          bnds[0] -= offset;
          bnds[2] -= 500;
          f.geometricBounds = bnds;
      }
    } else {
      alert ("please select some text to shred");
    };
    // Global error reporting
  } catch ( error ) {
    alert( error + " (Line " + error.line + " in file " + error.fileName + ")");
  };
};