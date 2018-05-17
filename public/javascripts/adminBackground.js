var storage = localStorage;
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

$(function buttonBehaviour() {
    $("#saveBackground").click(function(e) {
        if (isUploaded) {
            $.post("/changeBackground", { sessionID: storage.getItem("sessionID"), backgroundImg: imageURL })
                .done(function(data) {
                    setTimeout(window.location.replace("/admin/background"), 500);
                });
        }
    })
})