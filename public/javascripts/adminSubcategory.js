var subcategories;

$(function buttonBehaviour() {
    $("#addSubCategory").click(function(e) {
        $("#name").val("");
        $("#description").val("");
        $("#category option:first-child").attr("selected", "selected");
        $("#subCategoryInfo").show();
        $.each($("tbody tr"), function(val) {
            this.style.backgroundColor = "#f9f9f9";
        });
        $("#saveSubCategory").unbind('click').click(function(e) {
            var name = $("#name").val();
            var errors = false;
            if (subcategories.length > 0) {
                $.each(subcategories, function() {
                    if (this.name === name) {
                        $("#name").parent().addClass("has-error")
                            .append($("<p>").text("Name already in use!").css("color", "red").addClass("errorMessage"));
                        errors = true;
                    }
                });
            }
            if (!errors) {
                $.post("/addSubCategory", { sessionID: localStorage.getItem("sessionID"), name: $("#name").val(), description: $('#description').val(), category: $("#category").val() })
                    .done(function(data) {
                        setTimeout(window.location.replace("/admin/forum/subcategory"), 500);
                    });
            }
        });
        $("#deleteSubCategory").unbind('click').click(function(e) {
            window.location.replace("/admin/forum/category")
        });
    });
});

$(function fillTable() {
    $("#subCategoryTable").stupidtable();
    $("#subCategoryTable thead th:first-child").stupidsort('desc');
    $.get('/getCategories')
        .done(function(data) {
            $.each(data.categories, function(e) {
                $('#category').append($("<option>").val(this.name).text(this.name));
            });
            $.get('/getSubCategories')
                .done(function(subdata) {
                    subcategories = subdata.subcategories;
                    if (subcategories.length > 0) {
                        $.each(subcategories, function() {
                            var tr = this;
                            var $trElement = $("<tr>")
                                .append($("<td>").text(this.name))
                                .append($("<td>").text(this.description))
                                .append($("<td>").text(this.superCategory));
                            $("#subCategoryTable tbody").append($trElement);

                            $($trElement).click(function(e) {
                                $("#subCategoryInfo").show();
                                $.each($("tbody tr"), function(val) {
                                    this.style.backgroundColor = "#f9f9f9";
                                });
                                this.style.backgroundColor = "#AFC4DA";

                                $("#name").val(tr.name);
                                $("#description").val(tr.description);
                                $("#category option:contains(" + tr.superCategory + ")").attr("selected", "selected");

                                $("#saveSubCategory").unbind('click').click(function(e) {
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
                                        $.post('/changeSubCategory', { sessionID: localStorage.getItem("sessionID"), oldname: tr.name, name: $("#name").val(), description: $("#description").val(), category: $("#category").val() })
                                            .done(function() {
                                                setTimeout(window.location.replace("/admin/forum/subcategory"), 500);
                                            });
                                    }
                                });

                                $("#deleteSubCategory").unbind('click').click(function(e) {
                                    $.post('/deleteSubCategory', { sessionID: localStorage.getItem("sessionID"), name: tr.name })
                                        .done(function() {
                                            setTimeout(window.location.replace("/admin/forum/subcategory"), 500);
                                        });
                                });
                            });
                        });
                    }
                });
        });
});