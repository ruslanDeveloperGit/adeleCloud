$( function() {
    
    if( friends.length > 0) {
        let checkbox = $('.private-container') // private checkbox
        checkbox.on('click', () => { // if clicked, ask for adding friends
            if (!$('.checkbox').is(':checked')) {
                return $('.usersInvolvedDiv').slideUp(300)
                
            }
            $('.usersInvolvedDiv').slideDown(300)
    
        })
        function split( val ) {
            return val.split( /,\s*/ );
        }

        function extractLast( term ) {
            return split( term ).pop();
        }

        $('.involvedUsers')
            .on( "keydown", function( event ) {
			        if ( event.keyCode === $.ui.keyCode.TAB &&
						    $( this ).autocomplete( "instance" ).menu.active ) {
					    event.preventDefault();
				    }
            })
            .autocomplete({
                source: function( request, response ) {
                    // delegate back to autocomplete, but extract the last term
                    response( $.ui.autocomplete.filter(
                        friends.split(','), extractLast( request.term ) ) );
                },
                select: function( event, ui ) {
                    var terms = split( this.value );
                    // remove the current input
                    terms.pop();
                    // add the selected item
                    terms.push( ui.item.value );
                    // add placeholder to get the comma-and-space at the end
                    terms.push( "" );
                    this.value = terms.join( ", " );
                    return false;
                }    
            })
        }
})
