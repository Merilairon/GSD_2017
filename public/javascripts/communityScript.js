$(function() {
    $("#users").stupidtable({
        "date": function(a, b) {
            return new Date(a.substr(6, 4), a.substr(3, 2) - 1, a.substr(0, 2)).getTime() - new Date(b.substr(6, 4), b.substr(3, 2) - 1, b.substr(0, 2)).getTime();
        },
        "datetime": function(a, b) {
            return new Date(a.substr(6, 4), a.substr(3, 2) - 1, a.substr(0, 2), a.substr(11,2), a.substr(14,2)).getTime() - new Date(b.substr(6, 4), b.substr(3, 2) - 1, b.substr(0, 2), b.substr(11,2), b.substr(14,2)).getTime();
        }
    });
})