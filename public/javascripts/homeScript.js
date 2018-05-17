$(function() {
    $.each($("iframe"), function() {
        $(this).addClass("embed-responsive-item");
        $(this).parent().addClass("embed-responsive").addClass("embed-responsive-16by9");
    });

    $.each($(".panel-body img"), function() {
        $(this).addClass("responsive-article-img");
    });

    $(".linkButton").click(function(e) {
        $("html, body").animate({ scrollTop: $($(this).attr("scrollTo")).offset().top }, 1000);
    });

});