
/*

Text_2_Layer.jsx
Version 2.0

Indesign CS5 javascript
Bruno Herfst 2011

Move all text to new layer (except for locked layers)
Finds stories and moves all it’s textframes to a new layer.
This makes sure all text will be done even TextPaths.

12.12.13: Added layer support

*/

#target "InDesign"
var myDoc, selectedLayer = undefined;

function go() {
    //Make certain that user interaction (display of dialogs, etc.) is turned on.
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    if (app.documents.length != 0) {
        //get ref to doc
        myDoc = app.activeDocument;
        myDisplayDialog();
    } else {
        alert("Please open a document and try again.");
    }
}

//start dialog
function myDisplayDialog() {
    // Create lists
    var list_of_layers = myDoc.layers.everyItem().name;
    list_of_layers.push("[New Layer]");

    var myDialog = app.dialogs.add({
        name: "Move all text to layer"
    });

    with(myDialog.dialogColumns.add()) {
        var mySelectedLayer = dropdowns.add({
            stringList: list_of_layers
        });
        mySelectedLayer.selectedIndex = 0;
    }

    var myResult = myDialog.show();

    if (myResult == true) {
        if (mySelectedLayer.selectedIndex == list_of_layers.length - 1) {
            selectedLayer = createLayer();
        } else {
            selectedLayer = myDoc.layers[mySelectedLayer.selectedIndex];
        }

        myDialog.destroy();

        //do story
        if (selectedLayer != undefined) {
            doAllStories();
        }
    } else {
        myDialog.destroy();
        exit();
    }
}
//end dialog

function doAllStories() {
    //send every story to a new layer
    for (var i = 0; i < myDoc.stories.length; i++) {
        myStory = myDoc.stories.item(i);
        moveStoryToLayer(myStory, selectedLayer);
    }
    alert("All found text to layer " + selectedLayer.name);
}

function moveStoryToLayer(myStory, selectedLayer) {
    var myTextFrame;
    for (var myCounter = myStory.textContainers.length - 1; myCounter >= 0; myCounter--) {
        myTextFrame = myStory.textContainers[myCounter];
        switch (myTextFrame.constructor.name) {
        case "TextFrame":
            //I use a try statement here so it will continue moving text 
            //even if it finds text on a locked layer.
            try {
                myTextFrame.move(selectedLayer);
            } catch (myError) {}
            break;
        default:
            try {
                myTextFrame.parent.move(selectedLayer);
            } catch (myError) {}
        }
    }
}

function createLayer() {
    var layerName = prompt("New layer name:");
    if (layerName != null) {
        var layer = myDoc.layers.item(layerName);
        if (layer.isValid) {
            alert("Layer already exist!");
            createLayer();
        } else {
            layer = myDoc.layers.add({
                name: layerName
            });
            return layer;
        }
    } else {
        return undefined;
    }
}

go();

