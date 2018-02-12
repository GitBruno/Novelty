// DESCRIPTION: Launch a script by typing its name or picking it from a recent-history list
// Peter Kahrel 2006-2011 -- www.kahrel.plus.com


// Look for scripts in subfolders added by Bruno Herfst 2013
// Recommended shortcut: F4

#target indesign;

try {app.doScript (get_script ())}
    catch (e) {alert (e.message + "\r(line " + e.line + ")")};

function get_script ()
    {
    var script_dir = find_script_dir();
    var fstring = script_dir + "/runscript-last.txt";
    var history = get_history (fstring);
    if (history.length > 0)
        {
        if (history[0].indexOf("true") > -1 || history[0].indexOf("false") > -1)
            {
            var temp = history[0].split("£");
            var filter_check_history = eval(temp[0]);
            try {keep_filter_history = eval(temp[1]);} catch(_){keep_filter_history = false;}
            try {filter = temp[2];} catch(_){filter = "";}
            history.shift();
            }
        }

    var scripts = get_scripts (script_dir);
    if (history.length === 0)
        var droplist = scripts.name;
    else
        var droplist = history.concat ("------------------------------------------------------------------").concat (scripts.name);
    var ListLength = droplist.length;
    var w = new Window ("dialog", "Script launcher", undefined, {closeButton: false});
        var filter, i;
        var main = w.add ("group");
            main.orientation = "column";
            var entry = main.add ("edittext", undefined, droplist[0]);
            entry.minimumSize.width = 300;
            var list = main.add ("listbox", undefined, droplist);
                list.preferredSize = [300, 280];
                list.selection = 0;

            var options = main.add ("group");
                options.alignment = "left";
                var filter_check = options.add ("checkbox", undefined, "\u00A0Filter list\u00A0");
                    try {filter_check.value = filter_check_history;} catch(_){filter_check.value = false;}
                var keep_filter = options.add ("checkbox", undefined, "\u00A0Apply filter on next run\u00A0");
                    try {keep_filter.value = keep_filter_history;} catch(_){keep_filter.value = false;}

        var buttons = w.add ("group");
            buttons.alignment = "right";
            ok_button = buttons.add ("button", undefined, "OK", {name: "OK"});
            buttons.add ("button", undefined, "Cancel", {name: "cancel"});

        entry.onChanging = FilterList;

        function FilterList ()
            {
            filter = entry.text;
            if (filter_check.value)
                {
                filter = entry.text;
                list.removeAll();
                for (i = 0; i < droplist.length; i++)
                    {
                    if (droplist[i].toLowerCase().indexOf (filter.toLowerCase()) > -1 || droplist[i].slice (0,3) === "---")
                        {
                        list.add ("item", droplist[i]);
                        }
                    }
                list.items[0].text.slice(0,3)==="---" ? list.selection = 1 : list.selection = 0;
                }
            else
                {
                i = 0;
                // Look for the first match
                while (i < ListLength && list.items[i].text.toLowerCase().indexOf (filter.toLowerCase()) < 0) {++i;}
                if (list.items[i].text.toLowerCase().indexOf (filter.toLowerCase()) > -1)
                    {
                    // select it
                    list.selection = i;
                    // then centre it in the listbox
                    if (i < ListLength-7) {list.revealItem(i+7);}
                    else {list.revealItem(ListLength-1);}
                    }
                }
            } // entry.onChanging


        list.addEventListener("click", function (event)
            {
            if (event.detail == 2 /*if double-click*/)
              w.close (1);
            }
        );


        w.onShow = function ()
            {
            w.layout.layout();
            entry.active = true;
            if (filter !== "" && filter_check.value)
                {
                entry.text = filter;
                FilterList();
                }
            }

        if (w.show () == 2)
            {
            w.close ();
            exit ();
            }
        else
            {
            var script = list.selection.text;
            if (!keep_filter.value) filter = "";
            store_history (fstring, script, history, filter_check.value, keep_filter.value, filter);

            for(var i = 0; i < scripts.name.length; i++) {
			  if(scripts.name[i] == script) {
				return scripts.path[i];
			  }
			}
            return null;
            }
    } // function drop_typeahead


function get_scripts (script_dir) {
    var files = new Object();
    files.path = new Array();
    files.name = new Array();

    var fileList = getAllFiles(script_dir),
	i, file;

    for (i = 0; i < fileList.length; i++) {
    	file = fileList[i];
    	if (file instanceof File && file.name.match(/\.jsx?$/i)) {
    		if(!file.name.match(/runscript.jsx/i)){
				files.path.push(file);
				files.name.push(file.name);
			}
		}
    }
    return files
}

function getAllFiles(thisDir){
	var fileList = Folder (thisDir).getFiles(),
	i, file;

    for (i = 0; i < fileList.length; i++) {
    	file = fileList[i];
    	if (file instanceof Folder) {
			fileList = fileList.concat(getAllFiles(file));
		}
    }
    return fileList;
}

function get_history (fstring)
    {
    var f = File (fstring);
    var h = [];
    if (f.exists)
        {
        f.open ("r");
        var temp = f.read ();
        f.close();
        var h = temp.split ("\n");
        }
    return h
    }


function store_history (fstring, new_item, history, filter_check, keep_filter, filter)
    {
    history = insert_item (new_item, history);
    var f = File (fstring);
    f.open ("w");
    f.write (filter_check+"£"+keep_filter+"£"+filter + "\n" + history);
    f.close ();
    }

// Update the history list

function insert_item (new_item, history)
    {
    // Add \n at beginning and end
    var s = "\n" + history.join ("\n") + "\n";
    // Delete the script's name from the history list (if it's there)
    s = s.replace ("\n"+new_item+"\n", "\n");
    // Add the script's name at the beginning
    s = new_item+s;
    // If there are more than 15 items, chop off the last one
    if (s.match (/\n/g).length > 15)
        s = s.replace (/\n[^\n]+\n$/, "\n");
    // Delete trailing returns
    s = s.replace (/[\n]+$/, "");
    return s
    }


function find_script_dir()
    {
    try {return File (app.activeScript).path}
    catch(e) {return File (e.fileName).path}
    }
