

jQuery(document).ready($ => {
    const savingInfo = $('#savingInfo');
    const infoButton = $('#infoButton')
    const deleteSavingButton = $('#deleteSaving')
    const deleteWarningModal = $('.confirm-deletion-modal')
    const continueBtn = $('#continueBtn')
    replaceInfo()

    continueBtn.click(() => {
        continueBtn.addClass('disabled')
        $('#cancelBtn').addClass('disabled')
        $('#closeModal').addClass('disabled')
        axios.post('/savings/delete',{
            savingId,
        })
        .then(() => {
            document.location.href= '/savings/'
        })
    })
    infoButton.hover(showInfo)
    infoButton.focus(showInfo)

    infoButton.mouseleave(hideInfo)
    infoButton.focusout(hideInfo)

    deleteSavingButton.click(showDeleteModal)
    $('#closeModal').click(hideDeleteModal)
    $('#cancelBtn').click(hideDeleteModal)

    function showDeleteModal() {
        $('.savingWrapper').addClass('blured')
        $('.navbar').addClass('blured')
        deleteWarningModal.show(200)

    }
   
    function hideDeleteModal () {
        $('.savingWrapper').removeClass('blured')
        $('.navbar').removeClass('blured')
        deleteWarningModal.hide(200)
    }

    function showInfo() {
        savingInfo.show()
    }
    function hideInfo() {
        savingInfo.hide()
    }

    $(window).resize(replaceInfo)

    function replaceInfo() {
        
        const  infoButtonOffsetTop = infoButton.offset().top
        const  infoButtonOffsetLeft = infoButton.offset().left
        savingInfo.show()
        savingInfo.offset({ top: infoButtonOffsetTop + 45, left: infoButtonOffsetLeft - 175 })
        savingInfo.hide()

    }
})