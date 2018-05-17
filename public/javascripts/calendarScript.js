var calendarModule = (function() {

    var init = function() {
        $('#calendar').fullCalendar({
            googleCalendarApiKey: 'AIzaSyDmSHdV3RkjSoarhhiX2rI-yE50uWL9O-w',
            events: {
                googleCalendarId: 'g20rvh21sjmduj577tj52kr3qg@group.calendar.google.com'
            }
        });
        var countDownDate = new Date("Jul 13, 2018 00:00:00").getTime();
        var x = setInterval(function() {
            var now = new Date().getTime();
            var distance = countDownDate - now;

            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            $('#countdown').text(days + "d " + hours + "h "
                + minutes + "m " + seconds + "s ");

            if (distance < 0) {
                clearInterval(x);
                $('#countdown').text("0d 0h 0m 0s");
            }
        }, 1000);
    };


    return {
        init: init
    };
})();

window.onload = function() {
    calendarModule.init();
    loggedInModule.init("Calendar");
};