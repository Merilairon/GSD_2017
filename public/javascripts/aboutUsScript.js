window.onload = function() {
    loggedInModule.init("About Us");

    $.each($(".panel-body img"), function() {
        $(this).addClass("responsive-article-img");
    });

    $.each($("iframe"), function() {
        $(this).addClass("embed-responsive-item");
        $(this).parent().addClass("embed-responsive").addClass("embed-responsive-16by9");
        $(this).parent().wrap($("<div>").addClass("col-sm-8").addClass("col-sm-offset-2").wrap($("<div>").addClass("row")));
    });

};