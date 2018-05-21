/*
 *  Replace_Link_Tint.jsx
 *
 *  Bruno Herfst 2016
 *
 *  This script finds any links with a tint between x and y
 *  and replaces it with tint z
 *
 */

function replaceLinkTints( doc, x, y, z) {
  var c = 0, links = doc.links;
  if (x > y) {
    var ex=x, x=y, y=ex;
  }
  for(var i = 0; i < links.length; i++) {
    var link = links[i].parent;
    if( link.fillTint >= x && link.fillTint <= y ) {
      link.fillTint = z;
      c++;
    }
  }
  return c;
}

function main(){
  var dlg = app.dialogs.add({name:"Replace Link Tints"});
  
  with(dlg.dialogColumns.add()){
    with(dialogRows.add()){
      staticTexts.add({staticLabel:"Find links with tint value bewteen:"});
    }
    with(dialogRows.add()){
      with(borderPanels.add()){
        staticTexts.add({staticLabel:"Min:"});
        var xField = percentEditboxes.add({minimumValue:0, maximumValue:100});
        staticTexts.add({staticLabel:"Max:"});
        var yField = percentEditboxes.add({minimumValue:0, maximumValue:100});
      }
    }
    with(dialogRows.add()){
      staticTexts.add({staticLabel:"Replace with:"});
    }
    with(dialogRows.add()){
      with(borderPanels.add()) {
        staticTexts.add({staticLabel:"Tint:"});
        var zField = percentEditboxes.add({minimumValue:0, maximumValue:100});
      }
    }
  }

  //show dialog
  if(dlg.show() == true){
    return replaceLinkTints(app.activeDocument, xField.editValue, yField.editValue, zField.editValue );
  }

  return -1;
}

if (app.documents.length == 0){
  alert("Open a document before running this script.");
} else {
  var n = main();
  if(n >= 0) {
    alert("Updated " + n + " links.");
  }
}