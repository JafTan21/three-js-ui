$(document).ready(() => {
    console.log('hi')

    $(".welcome-button").click(() => {

        $('.left-part').animate({
            left: "-50%",
        }, 300);
        $('.right-part').animate({
            right: "-50%",
        }, 300, () => {
            $(".welcome").animate({
                top: "100%"
            }, 800);
        });

    });
});