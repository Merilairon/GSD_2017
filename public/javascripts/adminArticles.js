var storage = localStorage;

$(function launchEditor() {
    $('#editor').summernote({
        height: 600,
        callbacks: {
            onImageUpload: function(files, editor, welEditable) {
                sendFile(files[0], editor, welEditable);
            }
        }
    });
    $('#preview').summernote({
        height: 200,
        callbacks: {
            onImageUpload: function(files, editor, welEditable) {
                sendFile(files[0], editor, welEditable);
            }
        }
    });
});

$(function fillTable() {

    //Sorting

    $("#articlesTable").stupidtable();
    $("#articlesTable thead th:first-child").stupidsort('desc');

    $.get('/getArticles')
        .done(function(data) {
            $.each(data.articles, function() {
                var tr = this;
                var $trElement = $("<tr>")
                    .append($("<td>").text(this.id))
                    .append($("<td>").text(this.title))
                    .append($("<td>").text(this.date.substring(0, 10).split('-').reverse().join('-') + " " + this.date.substring(11, 19)))
                    .append($("<td>").text(this.creator));
                $("#articlesTable tbody").append($trElement);

                $($trElement).click(function(e) {
                    $("#articleInfo").show();
                    $.each($("tbody tr"), function(val) {
                        this.style.backgroundColor = "#f9f9f9";
                    });
                    this.style.backgroundColor = "#AFC4DA";

                    $("#title").val(tr.title);
                    $('#editor').summernote('code', tr.content);
                    $('#preview').summernote('code', tr.preview);

                    $("#saveArticle").unbind('click').click(function(e) {
                        //change article

                        $.post("/changeArticle", {title: $("#title").val(), preview: $('#preview').summernote('code'), content: $('#editor').summernote('code'), id: tr.id })
                            .done(function(data) {
                                setTimeout(window.location.replace("/admin/homepage/articles"), 500);
                            });
                    });

                    $("#deleteArticle").unbind('click').click(function(e) {
                        //delete article

                        $.post("/deleteArticle", {id: tr.id })
                            .done(function(data) {
                                setTimeout(window.location.replace("/admin/homepage/articles"), 500);
                            });
                    });
                });
            });
        });
});

$(function addButtonBehaviour() {
    $("#addArticle").click(function(e) {
        $("#articleInfo").show();
        $.each($("tbody tr"), function(val) {
            this.style.backgroundColor = "#f9f9f9";
        });

        $("#title").val("");
        $('#editor').summernote('code', "");
        $('#preview').summernote('code', "");
        $("#saveArticle").unbind('click').click(function(e) {
            $.post("/addArticle", {title: $("#title").val(), preview: $('#preview').summernote('code'), content: $('#editor').summernote('code') })
                .done(function(data) {
                    setTimeout(window.location.replace("/admin/homepage/articles"), 500);
                });
        });
        $("#deleteArticle").unbind('click').click(function(e) {
            window.location.replace("/admin/homepage/articles")
        });
    });
});

function sendFile(file, editor, welEditable) {
    data = new FormData();
    data.append("imgUpload", file);
    console.log('image upload:', file, editor, welEditable);
    console.log(data);
    $.ajax({
        data: data,
        type: "POST",
        url: "/upload",
        cache: false,
        contentType: false,
        processData: false,
        success: function(url) {
            var image = $('<img>').attr('src', url.imageName);
            $('#editor').summernote("insertNode", image[0]);
            console.log(url.imageName);
        }
    });
}