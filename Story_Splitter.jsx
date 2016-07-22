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

var myScriptVer = "3.0";

function mySplitAll() {
     for(i = 0; i < myStoryFramesCount; i++){
          myTextFrames[i].duplicate();
     }
     for(i = 0; i < myStoryFramesCount; i++){
          if(app.version.split(".")[0] >= 5){
               myTextFrames[i].remove();
          }
          else{
               myTextFrames[0].remove();
          }
     }
}

function mySplitBefore(){
     if(mySelection[0].previousTextFrame == null){
          alert("Unable to break thread.\nThe selected Text Frame is the FIRST text frame of the thread.");
     } else {
          var myBfBreakFrame = mySelection[0].previousTextFrame;
          var myAfBreakFrame = mySelection[0];
          var myBreakStory = myBfBreakFrame.parentStory;
          mySelection[0].previousTextFrame = null;
          if(myBfBreakFrame.overflows == true){
               var myOversetText = myBreakStory.texts.itemByRange(myBfBreakFrame.insertionPoints[-1],myBreakStory.insertionPoints[-1]);
               myOversetText.select();
               app.cut();
               app.select(myAfBreakFrame.insertionPoints[0]);
               app.paste();
          }
     }
}
 
 
function mySplitAfter() {
     if (mySelection[0].nextTextFrame == null) {
          alert("Unable Break Thread.\nThe selected Text Frame is the LAST text frame of the thread.");
     } else {
          var myBfBreakFrame = mySelection[0];
          var myAfBreakFrame = mySelection[0].nextTextFrame;
          var myBreakStory = myBfBreakFrame.parentStory;
          mySelection[0].nextTextFrame = null;
          if(myBfBreakFrame.overflows == true){
               var myOversetText = myBreakStory.texts.itemByRange(myBfBreakFrame.insertionPoints[-1],myBreakStory.insertionPoints[-1]);
               myOversetText.select();
               app.cut();
               app.select(myAfBreakFrame.insertionPoints[0]);
               app.paste();
          }
     }
}

//---------------------------------------------------------------------

if(app.documents.length != 0){
     var mySelection = app.activeDocument.selection;
     if(mySelection.length != 0){
          myObjectType = mySelection[0].constructor.name;
          if(myObjectType == "TextFrame"){
               //The Interface Dialog
               var myDialog = app.dialogs.add({name:"Story Splitter v"+ myScriptVer});
               with(myDialog){
                    with(dialogColumns.add()){
                         with (dialogRows.add()){
                              with(borderPanels.add()){
                                   var mySplitOptions = radiobuttonGroups.add();
                                   with(mySplitOptions){
                                        radiobuttonControls.add({staticLabel:"Split All Frames", checkedState:true});
                                        radiobuttonControls.add({staticLabel:"Split Before Selected Frame"});
                                        radiobuttonControls.add({staticLabel:"Split After Selected Frame"});
                                   }
                              }
                         }
                         with (dialogRows.add()){
                              staticTexts.add({staticLabel:"© The Final Touch"});
                         }
                    }
               
                    var myResult = myDialog.show({name:"SplitOptions"});
                    if(myResult == true){
                         var myStory = mySelection[0].parentStory;
                         if(app.version.split(".")[0] >= 5){
                              var myTextFrames = myStory.textContainers;
                         } else {
                              var myTextFrames = myStory.textFrames;
                         }
                         var myStoryFramesCount = myTextFrames.length;
                         if(myStoryFramesCount > 1){
                              for(f = 0; f < myStoryFramesCount; f++){
                                   if (mySelection[0] == myStory.textFrames[f]){
                                        var myTextFrame = f;
                                   }
                              }
                              switch(mySplitOptions.selectedButton){
                                   case 0:
                                        mySplitAll();
                                        break;
                                   case 1:
                                        mySplitBefore();
                                        break;
                                   case 2:
                                        mySplitAfter();
                                        break;
                              }
                              alert("Done!");
                         } else {
                              alert("Are You Kidding Me?!\nThe Story you selected has only ONE text frame.");
                         }
                    }
               }
          } else {
               alert("Wrong Selection\nYou selected the wrong type of object. Please select a Text Frame.");
          }
     } else {
          alert("No Selection Made.\nPlease select a Story to split.");
     }
} else {
     alert("No Active Document Found.\nPlease open an InDesign document and select a Story to split.");
} // EOF

