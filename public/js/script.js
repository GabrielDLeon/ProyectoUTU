document.querySelector(".input-number").addEventListener("keypress", function (evt) {
    if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)
    {
        evt.preventDefault();
    }
});

const a = document.getElementById('confirm-descuento');
const b = document.getElementById('descuento');
b.disabled = true;

a.addEventListener("click", function(){
    if (a.checked == true){
        b.disabled = false;
    } else {
        b.disabled = true;
    }
})