
jQuery(document).ready($ => {
    const appName = $('.brand')
    const globalSearchInput = $('#globalSearch')
    const searchResultsBox = $('#searchResults')
    replaceResults()
    searchResultsBox.empty().append('<div class="empty-result">Нет результатов</div>')

    function showResults() {
        searchResultsBox.show(100)
    }
    function hideResults() {
        searchResultsBox.hide(100)
    }
    globalSearchInput.focus(showResults)
    globalSearchInput.focusout(hideResults)
    $(window).resize(replaceResults)
    function replaceResults() {
        const globalSearchOffsetLeft = globalSearchInput.offset().left
        const globalSearchOffsetTop = globalSearchInput.offset().top + globalSearchInput.height()
        searchResultsBox.show()
        searchResultsBox.width(globalSearchInput.width())
        searchResultsBox.offset({ top : globalSearchOffsetTop + 10, left: globalSearchOffsetLeft})
        searchResultsBox.hide()
    }

    appName.on('click', () => {
        window.location.href = '/savings/'
    })

    globalSearchInput.keyup(() => {
        if(globalSearchInput.val().trim() == '') return searchResultsBox.empty().append('<div class="empty-result">Нет результатов</div>')
        $.ajax('/search/findQuery', {
            data: {
                findString: globalSearchInput.val()
            },
            success: function (capturedData) {
                searchResultsBox.empty()
                if (capturedData.length == 0) return searchResultsBox.empty().append('<div class="empty-result">Нет результатов</div>')
                capturedData.forEach( item =>  {
                    if ( item.userName ) {
                        searchResultsBox.append(`
                            <div class='search-result-row result-profile' data-profileId='${item.profileId}'>
                                <div class='search-result-user-name'>${item.userName}</div>
                                <div class='search-result-profile-id'>${item.profileId}</div>
                            </div>
                        `)
                    } else {
                        searchResultsBox.append(`
                            <div class='search-result-row result-saving' data-savingId='${item.savingId}'>
                                <div class='search-result-saving-name'>${item.name}</div>
                                <div class='search-result-owner-name'>${item.owner.name}</div>
                            </div>
                        `)
                    }
                })
                Array.from($('.search-result-row')).forEach((link) => {
                    $(link).click(() =>{
                        const User = $(link).attr('data-profileId')
                        if (User) document.location.href = `/profile/${User}`
                        else document.location.href = `/savings/${$(link).attr('data-savingId')}/`
                    })
                })
            }
        })
    })

})