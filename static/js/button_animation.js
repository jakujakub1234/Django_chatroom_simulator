document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        document.getElementById("btn-submit").style.backgroundColor = "rgb(193, 200, 207)";
        document.getElementById("btn-submit").style.boxShadow = "1px 3px #666";
        document.getElementById("btn-submit").style.transform = "translateY(4px)";
    }
});

document.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        document.getElementById("btn-submit").style.backgroundColor = "";
        document.getElementById("btn-submit").style.boxShadow = "3px 6px #999";
        document.getElementById("btn-submit").style.transform = "";
    }
});