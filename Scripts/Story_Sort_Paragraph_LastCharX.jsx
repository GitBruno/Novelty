
/*

Story_Sort_Paragraph_LastCharX.jsx
Version 1.0

Indesign CS5 javascript
Bruno Herfst 2019

*/

#target "InDesign"


function compareEndX(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

function bubbleSortLastX( story ) {
    if (story.overflows) {
        alert("Skipped story " + story.id + ": Contains overflow text." ); 
        return false;
    }

    myParagraphs = story.paragraphs;
    
    // Make sure we end with a new line char
    if(myParagraphs[0].parentStory.insertionPoints[-1].index == myParagraphs[-1].insertionPoints[-1].index){
        myParagraphs[-1].insertionPoints[-1].contents = "\r";
        myCleanUp = true;
    } else {
        myCleanUp = false;
    }

    do{
        myItemMoved = false;
        myCounter = 0;
        do{
            locA = myParagraphs.item(myCounter).characters.item(-1).horizontalOffset;
            locB = myParagraphs.item(myCounter+1).characters.item(-1).horizontalOffset;
            if(locA > locB){
                myParagraphs.item(myCounter).move(LocationOptions.after, myParagraphs.item(myCounter+1));
                myItemMoved = true;
            }
            myCounter ++;
            }while (myCounter < myParagraphs.length-1);    
        myCounter = myParagraphs.length-1;
        do{
            locA = myParagraphs.item(myCounter).characters.item(-1).horizontalOffset;
            locB = myParagraphs.item(myCounter-1).characters.item(-1).horizontalOffset;
            if(locA < locB){
                myParagraphs.item(myCounter).move(LocationOptions.before, myParagraphs.item(myCounter-1));
                myItemMoved = true;
            }
            myCounter --;
        }while(myCounter > 1);
    }while(myItemMoved != false);

    if(myCleanUp == true){
        myParagraphs[0].parentStory.characters[-1].remove();
    }

    return true;
}

function getStories( doc ) {
    var mySelection = doc.selection;
    var selected_stories = [];
    
    if( mySelection.length === 0){
        // Do all stories
        for(var i = 0; i < doc.stories.length; i++){
            selected_stories.push(doc.stories.item(i));
        };
    } else {
        // Do stories in selection
        for(var i = 0; i < mySelection.length; i++){
            switch(mySelection[i].constructor.name){
                case "TextFrame":
                case "Paragraph":
                case "Text":
                case "Line":
                case "Word":
                case "Character":
                case "TextColumn":
                case "TextStyleRange":
                case "InsertionPoint":
                    var pStory = mySelection[i].parentStory;
                    if(notInArray(pStory, selected_stories)){
                        selected_stories.push(pStory);
                    };
                    break;
                default:
                    alert("Could not find a solution for " + mySelection[i].constructor.name);
                    break;
            };
        };
    };

    return selected_stories;
};

function notInArray(needle, array) {
    for(var i = 0; i < array.length; i++) {
        if(array[i] === needle) {
            return false;
        }
    }
    return true;
};

function main() {
    //Make certain that user interaction (display of dialogs, etc.) is turned on.
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    if (app.documents.length != 0) {
        var doc = app.activeDocument;
        var stories = getStories( doc );
        var storyLen = stories.length;
        if (storyLen == 0) alert("Could not find any stories active document.");
        for(var i = 0; i < storyLen; i++) {
            bubbleSortLastX( stories[i] );
        }
    } else {
        alert("Please open a document and try again.");
    }
}

main();
