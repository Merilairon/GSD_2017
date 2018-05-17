var storage = localStorage;

$(function userLoader() {
    $.post('/getUsersAdmin')
        .done(function(data) {
            if (data.users !== undefined) {
                $.each(data.users, function(index) {

                    var $selectElement = $("<select>").addClass("form-control")
                        .append($("<option>").val("0").text("0"))
                        .append($("<option>").val("1").text("1"))
                        .append($("<option>").val("2").text("2"));
                    $("#users tbody")
                        .append($("<tr>").attr("id", "user" + index)
                            .append($("<td>").text(this.username))
                            .append($("<td>").text(this.displayname))
                            .append($("<td>").text(this.characterName))
                            .append($("<td>").text(this.gender))
                            .append($("<td>").text(this.country))
                            .append($("<td>").text(this.email))
                            .append($("<td>").text(this.birthday.substring(0, 10).split('-').reverse().join('-'))));
                    if (this.steam !== null) {
                        $("#user" + index).append($("<td>").append($("<a>").attr("href", this.steam).text("Go to Steam")));
                    } else {
                        $("#user" + index).append($("<td>").text(""));
                    }
                    $("#user" + index)
                        .append($selectElement)
                        .append($("<td>").text(this.joinDate.substring(0, 10).split('-').reverse().join('-')));
                    $("#user" + index + " select.form-control option[value='" + this.rank + "']").attr('selected', 'selected');
                    $("#user" + index + " select.form-control").change(function(e) {
                        $.post('/changeRank', { username: $(this).parent().children().first().text(), rank: $(this).val() })
                            .done(function(data) {
                                if (data.success) {
                                    setTimeout(window.location.replace("/admin/users"), 500);
                                }
                            });
                    });
                });
            }
        });
});