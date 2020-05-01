

jQuery(document).ready(($) => {
    let prevNames = []
    let firstNames = $('.firstFileName')
    if($(window).width() < 1100 ) {
        
        Array.from(firstNames).forEach(e => {
            prevNames.push($(e).text())
            if($(e).text().length > 25 ) $(e).text($(e).text().slice(0, 15).trim() + '...')
        })
    }
    $(window).resize(() => {
      
        if($(window).width() < 1100 ) {
            Array.from(firstNames).forEach(( e )  => {
                prevNames.push($(e).text())
                if($(e).text().length > 25 ) $(e).text($(e).text().slice(0, 15).trim() + '...')
            })
        }
        else {
            Array.from(firstNames).forEach((e, index) => {
                if (prevNames.length > 0) {
                    $(e).text(prevNames[index].slice(0).trim())
                }
              
            })
        }
    })
       

    let userLink = $('.profileLink.profile')
    let friendsLink = $('.profileLink.friends')
    let favsLink = $('.profileLink.favorites')

    userLink.on('click', () => {
        document.location.href = '/profile'
    })
    friendsLink.on('click', () => {
        document.location.href = '/profile/friends'
    })
    favsLink.on('click', () => {
        document.location.href = '/new'
    })

    Array.from($('.saving')).forEach((e) => {
        $(e.childNodes[1].childNodes[1]).click(() => {
            $(e.childNodes[0]).animate({width:'toggle'}, 200);
        })
        $(e.childNodes[2]).hover(() => {
            if( $(e.childNodes[0]).is(':visible')) {
                $(e.childNodes[0]).animate({width: 'toggle'}, 200)
            }
        })
        $(e).mouseleave(() => {
            if( $(e.childNodes[0]).is(':visible')) {
                $(e.childNodes[0]).animate({width: 'toggle'}, 200)
            }
        })
    })
})