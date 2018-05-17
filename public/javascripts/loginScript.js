var loginModule = (function() {
    var loginTemplate = {
            username: '',
            password: ''
        },
        login;
    var storage = localStorage;

    var init = function() {
        $("#username").keyup(function(event) {
            if (event.keyCode == 13) {
                $("#login").click();
            }
        });
        $("#password").keyup(function(event) {
            if (event.keyCode == 13) {
                $("#login").click();
            }
        });
        $("#login").click(function(e) {
            $("#title p").remove();
            $("#username").parent().removeClass("has-error");
            $("#password").parent().removeClass("has-error");
            login = $.extend(true, {}, loginTemplate);
            sentData();
        });
    };

    var sentData = function() {
        login.username = $("#username").val();
        login.password = $("#password").val();
        $.ajax({
            type: 'POST',
            url: "/login",
            data: login,
            success: function(data) {
                if (data.success === true) {
                    window.location.href = "/home/1"
                } else {
                    errorToHTML();
                }
            },
            error: function(xhr, status, error) {
                console.log('Error: ' + error.message);
            }
        });
    };

    var errorToHTML = function() {
        $("#title").append($("<p>").text("Password or/and Username is incorrect").css("color", "red").addClass("col-sm-9")
            .addClass("col-sm-offset-2"));
        $("#username").parent().addClass("has-error");
        $("#password").parent().addClass("has-error");
    }

    return {
        init: init
    };
})();

window.onload = function() {
    loginModule.init();
};