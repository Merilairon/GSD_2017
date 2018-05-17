$(function() {
    $(".editButton").click(function(e) {
        var message = $(this).parents(".comment").find(".commentMessage").html();
        console.log(message);
        $(this).parents(".comment").find(".commentMessage").summernote('code', $(this).parents(".comment").find(".commentMessage").html());
        $(this).parents(".comment").find(".commentMessage").parent()
            .append($("<button>").addClass("btn btn-success col-md-4 offset-md-1").text("Save Comment").click(function(e) {
                $(this).parent().find(".commentMessage").html($(this).parents(".comment").find(".commentMessage").summernote('code'));
                $(this).parents(".comment").find(".commentMessage").summernote('destroy');
                $.post('/changeComment', {
                    date: $(this).parents().eq(2).find(".dateSent").text(),
                    message: $(this).parents(".comment").find(".commentMessage").html()
                });
                setTimeout(location.reload(), 500);
                $(this).parent().find("button").remove();
            }))
            .append($("<button>").addClass("btn btn-danger col-md-4 offset-md-2").text("Cancel").click(function(e) {
                $(this).parents(".comment").find(".commentMessage").summernote('destroy');
                $(this).parents(".comment").find(".commentMessage").html(message);
                $(this).parent().find("button").remove();
            }));
    });
})