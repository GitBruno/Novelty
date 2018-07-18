// Frame Splits Story

// Same as StorySplitter by FourAces but removed UI
// Automatically unlinks/splits to frame boundry
// Sugested shortcut: Ctr-F
// Bruno Herfst 2018

/*
----------------------------------------------------------------------
StorySplitter
----------------------------------------------------------------------
An InDesign CS/CS2/CS3 JavaScript by FourAces
© The Final Touch 2006
Version 3.0.0

Splits the selected Story to separate Text Frames, while maintaining their contents.
----------------------------------------------------------------------
*/

#target indesign;

function splitStoryAtFrame( tf ){
     if (tf.previousTextFrame !== null){
          var myBfBreakFrame = tf.previousTextFrame;
          var myAfBreakFrame = tf;
          var myBreakStory = myBfBreakFrame.parentStory;
          tf.previousTextFrame = null;
          if(myBfBreakFrame.overflows == true){
               var myOversetText = myBreakStory.texts.itemByRange(myBfBreakFrame.insertionPoints[-1],myBreakStory.insertionPoints[-1]);
               myOversetText.select();
               app.cut();
               app.select(myAfBreakFrame.insertionPoints[0]);
               app.paste();
          }
     };
     if (tf.nextTextFrame !== null) {
          var myBfBreakFrame = tf;
          var myAfBreakFrame = tf.nextTextFrame;
          var myBreakStory = myBfBreakFrame.parentStory;
          tf.nextTextFrame = null;
          if(myBfBreakFrame.overflows == true){
               var myOversetText = myBreakStory.texts.itemByRange(myBfBreakFrame.insertionPoints[-1],myBreakStory.insertionPoints[-1]);
               myOversetText.select();
               app.cut();
               app.select(myAfBreakFrame.insertionPoints[0]);
               app.paste();
          }
     };
};

if(app.documents.length != 0){
     var mySelection = app.activeDocument.selection;
     var myTextFrames = [];
     var returnPage = mySelection[0].parentPage;

     // Collect textFrames in selection
     for (var i = 0; i < mySelection.length; i++) {
          if(mySelection[i].constructor.name === "TextFrame"){
               myTextFrames.push(mySelection[i]);
          };
	};

     if(myTextFrames.length > 0){
		for (var i = 0; i < myTextFrames.length; i++) { 
			splitStoryAtFrame( myTextFrames[i] );
		};
		app.activeWindow.activePage = returnPage;
		alert("Done!");
     } else {
          alert("Please select at least one Text Frame to split.");
     }
} else {
     alert("No Active Document Found.\nPlease open an InDesign document and select a Text Frame to split.");
};
