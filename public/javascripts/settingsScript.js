var settingsModule = (function() {

    var init = function() {

        getCharacters();
        $('#addCharacterButton').click(function(e) {
            addCharacter($("#addCharacter").val());
        });

        $('#changePass').click(function(e) {
            changePassword()
        });

        $('#changeEmail').click(function(e) {
            changeEmail()
        });

        getSteam();
        $('#changeSteam').click(function(e) {
            changeSteam()
        });

        $("#avatarImageUpload").fileinput({
            uploadAsync: true,
            uploadUrl: "/uploadAvatar",
            showClose: false,
            showCaption: false,
            browseLabel: 'Browse',
            removeLabel: 'Remove',
            browseIcon: '<i class="glyphicon glyphicon-folder-open"></i>',
            removeIcon: '<i class="glyphicon glyphicon-remove"></i>',
            removeTitle: 'Cancel or reset changes',
            elErrorContainer: '#errorBlock',
            msgErrorClass: 'alert alert-block alert-danger',
            layoutTemplates: { main2: '{browse}' },
            allowedFileExtensions: ["jpg", "jpeg", "gif", "png"]
        });
        $('#avatarImageUpload').on('change', function(event) {
            $('#avatarImageUpload').fileinput('upload');
        });

        $('#avatarImageUpload').on('fileuploaded', function(event, data, previewId, index) {
            $("#avatarImg").attr("src", data.response.imageName);
        });
    };

    var changePic = function(input) {

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
                $('#avatarImg').attr('src', e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

    var addCharacter = function(name) {
        $.post("/addCharacter", { characterName: name })
            .done(function(data) {
                if (data.success === true) {
                    getCharacters();
                } else {
                    $("#addCharacter").parent().addClass("has-error")
                        .append($("<p>").text("Character already in use!").css("color", "red").addClass("errorMessage"));

                }

            });
    };

    var changePassword = function() {
        $("#message").remove();
        $("#oldPassword").parent().removeClass("has-error");
        $("#newPassword").parent().removeClass("has-error");
        $("#confirmPassword").parent().removeClass("has-error");
        $.post("/changePassword", { oldPassword: $("#oldPassword").val(), newPassword: $("#newPassword").val(), confirm: $("#confirmPassword").val() })
            .done(function(data) {
                console.log(data);
                if (data.success === true) {
                    $("#changePass").parent().prepend($("<p>").attr("id", "message").text("Password successfully changed!").css({ color: "#233140", 'margin-bottom': "10px" }));
                } else {
                    if (data.opCheck === false) {
                        $("#oldPassword").parent().append($("<p>").attr("id", "message").text("Password incorrect!").css({ color: "red", 'margin-top': "10px" })).addClass("has-error");
                    } else {
                        if (data.npCheck === false) {
                            $("#newPassword").parent().append($("<p>").attr("id", "message").text("Password has to contain at least 1 digit, 1 lowercase letter, 1 uppercase letter, a special character and has to be at least 8 characters long!").css({ color: "red", 'margin-top': "10px" })).addClass("has-error");
                        } else {
                            $("#confirmPassword").parent().append($("<p>").attr("id", "message").text("Confirm password does not match new password!").css({ color: "red", 'margin-top': "10px" })).addClass("has-error");
                        }
                    }
                }
                $("#oldPassword").val('');
                $("#newPassword").val('');
                $("#confirmPassword").val('');
            });
    };

    var changeEmail = function() {
        $("#message").remove();
        $("#newEmail").parent().removeClass("has-error");
        $("#confirmEmail").parent().removeClass("has-error");
        $.post("/changeEmail", { newEmail: $("#newEmail").val(), confirmEmail: $("#confirmEmail").val() })
            .done(function(data) {
                if (data.success === true) {
                    $("#changeEmail").parent().prepend($("<p>").attr("id", "message").text("Email successfully changed!").css({ color: "#233140", 'margin-bottom': "10px" }));
                } else {
                    if (data.neCheck === false) {
                        $("#newEmail").parent().append($("<p>").attr("id", "message").text("Invalid email!").css({ color: "red", 'margin-top': "10px" })).addClass("has-error");
                    } else {
                        $("#confirmEmail").parent().append($("<p>").attr("id", "message").text("Confirm email does not match new email!").css({ color: "red", 'margin-top': "10px" })).addClass("has-error");
                    }
                }

                $("#newEmail").val('');
                $("#confirmEmail").val('');
            });
    };

    var getSteam = function() {
        $.post('/getSteam')
            .done(function(data) {
                $("#steam").val(data.steam);
            });
    }

    var changeSteam = function() {
        $.post('/changeSteam', { steam: $("#steam").val() })
            .done(function() {
                setTimeout(window.location.replace("/settings"), 500);
            });
    }

    var getCharacters = function() {
        $.post("/getCharacters")
            .done(function(data) {
                if (data.success === true) {
                    $("#charTablebody").empty();
                    $.each(data.characterName, function(index) {
                        var $trElement = $("<tr>").attr("id", "Character" + (index + 1))
                            .append($("<td>").text(index + 1))
                            .append($("<td>").text(this.characterName));
                        if (this.characterName === data.mainCharacter) {
                            $trElement.append($("<td>").append($("<input>").attr("type", "radio").attr("name", "main?").attr("checked", "checked").val(this.characterName)));
                        } else {
                            $trElement.append($("<td>").append($("<input>").attr("type", "radio").attr("name", "main?").val(this.characterName)));
                        }
                        $trElement.append($("<td>").append($("<button>").addClass("btn").addClass("btn-danger").addClass("btn-xs").attr("type", "button").text("X").val(this.characterName)))
                        $("#charTablebody").append($trElement);
                        $("#Character" + (index + 1) + " button").click(function(e) {
                            $.post("/deleteCharacter", { character: $(this).val() })
                                .done(function() {
                                    setTimeout(window.location.replace("/settings"), 500);
                                });
                        })
                    });
                }
                $(':radio[name="main?"]').on('change', function() {
                    $.post("/changeMainCharacter", { mainCharacter: $(this).val() })
                        .done(function() {
                            setTimeout(window.location.replace("/settings"), 500);
                        });
                });
            });
    };


    return {
        init: init
    };
})();

window.onload = function() {
    settingsModule.init();
};