window.onload = redirect;

function redirect() {
    console.log("test");
    setTimeout(function () {
         window.location.replace = "/";
    }, 1500);
}