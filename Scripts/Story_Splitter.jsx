/*

Story_Splitter.jsx

Headless story splitter based on StorySplitter by FourAces

With selection: Splits all stories found in selection
Without selection: Splits all stories in active document

----------------------------------------------------------------------
StorySplitter
----------------------------------------------------------------------
An InDesign CS/CS2/CS3 JavaScript by FourAces
© The Final Touch 2006
Version 3.0

Splits the selected Story to separate Text Frames, while maintaining their contents.
----------------------------------------------------------------------
*/

#target indesign;

function mySplitAll( tFrames ) {
    var len = tFrames.length;
    if (len === 1) return;
    for(var i = 0; i < len; i++){
       tFrames[i].duplicate();
    };
    for(var i = 0; i < len; i++){
       tFrames[i].remove();
    };
};

function splitStories( storyArr ) {
    for(var i = 0; i < storyArr.length; i++) {
        var myStory = storyArr[i];
        if(app.version.split(".")[0] >= 5){
            var tFrames = myStory.textContainers;
        } else {
            var tFrames = myStory.textFrames;
        };
        mySplitAll( tFrames );
     };
};

function notInArray(needle, array) {
  for(var i = 0; i < array.length; i++) {
    if(array[i] === needle) {
      return false;
    }
  }
  return true;
};

//---------------------------------------------------------------------

if(app.documents.length != 0){
    var mySelection = app.activeDocument.selection;
    var selected_stories = [];
    if( mySelection.length === 0){
        // Do all stories
        for(var i = 0; i < app.activeDocument.stories.length; i++){
		    selected_stories.push(app.activeDocument.stories.item(i));
	    };
    } else {
        // Do stories in selection
        for(var i = 0; i < mySelection.length; i++){
            switch(mySelection[i].constructor.name){
				//we can add insertion points paragraphs too just look them up
                case "TextFrame":
                case "Paragraph":
                case "Text":
                case "Line":
                case "Word":
                case "Character":
                case "TextColumn":
                case "TextStyleRange":
                    var myStory = mySelection[i].parentStory;
                    if(notInArray(myStory, selected_stories)){
                        selected_stories.push(myStory);
                    };
                    break;
                default:
                    break;
            };
        };
    };
    splitStories(selected_stories);
    alert("Done");
} else {
     alert("No Active Document Found.\nPlease open an InDesign document and select a Story to split.");
} // EOF
