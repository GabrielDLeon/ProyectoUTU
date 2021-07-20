$(document).ready(function(){
        $('#btn1').click(function(){
            console.log("Hola");
            var num1 = $('#val1').val();
            var num2 = parseInt($('#val2').val());
            var num3 = parseInt($('#val3').val());
            var res = ciComprobador(num1);
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

function potencia(base, exponente){
    return Math.pow(base, exponente);
}

function rCuadrada(num){
    return Math.sqrt(num);
}

function baskara(a,b,c){
    var raiz1, raiz2;
    var delta = (b*b)-4*a*c;
    if (delta < 0){
        return "No tiene raíz real";
    }
    var raiz1 = ((b*-1) + Math.sqrt(delta)/(2*a));
    var raiz2 = ((b*-1) - Math.sqrt(delta)/(2*a));
    return [raiz1, raiz2];
}

function aCuadrado(lado){
    return (lado*lado);
}

function aRectangulo(largo, ancho){
    return (largo*ancho);
}

function aCircunferencia (radio){
    return Math.PI*(radio*radio);
}

function aTriangulo (base, altura){
    return (base*altura)/2;
}

function factorial (num){
    var factorial;
    var cadena = num+"! = ";
    if (num != 0 && num > 0){
        factorial = 1;
        for(var i = num; i > 0; i--){
            if(i == 1){
                cadena += i;
            } else if (i > 1){
                cadena += i + " x ";
            }
            factorial *= i;
        }
        return (cadena+" = "+factorial);
    } else if (num == 0){
        return 1;
    } else if (num < 0){
        return "Factorial disponible para números positivos!"
    }
}

function ciCalculo (cedula){ //Otorga el calculo matemático de la cedula
    var resultado = cedula[0]*2+cedula[1]*9+cedula[2]*8+cedula[3]*7+cedula[4]*6+cedula[5]*3+cedula[6]*4;
    return parseInt(resultado);
}

function ciGenVerificador (cedula){ //Otorga numero verificador (utlimo digito de la cedula)
    var resultado = ciCalculo(cedula);
    var i = resultado;
    while ((i % 10)!= 0){i++;}
    return (resultado -= i);
}

function ciComprobador (cedula){ //Indica si la cedula es verdadera o no
    var i = ciCalculo(cedula) + parseInt(cedula[7]);
    console.log(i);
    if ((i%10)==0){
        return "Cédula correcta!";
    } else if ((i%10)!=0){
        return "Cédula incorrecta!";
    }
}