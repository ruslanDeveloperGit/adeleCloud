let headerPosition = $('.navbar').offset().top;
let savingsPosition = $('.saving').offset().top;

$(window).on('scroll', function() {
    let userPosition = window.pageYOffset;
    console.log(userPosition, headerPosition)

    if(userPosition >=  savingsPosition + 100) {
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
