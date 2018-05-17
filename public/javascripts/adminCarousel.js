var imageURL = "";
var isUploaded = false;

$(function fileInputLoader() {
    $("#imageName").fileinput({
        showPreview: false,
        allowedFileExtensions: ["jpg", "jpeg", "gif", "png"],
        elErrorContainer: "#errorBlock",
        uploadAsync: true,
        uploadUrl: "/upload" // your upload server url
    });

    $('#imageName').on('fileuploaded', function(event, data, previewId, index) {
        imageURL = data.response.imageName;
        isUploaded = true;
    });
});

$(function articleLoader() {
    $.get('/getArticles')
        .done(function(data) {
            $.each(data.articles, function() {
                $("#buttonLink")
                    .append($("<option>").text(this.id));
            });
        });
});

$(function carouselLoader() {
    $.get("/getCarouselItems")
        .done(function(data) {
            $.each(data.carouselItems, function() {
                var tr = this;
                var $trElement = $("<tr>")
                    .append($("<td>").text(this.id))
                    .append($("<td>").text(this.content))
                    .append($("<td>").text(this.date.substring(0, 10).split('-').reverse().join('-') + " " + this.date.substring(11, 19)))
                $("#carouselTable tbody").append($trElement);

                $($trElement).click(function(e) {
                    $("#carouselInfo").show();
                    $.each($("tbody tr"), function(val) {
                        this.style.backgroundColor = "#f9f9f9";
                    });
                    this.style.backgroundColor = "#AFC4DA";
                    $("#buttonLink option:contains(" + tr.link + ")").attr("selected", "selected");
                    $("textarea#editor").val(tr.content);
                    $(".file-caption-name").text(tr.image.substring(8, tr.image.length));
                    isUploaded = true;
                    imageURL = tr.image;


                    $("#saveCarouselItem").unbind('click').click(function(e) {
                        //change carousel
                        if (isUploaded) {
                            var articleLink = 'NULL';
                            if ($("#buttonLink").val() !== "No Article") {
                                articleLink = $("#buttonLink").val();
                            }
                            $.post("/changeCarouselItem", { id: tr.id, image: imageURL, content: $("textarea#editor").val(), link: articleLink })
                                .done(function(data) {
                                    setTimeout(window.location.replace("/admin/homepage/carousel"), 500);
                                });
                        }
                    });

                    $("#deleteCarouselItem").unbind('click').click(function(e) {
                        //delete carousel

                        var articleLink = 'NULL';
                        if ($("#buttonLink").val() !== "No Article") {
                            articleLink = $("#buttonLink").val();
                        }
                        $.post("/deleteCarouselItem", { id: tr.id })
                            .done(function(data) {
                                setTimeout(window.location.replace("/admin/homepage/carousel"), 500);
                            });
                    });
                });
            });
        })
});

$(function addButtonBehaviour() {
    $("#addCarouselItem").click(function(e) {

        imageURL = "";
        isUploaded = false;

        $("#carouselInfo").show();
        $.each($("tbody tr"), function(val) {
            this.style.backgroundColor = "#f9f9f9";
        });

        $(".file-caption-name").empty();
        $("#buttonLink option:selected").removeAttr("selected");
        $("textarea#editor").val("");
        $("#saveCarouselItem").unbind('click').click(function(e) {
            //add carousel
            if (isUploaded) {
                var articleLink = 'NULL';
                if ($("#buttonLink").val() !== "No Article") {
                    articleLink = $("#buttonLink").val();
                }
                $.post("/addCarouselItem", { image: imageURL, content: $("textarea#editor").val(), link: articleLink })
                    .done(function(data) {
                        setTimeout(window.location.replace("/admin/homepage/carousel"), 500);
                    });
            }
        });

        $("#deleteCarouselItem").unbind('click').click(function(e) {
            setTimeout(window.location.replace("/admin/homepage/carousel"), 500);
        });
    });
});