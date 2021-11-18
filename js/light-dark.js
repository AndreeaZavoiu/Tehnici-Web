window.addEventListener("DOMContentLoaded", function() {
    
    let temaSel = localStorage.getItem("tema");
    if (temaSel == "dark")
        document.body.classList.add("dark");

    var btn = document.getElementById("schimbare-tema");
    if (btn) {
        btn.onclick = function () {
            document.body.classList.toggle("dark");
             
            if (document.body.classList.contains("dark") )
                localStorage.setItem("tema", "dark");
            else localStorage.setItem("tema", "light");
        }
    }
});