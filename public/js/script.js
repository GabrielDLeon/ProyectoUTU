document.querySelector(".input-number").addEventListener("keypress", function (evt) {
    if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)
    {
        evt.preventDefault();
    }
});

$(form).submit(function () {
    sendContactForm();
    return false;
});

const a = document.getElementById('confirm-descuento');
const b = document.getElementById('descuento');
b.style.display = "none";

a.addEventListener("click", function(){
    if (a.checked == true){
        b.style.display = "block";
    } else {
        b.style.display = "none";
    }
})