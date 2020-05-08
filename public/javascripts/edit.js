jQuery(document).ready($ => {
    const deleteButtons = $('.delete-saving')
    const saveChangesButton = $('#saveChanges')
    const newNameInput = $('#newName')
    let deletedDocuments = [];

    saveChangesButton.click(() => {
        axios.post('/savings/edit/', {
            savingId, 
            newName: newNameInput.val(),
            filesToDelete: deletedDocuments
        })
        .then(() => {
            document.location.href = '/savings/' + savingId
        })
        .catch(e => {
           document.location.href = '/savings/'
        })
        
    })
   
   
    Array.from(deleteButtons).forEach((button) => {
        $(button).click(async() =>{
            
            if ($(button).hasClass('return-deleted')) {
                $(button).parent().parent().animate({
                    opacity: 1
                }, 400)
                $(button).removeClass('return-deleted').addClass('delete-saving')
                deletedDocuments = deletedDocuments.filter((file) => {
                    return file.id != $(button).attr('data-id')
                })
            
                return
            }
            $(button).parent().parent().animate({
                opacity: 0.6
            }, 400)
            $(button).addClass('return-deleted').removeClass('delete-saving')
            deletedDocuments.push({
                id: $(button).attr('data-id'),
                name: $(button).attr('data-file-name')
            })
        })
    })

    
})