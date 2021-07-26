$(document).ready(function(){
    let resultado = $('#resultado');
    hideAll($);

    function hideAll(){
        $('#form-calculosBasicos').hide();
        $('#form-calculosComplejos').hide();
        $('#form-calculosAreas').hide();
        $('#form-baskara').hide();
        $('#form-5oro').hide();
        $('#form-conversion').hide();
        hideComplejos($);
        hideAreas($);
    }
    function hideComplejos(){
        $('#grp-potencia').hide();
        $('#grp-rCuadrada').hide();
        $('#grp-factorial').hide();
        $('#resultado').text("");
    }
    function hideAreas(){
        $('#grp-cuadrado').hide();
        $('#grp-rectangulo').hide();
        $('#grp-triangulo').hide();
        $('#grp-circulo').hide();
        $('#resultado').text("");
    }

    $('#calculosBasicos').click(function(){
        hideAll($);
        $('#form-calculosBasicos').show();
        $('#form-calculosBasicos').submit(function(e){
            let opcion = $('#operacionBasicos option:selected').val();
            let a = parseInt($('#num1').val());
            let b = parseInt($('#num2').val());
            switch (opcion){
                case 'sumar':
                    resultado.text(sumar(a,b));
                    break;
                case 'restar':
                    resultado.text(restar(a,b));
                    break;
                case 'multiplicar':
                    resultado.text(multiplicar(a,b));
                    break;
                case 'dividir':
                    resultado.text(dividir(a,b));
                    break;
            }
            e.preventDefault();
        })  
    })

    $('#calculosComplejos').click(function(){
        hideAll($);
        $('#form-calculosComplejos').show();
        $('#operacionComplejos').change(function(){
            if ($(this).val()==='Potencia'){
                hideComplejos($);
                $('#grp-potencia').show(); 
                $('#btn-potencia').click(function(e){
                    let valBase = $('#grp-potencia #pow-base').val();
                    let valExponente = $('#grp-potencia #pow-exponente').val();
                    resultado.text(potencia(valBase,valExponente));
                    e.preventDefault();
                })
            }
            if ($(this).val()==='rCuadrada'){
                hideComplejos($);
                $('#grp-rCuadrada').show();
                $('#btn-rCuadrada').click(function(e){
                    let valrCuadrada = $('#grp-rCuadrada #rCuadrada').val();
                    resultado.text(rCuadrada(valrCuadrada));
                    e.preventDefault();
                })
            }
            if ($(this).val()==='Factorial'){
                hideComplejos($);
                $('#grp-factorial').show();
                $('#btn-factorial').click(function(e){
                    let valFactorial = $('#grp-factorial #factorial').val();
                    resultado.text(factorial(valFactorial));
                    e.preventDefault();
                })
            }
        })
    })

    $('#calculosAreas').click(function(){
        hideAll($);
        $('#form-calculosAreas').show();
        $('#operacionAreas').change(function(){
            if ($(this).val()==='Cuadrado'){
                hideAreas($);
                $('#grp-cuadrado').show(); 
                $('#btn-aCuadrado').click(function(e){
                    let ladoCuadrado = $('#grp-cuadrado #aCuadrado').val();
                    resultado.text(aCuadrado(ladoCuadrado));
                    e.preventDefault();
                })
            }
            if ($(this).val()==='Rectangulo'){
                hideAreas($);
                $('#grp-rectangulo').show(); 
                $('#btn-aRectangulo').click(function(e){
                    let largoRectangulo = $('#grp-rectangulo #largoRectangulo').val();
                    let anchoRectangulo = $('#grp-rectangulo #anchoRectangulo').val();
                    resultado.text(aRectangulo(largoRectangulo, anchoRectangulo))
                    e.preventDefault();
                })
            }
            if ($(this).val()==='Triangulo'){
                hideAreas($);
                $('#grp-triangulo').show(); 
                $('#btn-aTriangulo').click(function(e){
                    let baseTriangulo = $('#grp-triangulo #baseTriangulo').val();
                    let alturaTriangulo = $('#grp-triangulo #alturaTriangulo').val();
                    resultado.text(aTriangulo(baseTriangulo, alturaTriangulo));
                    e.preventDefault();
                })
            }
            if ($(this).val()==='Circulo'){
                hideAreas($);
                $('#grp-circulo').show(); 
                $('#btn-aCirculo').click(function(e){
                    let radioCirculo = $('#grp-circulo #radioCirculo').val();
                    resultado.text(aCircunferencia(radioCirculo));
                    e.preventDefault();
                })
            }
        })
    })

    $('#baskara').click(function(){
        hideAll($);
        $('#form-baskara').show();
        $('#btn-baskara').click(function(e){
            let valA = $('#baskara-a').val();
            let valB = $('#baskara-b').val();
            let valC = $('#baskara-c').val();
            resultado.text(baskara(valA, valB, valC));
            e.preventDefault();
        })
    })

    $('#conversion').click(function(){
        hideAll($);
        $('#form-conversion').show();  
    })

    $('#5oro').click(function(){
        hideAll($);
        $('#form-5oro').show();
        let oroJugados = 0, probabilidad = 0;

        $('#btn-5oro-jugar-1').click(function(e){
            oroJugados = jugarOro(1, oroJugados, probabilidad);
            e.preventDefault();
        })
        $('#btn-5oro-jugar-10').click(function(e){
            oroJugados = jugarOro(10, oroJugados, probabilidad);
            e.preventDefault();
        })
        $('#btn-5oro-jugar-100').click(function(e){
            oroJugados = jugarOro(100, oroJugados, probabilidad);
            e.preventDefault();
        })
        $('#btn-5oro-jugar-ganar').click(function(e){
            oroJugados = jugarOro(171230400, oroJugados, probabilidad);
            e.preventDefault();
        })
        $('#btn-5oro-reset').click(function(e){
            probabilidad = 0, oroJugados = 0;
            resultado.text("Veces jugado: "+0+" / Probabilidad de ganar: "+0+"%");
            e.preventDefault();
        })
    })

    jugarOro = (cantidad,jugadas,probabilidad) => {
        console.log()
        jugadas+= cantidad;
        probabilidad = 1/1712304*jugadas;
        resultado.text("Veces jugado: "+jugadas+" / Probabilidad de ganar: "+probabilidad+"%");
        return jugadas;
    }
})

//5 de oro

//Operaciones simples
sumar = (num1, num2) => (num1+num2);
restar = (num1, num2) => (num1-num2);
multiplicar = (num1, num2) => (num1*num2);
dividir = (num1, num2) => {
    if (num1 == 0 && num2 == 0){ return "No se puede dividir 0 entre 0!"}
    else if (num2 == 0){ return "Infinito"; }
    else { return (num1/num2); }        
} 

//Operaciones complejas
potencia = (base, exponente) => (Math.pow(base,exponente));
rCuadrada = (num) => (Math.sqrt(num));
factorial = (num) => {
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
baskara = (a,b,c) => {
    var raiz1, raiz2;
    var delta = (b*b)-4*a*c;
    if (delta < 0){
        return "No tiene raíz real";
    }
    var raiz1 = ((b*-1) + Math.sqrt(delta)/(2*a));
    var raiz2 = ((b*-1) - Math.sqrt(delta)/(2*a));
    return ("Raíz 1: "+raiz1+" Raíz 2: "+raiz2);
}

//Calculo de áreas
aCuadrado = (lado) => (lado*lado);
aRectangulo = (largo, ancho) => (largo*ancho);
aTriangulo = (base, altura) => ((base*altura)/2);
aCircunferencia = (radio) => (Math.PI*(radio*radio));

//Operaciones de cédula
ciCalculo = (cedula) => (parseInt(cedula[0]*2+cedula[1]*9+cedula[2]*8+cedula[3]*7+cedula[4]*6+cedula[5]*3+cedula[6]*4));
ciGenVerificador = (cedula) => {
    var resultado = ciCalculo(cedula);
    var i = resultado;
    while ((i % 10)!= 0){i++;}
    return (resultado -= i);
}
ciComprobador = (cedula) => {
    var i = ciCalculo(cedula) + parseInt(cedula[7]);
    console.log(i);
    if ((i%10)==0){
        return "Cédula correcta!";
    } else if ((i%10)!=0){
        return "Cédula incorrecta!";
    }
}