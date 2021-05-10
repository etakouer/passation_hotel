// shift + <key> event

	var shiftKey = false;
	$('textarea').keyup(function(e) {
		if(e.which == 16) shiftKey = true;
		else shiftKey = false;
	}).keypress(function(e) {
   		 if(e.which == 13)
   		 {
   		 	if(shiftKey){
   		 		$(this).val($(this).val()+'\n');
   		 	}else{
	   		 	e.preventDefault();
	   		 	$('form').submit();
   		 	}
   		 }
 	});

// ---------------


// sub menu for contextMenu

	$.contextMenu.types.label = function(item, opt, root) {
        // this === item.$node

        $('<span><ul>'
            + '<li class="label1" id="tag">Rouge</li>'
            + '<li class="label2" id="done">Barée</li></ul>')
            .appendTo(this)
            .on('click', 'li', function() {
	            switch($(this).attr('id'))
	            {
	            	case 'tag' :
            			var index = $('#list li').index(root.$trigger);
						notes[index].tag = !notes[index].tag;
						$(root.$trigger).toggleClass('tag');
						saveData(notes,'notes.json');
	            	break;
	            	case 'done' :
	            		var index = $('#list li').index(root.$trigger);
						notes[index].done = !notes[index].done;
						$(root.$trigger).toggleClass('done');
						saveData(notes,'notes.json');
	            	break;
	            }

                root.$menu.trigger('contextmenu:hide');
            });

          this.addClass('labels').on('contextmenu:focus', function(e) {
            // setup some awesome stuff
        }).on('contextmenu:blur', function(e) {
            // tear down whatever you did
        }).on('keydown', function(e) {
            // some funky key handling, maybe?
        });
    };

// -----------------------------