
// As described here: https://forums.adobe.com/thread/602984  

var action_Clear_Effects = app.menuActions.itemByID(67880)  
var action_Clear_Transparency = app.menuActions.itemByID(67897) 

function clear(doc, clearEffects, clearTransparency){
  if(action_Clear_Effects && action_Clear_Transparency && (clearTransparency || clearEffects)){  
     for(var i=0; i<doc.spreads.length; i++){  
          doc.select(doc.spreads[i].allPageItems,SelectionOptions.REPLACE_WITH);
          if(action_Clear_Transparency.enabled && clearTransparency){  
              action_Clear_Transparency.invoke();  
          }
          if(action_Clear_Effects.enabled && clearEffects){  
              action_Clear_Effects.invoke();  
          }
     }  
  }  
  alert("Done");
}

function main(doc){
  var dlg = app.dialogs.add({name:"Quarkify ;)"});
  with(dlg.dialogColumns.add()){
    with(dialogRows.add()){
      var clear_Effects = checkboxControls.add({ staticLabel : 'Clear all effects', checkedState : true });
    }
    with(dialogRows.add()){
      var clear_Transparency = checkboxControls.add({ staticLabel : 'Clear all transparency', checkedState : true });
    }
  }
  if(dlg.show() == true){
    clear(doc, clear_Effects.checkedState, clear_Transparency.checkedState);
  }
}

if (app.documents.length == 0){
  alert("Open a document before running this script.");
} else {
  main(app.activeDocument);
}