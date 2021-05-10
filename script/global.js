function saveData(jData, file)
{
	localStorage.setItem(file, JSON.stringify(jData));
}

function loadData(file, action, initData)
{
	if(localStorage.getItem(file))
		data = localStorage.getItem(file);
	else
		data = initData;
	action(JSON.parse(data));
}
	
function loadSaveCash(data)
{
	$('#showCash').attr('data-original-title','Voir la caisse à '+data['timeCash'].time);
	$('#modalTitle').text('Caisse à '+data['timeCash'].time+' le '+data['timeCash'].date);
	var tt=0;
	$('#modalControl input').each(function(){
		$(this).val(data[$(this).prev().attr('for')]);
		tt+= data[$(this).prev().attr('for')];
		inputEffect(this);
	});
	$('#totalShow').text(Math.round(tt*100)/100);
}

function loadCash(data)
{
	cash = data;
	var total = 0;
	$('#control input').each(function(){
		$(this).val(cash[$(this).attr('id')]);
		total+= cash[$(this).attr('id')];
		inputEffect(this);
	});

	$('#total').text(Math.round(total*100)/100);
	
	if($('#total').text()!=0)
		$('#lock').bootstrapToggle('on');
	else
		$('#lock').bootstrapToggle('off');
}

function loadNotes(data)
{
	if(data !== '')
	{
		notes = data;
		notes.forEach(addNote);
	}
}

function addNote(note)
{
	$('#list ul').append('<li class="context-menu-one'+((note.tag)?' tag':'')
		+((note.done)?' done"':'"')
		+' >'+note.txt+'</li>');
}


function inputEffect(input)
{
	if ($(input).val()==0){
		$(input).val(0).css('color','#555555').prev().css({'background-color':'#EEEEEE','color':'#555555'});
	}else{
		$(input).css('color','#00B69E').prev().css({'background-color':'#00C3A9','color':'white'});
	}	
}

function cashInputEvents()
{
	$('#control input')
	.click(function(){
		$(this).select();
	})
	.change(function(){
		inputEffect(this);
		cash[$(this).attr('id')] = ($(this).val()*1); 
		var total = 0;
		$('#control input').each(function(){
			total+= cash[$(this).attr('id')];
		});
		$('#total').text(Math.round(total*100)/100);
		var timeCash = new Date();
		cash['timeCash'] = {time : timeCash.getHours()+"h"+timeCash.getMinutes(),date : timeCash.getDate()+"/"+(timeCash.getMonth()+1)};
		saveData(cash,file.cash);
	})
	.keypress(function(e) {
		if (!String.fromCharCode(e.which).match(/[0-9.]/) && e.which !== 8 && e.which !== 9 )
				return false;
	})
	.keyup(function(e) {
		if(e.which == 13)
			$(this).parent().next().find('input').click();
		else	
			if(e.which == 110 && isNaN($(this).val()))	
			{
				$(this).val("0.");
			}
	})
	.focus(function(){
		$(this).parent().css('width','165px');
	})
	.blur(function(){
		$(this).parent().css('width','150px');
	});

	$('form').submit(function(e){
		var note = { txt: '', tag: 0, done: 0 };
		note.txt = $('#textNote').val(); 
		if(note.txt.trim()!==''){
			addNote(note);
			$('#textNote').val('');
			notes.push(note);
			saveData(notes,file.notes);	
		}
		e.preventDefault();
	});	
}

function notesSortableEvents()
{
	$('#list ul').sortable({
  		start: function(event, ui) {
  			fIndex = $('#list li').index(ui.item); 			
		},
		update: function(event, ui) {
  			var note = notes[fIndex];
  			notes.splice(fIndex,1);
  			notes.splice($('#list li').index(ui.item),0,note);
			saveData(notes,file.notes);
		}
	}).on('edit', function(event, $editor){
		$editor.css({'background-color':'white','width':'100%'});
		$editor[0].setSelectionRange($editor.val().length,$editor.val().length);
	});

}

function notesGlobalEvents()
{
    $('form textarea').val('');

 	$('#delNotes').click(function(){
		$('#delNotes').parent().tooltip('destroy');
		$('#delNotes').css('background-position','bottom right');
	});

	$('[data-toggle=confirmation]').confirmation({
  		rootSelector: '[data-toggle=confirmation]',
  		btnOkLabel : 'Oui',
  		btnCancelLabel : 'Non',
  		popout : true,
  		onConfirm: function() {
  			$('#notes li').fadeOut(function(){ $('#notes li').remove(); });
			notes = [];
			saveData(notes,file.notes);
		  }
	});

	$("body").on('hideConfirmation',function(){
		$('[data-toggle="tooltip"]').tooltip();
		$('#delNotes').css('background-position','bottom left');
	});
}

function notesContextMenu()
{
	    $.contextMenu({
        selector: '.context-menu-one',
        events: {
			show : function(options){
        		$(this).addClass('hover');
			},
			hide : function(options){
			  	if(!$(this).attr('data-is-editing')) $(this).removeClass('hover');	   
			},
		},
        build: function($trigger, e) {

		return {
        callback: function(key, options) {
           	switch(key){
           		case 'edit' :
           			var textNote = $(this).text();
           			if($(this).is(':editable')) $(this).editable('destroy');
           			$(this).editable({event : 'i', closeOnEnter : true, callback : function(data){
           				var index = $('#list li').index($(data.$el));
           				if ($(data.$el).text()==''){
           					$(data.$el).text(notes[index].txt);
           				}else{
           					notes[index].txt = $(data.$el).text();
           					saveData(notes,file.notes);
           				}
           				$(data.$el).removeClass('hover');
           			}})
           			.editable('open');
           		break;
           		case 'delete' :
           			var index = $('#list li').index(this);
					notes.splice(index,1);
					$(this).fadeOut(function(){ $(this).remove() });
					saveData(notes,file.notes);
           		break;
           		case 'important' :
           		case 'simple' :
           			var index = $('#list li').index(this);
					notes[index].tag = !notes[index].tag;
					$(this).toggleClass('tag');
					saveData(notes,file.notes);
           		break;
           		case 'done' :
           		case 'nDone' :
           			var index = $('#list li').index(this);
					notes[index].done = !notes[index].done;
					$(this).toggleClass('done');
					saveData(notes,file.notes);
           		break;
           	
           	}

			 
        },
        items: {
			"edit": {name: "Modifier cette note", icon: "edit", visible: function(key, opt){
            	if($(this).hasClass('done'))	return false;
            	return true;
          	}},
            "important": {name: "Marquer comme importante", icon: "important", visible: function(key, opt){
            	if($(this).hasClass('done') || $(this).hasClass('tag'))	return false;
            	return true;
          	}},
            "simple": {name: "Marquer comme simple", icon: "simple", visible: function(key, opt){        
            	if(!$(this).hasClass('done') && $(this).hasClass('tag'))	return true;
            	return false;
          	}},
          	"sep1": !$trigger.hasClass('done') ? "------" : {visible : false},
			"done": {name: "Cocher cette note", icon: "done", visible: function(key, opt){        
            	if($(this).hasClass('done'))	return false;
            	return true;
          	}},
            "nDone": {name: "Rétablir cette note", icon: "nDone", visible: function(key, opt){        
            	if($(this).hasClass('done'))	return true;
            	return false;
          	}},
            "delete": {name: "Supprimer cette note", icon: "delete"}
        }
    };} });
}

function textareaInsertEvents()
{
	(function ($, undefined) {
    $.fn.getCursorPosition = function() {
        var el = $(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }
	})(jQuery);

     $('#room').click(function(){
     	var textarea = $('form textarea');
     	var position = $(textarea).getCursorPosition();
     	var txt = textarea.val();
     	textarea.val(txt.substring(0,position)+'#__'+txt.substring(position,txt.length)).select();
     	textarea[0].setSelectionRange(position+1,position+3);
     });

     $('#alarm').click(function(){
     	var textarea = $('form textarea');
     	var txt = 'RÉVEIL : #__ à __h__';
     	textarea.val(txt).select();
     	textarea[0].setSelectionRange(textarea.val().length-10,textarea.val().length-8);
     });

     $('#taxi').click(function(){
     	var textarea = $('form textarea');
     	var txt = 'TAXI : #__ à __h__ avec ____';
     	textarea.val(txt).select();
     	textarea[0].setSelectionRange(textarea.val().length-20,textarea.val().length-18);
     });

	  $('form textarea').keypress(function (e) {
	    if(e.which == 13) {
	        e.preventDefault();
	        $('form').submit();
	    }
	  });

}

function cashGlobalEvents()
{
	$('#delCash').click(function(){
		$('#control input').each(function(){
			$(this).val(0);
			cash[$(this).attr('id')] = 0;
			inputEffect(this);
		});
		var timeCash = new Date();
		cash['timeCash'] = {time : timeCash.getHours()+"h"+timeCash.getMinutes(),date : timeCash.getDate()+"/"+(timeCash.getMonth()+1)};
		saveData(cash,file.cash);
		$('#total').text('0');
	});

	$('#lock').change(function(){
		$('#control input').attr('disabled',this.checked);
		if(this.checked){
			$('#showCash').hide();
			$('#saveCash').show();
			$('#delCash').hide();
		}else{
			$('#delCash').show();
			$('#showCash').show();
			$('#saveCash').hide();
		}
	});

	$('#saveCash').click(function(){
		var timeCash = new Date();
		cash['timeCash'] = {time : timeCash.getHours()+"h"+timeCash.getMinutes(),date : timeCash.getDate()+"/"+(timeCash.getMonth()+1)};
		saveData(cash, file.saveCash)
		$('#showCash').attr('data-original-title','Voir la caisse à '+cash['timeCash'].time);
		$('#modalTitle').text('Caisse à '+cash['timeCash'].time+' le '+cash['timeCash'].date);
		$(this).fadeOut('slow');
		loadSaveCash(cash);
	});

	$('#showCash').click(function(){
		$('#show').click();
	});
}






var cash, saveCash, notes = [];
var file = { cash : "cash", saveCash: "saveCash", notes : "notes"}
var dataInit =  { cash : JSON.stringify({"bill":0,"euro2":0,"euro1":0,"cent50":0,"cent20":0.0,"cent10":0.0,"cent5":0.0,"cent2":0.0,"cent1":0.0,"loan":0,"timeCash":{"time":"0h00","date":"1/1"}}) , saveCash: JSON.stringify({"bill":0,"euro2":0,"euro1":0,"cent50":0,"cent20":0.0,"cent10":0.0,"cent5":0.0,"cent2":0.0,"cent1":0.0,"loan":0,"timeCash":{"time":"0h00","date":"1/1"}}), notes : JSON.stringify([{"txt":"exemple note","tag":0,"done":0}])}
$(function(){

    $('[data-toggle="tooltip"]').tooltip();


	loadData(file.cash,loadCash, dataInit.cash);
	loadData(file.notes,loadNotes, dataInit.notes);
	loadData(file.saveCash,loadSaveCash, dataInit.saveCash);

	cashInputEvents();
	
	notesSortableEvents();

	notesGlobalEvents();

	notesContextMenu();

	textareaInsertEvents();

    	cashGlobalEvents();
	$('#lock').bootstrapToggle('off');

});
