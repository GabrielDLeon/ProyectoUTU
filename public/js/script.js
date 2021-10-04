document.querySelector(".input-number").addEventListener("keypress", function (evt) {
    if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)
    {
        evt.preventDefault();
    }
});
document.getElementById('descuento').disabled = true;
$(form).submit(function () {
    sendContactForm();
    return false;
});

document.getElementById()