$("#form").ajaxForm(function (response) {
    messageHandler(response);
});
$("#resetPass").click(function (e) {
    $.ajax({
        type: 'POST',
        url: '/resetPass',
        data: {
            password: $("#password").val(),
            confirmpassword: $("#confirmpassword").val(),
            token: $("#token").val()
        }
    }).done(function (data) {
        messageHandler(data);
    });
})


function messageHandler(response) {
    $("#Message").removeClass("alert-danger alert-success");
    $("#Message").text("");
    $("#Message").parent().parent().hide();
    $("#Message").text(response.message);
    if (response.success) {
        $("#Message").addClass("alert-success");
    } else {
        $("#Message").addClass("alert-danger");
    }
    $("#Message").parent().parent().show();
}