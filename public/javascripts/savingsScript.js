let headerPosition = $('.navbar').offset().top;
let savingsPosition = $('.saving').offset();

let savingsInfoTrigger = $('.userTotalSavings')
let savingsInfo = $('.savingsInfo')

for ( let i = 0; i < savingsInfo.length; i++ ) {
    savingsInfo.eq(i).hide().removeClass('hidden')
}

if( savingsPosition ) {
    $(window).on('scroll', function() {
        let userPosition = window.pageYOffset;
        console.log(userPosition, headerPosition)
    
        if(userPosition >=  savingsPosition.top + 100) {
            $('.userInfo').animate({
                opacity: 0
            }, 300)
        }
        if(userPosition <= headerPosition + 60) {
            $('.userInfo').animate({
                opacity: 1
            }, 300)
        }
    });
}


savingsInfoTrigger.on('click', async () => {
    for ( let i = 0; i < savingsInfo.length; i++ ) {
        if ( savingsInfo[i].classList.contains('slided') ) {

            savingsInfo.eq(i).removeClass('slided').slideDown()
            continue;
        }
        await savingsInfo.eq(i).slideUp(500).addClass('slided')
    }
})