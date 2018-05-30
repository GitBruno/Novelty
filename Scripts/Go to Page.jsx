//DESCRIPTION: Go to a page in any book document
// Peter Kahrel -- www.kahrel.plus.com

(function () {
		
		function scriptPath () {
			try {
				return app.activeScript;
			} catch (e) {
				return File (e.fileName);
			}
		}

		function saveData (obj) {
			var f = File (scriptPath().fullName.replace (/\.jsx?(bin)?$/, '.txt'));
			f.open ('w');
			f.write (obj.toSource());
			f.close ();
		}

		function getPrevious () {
			var f = File (scriptPath().fullName.replace (/\.jsx?(bin)?$/, '.txt'));
			var obj = {};
			if (f.exists) {
				obj = $.evalFile(f);
			}
			return obj;
		}


	function findDocument (folio) {
		var docs = app.books[0].bookContents.everyItem().getElements();
		var ranges = [];
		var pp;
		for (var i = 0; i < docs.length; i++) {
			pp = docs[i].documentPageRange.split('-');
			first = Number(pp[0]);
			last = pp.length === 1 ? Number(pp[0]) : Number(pp[1]);
			if (folio >= first && folio <= last) {
				return docs[i].fullName;
			}
		}
		return null;
	}


	function bringToFront (doc) {
		if (!app.documents.item(doc.name).isValid) {
			app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
			app.open (doc);
			app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
		} else {
			app.activeDocument = app.documents.item(doc.name);
		}
		return app.documents[0];
	}

	function getPages () {
		var p = app.documents[0].pages.everyItem().name;
		p.push ('-');
		var m = app.documents[0].masterSpreads.everyItem().name;
		return p.concat (m);
	}


	function getActivePage () {
		var page = app.windows[0].activePage;
		if (page.parent instanceof MasterSpread) {
			return page.parent.name;
		}
		return page.name;
	}


	function goToPage (folio) {
		// Master spread?
		if (folio.indexOf('-') > -1 && app.documents[0].masterSpreads.item(folio).isValid) {
			app.windows[0].activeSpread = app.documents[0].masterSpreads.item(folio);
			return;
		}
		// Current document?
		try {
			app.windows[0].activePage = app.documents[0].pages.item(folio);
			return;
		} catch (_) {
		}
		// Maybe in a different document
		if (app.books.length > 0) {
			var doc = findDocument (Number(folio));
			if (doc !== null) {
				bringToFront (doc);
				app.windows[0].activePage = app.documents[0].pages.item(folio);
				return;
			}
		}
		alert ('Can\'t find that page or master spread');
	}

	function main () {
		var previous = getPrevious();
		var w = new Window ('dialog {text: "Go to page", orientation: "row", alignChildren: "top", properties: {closeButton: false}}');
			try {w. location = previous.location} catch(_){};
			w.add ('statictext {text: "Page:"}');

			//w.list = w.add ('dropdownlist', undefined, getPages());
			var names = getPages();
			w.main = w.add ('group');
				w.main.group = w.main.add ('group {alignChildren: "left", orientation: "stack"}');
				if (File.fs != 'Windows') {
					w.list = w.main.group.add ('dropdownlist', [0,0,160,20], names);
					w.input = w.main.group.add ('edittext', [0,0,140,20]);
				} else {
					w.input = w.main.group.add ('edittext', [0,0,140,20]);
					w.list = w.main.group.add ('dropdownlist', [0,0,160,20], names);
				}

			w.buttons = w.add ('group {orientation: "column"}');
			w.buttons.add ('button {text: "OK"}');
			w.buttons.add ('button {text: "Cancel"}');
			
			w.list.onChange = function () {
				w.input.text = w.list.selection.text;
				w.input.active = true;
			}

			w.input.onChange = function () {
				w.list.selection.text = w.input.text;
				w.input.active = true;
			}

			var pg = getActivePage();
			w.input.text = pg;
			w.list.selection = w.list.find (pg);
			w.input.active = true;

		if (w.show() == 1) {
			saveData ({location: [w.location.x, w.location.y]});
			goToPage (w.list.selection.text);
		}
	}

	if (app.documents.length > 0) {
		main ();
	}

}());
