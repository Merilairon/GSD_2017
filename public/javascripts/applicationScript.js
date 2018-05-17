var applicationModule = (function() {
    var applicationTemplate = {
        firstName: '',
        gender: '',
        country: '',
        birthday: '',
        info: '',
        username: '',
        email: '',
        password: '',
        gw2name: '',
        gw2version: '',
        why: '',
        ts: '',
        forums: '',
        whatsapp: '',
        playstyle: '',
        days: [],
        times: [],
        questions: ''
    };
    var application;

    var init = function() {
        $("#submit").click(function(e) {
            application = $.extend(true, {}, applicationTemplate);
            if (controlFields()) {
                sentData();
            }
            window.scrollTo(0, 0);
        });
    };

    var yearsApart = function(dateString) {
        return new Date(new Date - new Date(dateString)).getFullYear() - 1970;
    }

    var sentData = function() {
        application['firstName'] = $("#name").val();
        application['gender'] = $("input[name='gender']:checked").val();
        application['country'] = $("#country").val();
        application['birthday'] = $("#date input").val().split("-").reverse().join("-");
        application['info'] = $("#info").val();
        application['username'] = $("#username").val();
        application['email'] = $("#email").val();
        application['password'] = $("#password").val();
        application['gw2name'] = $("#gw2acc").val();
        application['gw2version'] = $("#version").val();
        application['why'] = $("#guild").val();
        application['ts'] = $("#ts").val();
        application['forums'] = $("#forum").val();
        application['whatsapp'] = $("#whatsapp").val();
        application['playstyle'] = $("#playstyle").val();
        $.each($("#days input"), function() {
            if ($(this).is(":checked")) {
                application['days'].push($(this).val());
            }
        });
        $.each($("#times input"), function() {
            if ($(this).is(":checked")) {
                application['times'].push($(this).val());
            }
        });
        application['questions'] = $("#questions").val();

        $.ajax({
            type: 'POST',
            url: "/sentApplication",
            data: { "application": JSON.stringify(application) },
            success: function(data) {
                if (data.success === true) {
                    $("#panel").empty();
                    $("#panel")
                        .append($("<h2>").text("Application Sent").addClass("text-center"))
                        .append($("<p>").text('Your application for username "' + data.username + '" has successfully been created').addClass("text-center"))
                        .append($("<div>").addClass("text-center") //test button + on clicdk
                            .append($("<button>").addClass("btn").text("Go back to homepage").addClass("btn-primary").attr("type", "button").attr("id", "goHomeButton")));
                    $("#goHomeButton").click(function(e) {
                        window.location.href = "/";
                    });
                } else {
                    if (data.username !== "") {
                        $("#username").parent().addClass("has-error")
                            .append($("<p>").text("Username already in use!").css("color", "red").addClass("errorMessage"));
                    }
                    if (data.gw2name !== "") {
                        $("#gw2acc").parent().addClass("has-error")
                            .append($("<p>").text("Guild Wars 2 account already in use!").css("color", "red").addClass("errorMessage"));
                    }
                }
            },

            error: function(xhr, status, error) {
                console.log('Error: ' + error.message);
            }
        });
    };
    var validateEmail = function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    var validatePassword = function(password) {
        var re = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&?* "]).*$/
        return re.test(password);
    }

    var controlFields = function() {
        $("p").remove(".errorMessage");
        var error = false;
        if ($("#name").val() === "") {
            $("#name").parent().addClass("has-error")
                .append($("<p>").text("Your first name can't be empty, this is used to communicate in the Guild!").css("color", "red").addClass("errorMessage"));
            error = true;
        } else {
            $("#name").parent().removeClass("has-error");
        }
        if ($("#country").val() === "") {
            $("#country").parent().addClass("has-error")
                .append($("<p>").text("Country can't be empty!").css("color", "red").addClass("errorMessage"));
            error = true;
        } else {
            $("#country").parent().removeClass("has-error");
        }
        if ($("#username").val().length < 6) {
            $("#username").parent().addClass("has-error")
                .append($("<p>").text("Username has to be at least 6 characters long!").css("color", "red").addClass("errorMessage"));
            error = true;
        } else {
            $("#username").parent().removeClass("has-error");
        }
        if (!validateEmail($("#email").val())) {
            $("#email").parent().addClass("has-error")
                .append($("<p>").text("Entered email is not valid!").css("color", "red").addClass("errorMessage"));
            error = true;
        } else {
            $("#email").parent().removeClass("has-error");
        }
        if (!validatePassword($("#password").val())) {
            $("#password").parent().addClass("has-error")
                .append($("<p>").text("Password has to contain at least 1 digit, 1 lowercase letter, 1 uppercase letter, a special character and has to be at least 8 characters long!").css("color", "red").addClass("errorMessage"));
            error = true;
        } else {
            $("#password").parent().removeClass("has-error");
        }
        if ($("#gw2acc").val() === "") {
            $("#gw2acc").parent().addClass("has-error")
                .append($("<p>").text("Guildwars 2 account name can't be empty").css("color", "red").addClass("errorMessage"));
            error = true;
        } else {
            $("#gw2acc").parent().removeClass("has-error");
        }
        if (yearsApart($("#date input").val().split("-").reverse().join("-")) < 18) {
            $("#date input").parent().parent().addClass("has-error")
                .append($("<p>").text("You have to be at least 18 years old").css("color", "red").addClass("errorMessage"));
            error = true;
        } else {
            $("#date input").parent().parent().removeClass("has-error");
        }

        if (error) {
            return false
        } else {
            return true;
        }
    }

    return {
        init: init
    };
})();

window.onload = function() {
    applicationModule.init();
};

$(document).ready(function(){
    var options={
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        autoclose: true,
    };
    $("#datepicker").datepicker(options);
});