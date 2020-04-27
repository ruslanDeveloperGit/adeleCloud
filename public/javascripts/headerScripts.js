let toNewButton = $('.create-new-button')
let appName = $('.brand')

toNewButton.on('click', () => {
    window.location.href = '/savings/new'
})

appName.on('click', () => {
    window.location.href = '/savings/'
})