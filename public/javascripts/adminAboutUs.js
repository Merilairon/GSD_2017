var storage = localStorage;

$(function launchEditor() {
    $('#editor').summernote({
        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Constantia','Courier New', 'Helvetica', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana', 'gw2_font'],
        height: 600,
        callbacks: {
            onImageUpload: function(files, editor, welEditable) {
                sendFile(files[0], editor, welEditable);
            }
        }
    });
    $.get('/getAboutUs')
        .done(function(data) {
            $('#editor').summernote('code', data.aboutUs);
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

$(function saveButtonBehaviour() {
    $("#saveAboutUs").click(function(e) {
        $.post('/saveAboutUs', { sessionID: storage.getItem("sessionID"), aboutUs: $("#editor").summernote('code') })
            .done(function() {
                setTimeout(window.location.replace("/admin/aboutUs"), 500);
            });
    });
});