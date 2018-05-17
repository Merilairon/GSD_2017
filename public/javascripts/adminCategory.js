var categories;

$(function buttonBehaviour() {
    $("#addCategory").click(function(e) {
        $("#name").val("");
        $("#categoryInfo").show();
        $("#description").val("");
        $.each($("tbody tr"), function(val) {
            this.style.backgroundColor = "#f9f9f9";
        });
        $("#saveCategory").unbind('click').click(function(e) {
            var name = $("#name").val();
            var errors = false;
            $.each(categories, function() {
                if (this.name === name) {
                    $("#name").parent().addClass("has-error")
                        .append($("<p>").text("Name already in use!").css("color", "red").addClass("errorMessage"));
                    errors = true;
                }
            });
            if (!errors) {
                $.post("/addCategory", { sessionID: localStorage.getItem("sessionID"), name: $("#name").val(), description: $('#description').val() })
                    .done(function(data) {
                        setTimeout(window.location.replace("/admin/forum/category"), 500);
                    });
            }
        });
        $("#deleteCategory").unbind('click').click(function(e) {
            window.location.replace("/admin/forum/category")
        });
    });
});

$(function fillTable() {
    $("#categoryTable").stupidtable();
    $("#categoryTable thead th:first-child").stupidsort('desc');

    $.get('/getCategories')
        .done(function(data) {
            categories = data.categories;
            $.each(categories, function() {
                var tr = this;
                var $trElement = $("<tr>")
                    .append($("<td>").text(this.name))
                    .append($("<td>").text(this.description))
                $("#categoryTable tbody").append($trElement);

                $($trElement).click(function(e) {
                    $("#categoryInfo").show();
                    $.each($("tbody tr"), function(val) {
                        this.style.backgroundColor = "#f9f9f9";
                    });
                    this.style.backgroundColor = "#AFC4DA";

                    $("#name").val(tr.name);
                    $("#description").val(tr.description);

                    $("#saveCategory").unbind('click').click(function(e) {
                        var name = $("#name").val();
                        var errors = false;
                        if (name !== tr.name) {
                            $.each(data.categories, function() {
                                if (this.name === name) {
                                    $("#name").parent().addClass("has-error")
                                        .append($("<p>").text("Name already in use!").css("color", "red").addClass("errorMessage"));
                                    errors = true;
                                }
                            });
                            console.log("1");
                        }
                        if (!errors) {
                            console.log("2");
                            $.post('/changeCategory', { sessionID: localStorage.getItem("sessionID"), oldname: tr.name, name: $("#name").val(), description: $("#description").val() })
                                .done(function() {
                                    setTimeout(window.location.replace("/admin/forum/category"), 500);
                                });
                        }
                    });

                    $("#deleteCategory").unbind('click').click(function(e) {
                        $.post('/deleteCategory', { sessionID: localStorage.getItem("sessionID"), name: tr.name })
                            .done(function() {
                                setTimeout(window.location.replace("/admin/forum/category"), 500);
                            });
                    });
                });
            });
        });
});