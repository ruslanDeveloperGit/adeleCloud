
jQuery(document).ready(function($) {
    
    const chooseFriendsButton = $('#chooseFriends')
    const chooseFriendsModal = $('.choose-friends-modal')
    const closeBtn = $('.btn-close-modal')
    const checkbox = $('.private-container') // private checkbox
    const friendsChoosedBox = $('.friendsChoosed')
    const showChoosedBtn = $('#showChoosed')
    const usersChoosedBox = $('#choosedUsersBox')
    const saveBtn = $('#saveBtn')
    const cancelBtn = $('#cancelBtn')
    const createBtn = $('#createBtn')
    let choosedFriends = []
    
    $('.create-saving').submit((e)=>{
       $('input[name="involved"]').attr('value', JSON.stringify(choosedFriends))
    }) 
    
    checkbox.on('click', () => { // if clicked, ask for adding friends
        if (!$('.checkbox').is(':checked')) {
            return $('.usersInvolvedDiv').slideUp(300)
        }
        $('.usersInvolvedDiv').slideDown(300)
    })
    function hideChoosed() {
        usersChoosedBox.hide(300)
        showChoosedBtn.text('Показать выбранных')
    }
    $('.wrapper').mouseleave(hideChoosed)
    chooseFriendsButton.hover(hideChoosed)
  

    chooseFriendsButton.click(() => {
        choosedFriends = []
        friendsChoosedBox.text(`${choosedFriends.length} / 9 друзей выбрано`)

        // bluring things on bg and showing modal
        $.ajax('/profile/getFriends', {
            dataType: 'json', // type of response data
            data: {
                profileId,

            },
            success: function (res) {   // success callback function
                    let friends =  res.friends

                    let friendsList = $('.modal-friends-list')
                    if (friends.length == 0 ) {
                        $(friendsList).append(`
                            <div class='emptyFriendsMessage'>
                                У вас пока ещё нет друзей.
                            </div>
                        `)
                        $('.wrapper').addClass('blured')
                        $('.navbar').addClass('blured')
                        chooseFriendsModal.show(500)
                        $('.action-buttons-container > .btn-success').attr('disabled', true)

                    } else {
                        Array.from(friends).forEach((friend) =>{
                            $(friendsList).append(`
                                <div class='modal-user-row d-flex justify-content-between'  data-profileId='${friend.profileId}'>
                                    <div class='friend-name'>${friend.name}</div>
                                    <div class='btn btn-outline-success add-user-button'>Добавить</div>
                                </div>
                            `)
                        })

                        let friendsRows = $('.modal-user-row')
                        Array.from(friendsRows).forEach((e) => {
                                $(e.childNodes[3]).click(() => {
                                if ($(e.childNodes[3]).hasClass('btn-outline-success')) {   // if button have succes class, it is not clicked yet 
                                    $(e.childNodes[3]).removeClass('btn-outline-success').addClass('btn-outline-danger').text('Удалить')
                                    // adding new user to array of choosed
                                    choosedFriends.push({
                                    name: $(e.childNodes[1]).text().trim(),
                                    profileId: $(e).attr('data-profileId')
                                    })
                                    usersChoosedBox.empty()

                                    choosedFriends.forEach((friend) => {
                                        usersChoosedBox.append(`
                                            <div class='choosed-user-row' data-profileId='${friend.profileId}'>
                                                ${friend.name}
                                            </div>
                                        `)
                                    }) 


                            } 
                            else { // else means user wants to delete user 
                           

                                $(e.childNodes[3]).removeClass('btn-outline-danger').addClass('btn-outline-success').text('Добавить')

                                // filtering for new array
                                let deleteUser = $(e).text().trim().split(' ')[0].replace('\n', '')
                                choosedFriends = choosedFriends.filter(user => {
                                   return user.name !== deleteUser
                                })
                                usersChoosedBox.empty()
                                choosedFriends.forEach((friend) => {
                                    usersChoosedBox.append(`
                                        <div class='choosed-user-row' title='Удалить' data-profileId='${friend.profileId}'>
                                            ${friend.name}
                                        </div>
                                    `)
                                }) 
                            }
                            friendsChoosedBox.text(`${choosedFriends.length} / 9 друзей выбрано`)
                            if(choosedFriends.length > 0) {
                                $('.privateSelectedMessage').hide(300)
                                // showChoosedBtn.removeClass('d-none')
                                showChoosedBtn.show()
                                chooseFriendsButton.text('Выбрать заново').removeClass('btn-success').addClass('btn-warning')
                            }
                            if (choosedFriends.length == 0) {
                                $('.privateSelectedMessage').show(300)
                                // showChoosedBtn.addClass('d-none')
                                showChoosedBtn.hide()
                                chooseFriendsButton.text('Выбрать друзей').removeClass('btn-warning').addClass('btn-success')
                            }
                            if (choosedFriends.length > 5) {
                                friendsChoosedBox.removeClass('file-size-green').addClass('file-size-orange')
                                if ( choosedFriends.length >= 8) {
                                    if(choosedFriends.length >= 9 ) return closeModal()
                                    friendsChoosedBox.removeClass('file-size-orange').addClass('file-size-red')
                                }
                            } else if (choosedFriends.length < 5) {
                                friendsChoosedBox.removeClass('file-size-orange').addClass('file-size-green')
                            }
                       
                        })
                    })
                }
                $('.wrapper').addClass('blured')
                $('.navbar').addClass('blured')
                chooseFriendsModal.show(500)
            }
            })
    })
            
    showChoosedBtn.click(()=>{
        if(!usersChoosedBox.is(':visible')) {
            usersChoosedBox.show(300)
            showChoosedBtn.text('Скрыть выбранных')
        }
        else {
            usersChoosedBox.hide(300)
            showChoosedBtn.text('Показать выбранных')
        }
    })
    function saveChoosed () {
        console.log(choosedFriends)
        $('.wrapper').removeClass('blured')
        $('.navbar').removeClass('blured')
        chooseFriendsModal.hide(500)
        $('.modal-friends-list').empty()
        if(choosedFriends.length > 0) {
            chooseFriendsButton.text('Выбрать заново').removeClass('btn-success').addClass('btn-warning')
        }
       
        
        friendsChoosedBox.text(`${choosedFriends.length} / 9 друзей выбрано`)
    }
    function closeModal () {
         // bluring things on bg and showing modal
        $('.wrapper').removeClass('blured')
        $('.navbar').removeClass('blured')
        chooseFriendsModal.hide(500)
        $('.modal-friends-list').empty()
        usersChoosedBox.empty()   
        $('.privateSelectedMessage').show(300)
        showChoosedBtn.hide()
        chooseFriendsButton.text('Выбрать друзей').removeClass('btn-warning').addClass('btn-success')
        choosedFriends = []
        friendsChoosedBox.text(`${choosedFriends.length} / 9 друзей выбрано`)
    }
    saveBtn.click(saveChoosed)
    cancelBtn.click(closeModal)
    closeBtn.click(closeModal)
    // double click on wrapper so close modal
    $('.wrapper.blured').dblclick(() => {
        closeModal()
    })
    // close modal with doubleclick on navbar
    $('.navbar.blured').dblclick(() => {
        // bluring things on bg and showing modal
        $('.wrapper').removeClass('blured')
        $('.navbar').removeClass('blured')
        chooseFriendsModal.hide(500)
   })
})
