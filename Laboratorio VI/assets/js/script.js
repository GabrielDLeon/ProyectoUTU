$(document).ready(function(){
        $('#btn1').click(function(){
            console.log("Hola");
            var num1 = parseInt($('#val1').val());
            var num2 = parseInt($('#val2').val());
            var res = restar(num1, num2);
            $('#resultado').text(res);
        })
})

function sumar(num1, num2){
    return (num1+num2);
}
function restar(num1, num2){
    return (num1-num2);
}
function multiplicar(num1, num2){
    return (num1*num2);
}
function dividir(num1, num2){
    return (num1/num2);
}