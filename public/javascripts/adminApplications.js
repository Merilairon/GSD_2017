$(function fillTable() {
    $.post("/getApplications")
        .done(function(data) {
            if (data.success) {
                $.each(data.applications, function() {
                    var status = "";
                    var tr = this;
                    if (this.acceptance === 0) {
                        status = "Under Review";
                    } else if (this.acceptance === 1) {
                        status = "Accepted";
                    } else {
                        status = "Declined";
                    }
                    var $trElement = $("<tr>").addClass("application")
                        .append($("<td>").text(this.firstName))
                        .append($("<td>").text(this.gw2name))
                        .append($("<td>").text(this.gender))
                        .append($("<td>").text(this.email))
                        .append($("<td>").text(this.sentDate.substring(0, 10).split('-').reverse().join('-') + " " + this.sentDate.substring(11, 19)))
                        .append($("<td>").text(status));
                    $("#applications tbody").append($trElement);

                    $($trElement).click(function(e) {
                        $.each($("tbody tr"), function(val) {
                            this.style.backgroundColor = "#f9f9f9";
                        });
                        this.style.backgroundColor = "#AFC4DA";
                        $("#applicationInfo").show();
                        $("#username").val(tr.username);
                        $("#country").val(tr.country);
                        $("#yourself").text(tr.info);
                        $("#ts").val(tr.ts);
                        $("#forum").val(tr.forums);
                        $("#whatsapp").val(tr.whatsapp);
                        $("#questions").text(tr.questions);
                        $("#birthday").val(tr.birthday.substring(0, 10).split('-').reverse().join('-'));
                        $("#version").val(tr.gw2version.toUpperCase());
                        $("#why").text(tr.why);
                        $("#playstyle").text(tr.playstyle);
                        $("#days").val(tr.days);
                        $("#times").val(tr.times);
                        if (tr.acceptance === 1 || tr.acceptance === -1) {
                            $("#buttons").hide();
                            $("#decision").parent().hide();
                        } else {
                            $("#buttons").show();
                            $("#decision").parent().show();
                        }

                        $("#acceptApplication").unbind("click").click(function(e) {
                            $.post('/approveApplication', { feedback: $("#decision").val(), sentDate: tr.sentDate })
                                .done(function() {
                                    setTimeout(window.location.replace("/admin/applications"), 500);
                                });
                        })
                        $("#declineApplication").unbind("click").click(function(e) {
                            $.post('/declineApplication', { feedback: $("#decision").val(), sentDate: tr.sentDate })
                                .done(function() {
                                    setTimeout(window.location.replace("/admin/applications"), 500);
                                });
                        })
                    });
                });
            }
            $("#applications").stupidtable({
                "date": function(a, b) {
                    return new Date(a.substr(6, 4), a.substr(3, 2) - 1, a.substr(0, 2)).getTime() - new Date(b.substr(6, 4), b.substr(3, 2) - 1, b.substr(0, 2)).getTime();
                },
                "datetime": function(a, b) {
                    return new Date(a.substr(6, 4), a.substr(3, 2) - 1, a.substr(0, 2), a.substr(11, 2), a.substr(14, 2)).getTime() - new Date(b.substr(6, 4), b.substr(3, 2) - 1, b.substr(0, 2), b.substr(11, 2), b.substr(14, 2)).getTime();
                }
            });
            $("#applications thead th:nth-child(6)").stupidsort('desc');
        });
});