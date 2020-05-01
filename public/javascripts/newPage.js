$( function() {
    console.log(friends)
    let checkbox = $('.private-container')
    checkbox.on('click', () => {
        if (!$('.checkbox').is(':checked')) {
            $('.usersInvolvedDiv').slideUp(300)
            return
        }
        $('.usersInvolvedDiv').slideDown(300)

    })
    function split( val ) {
        return val.split( /,\s*/ );
    }
    function extractLast( term ) {
        return split( term ).pop();
    }

    $('.involvedUsers').
        on( "keydown", function( event ) {
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
})
