<?php
include("operaciones.php");

if(isset($_REQUEST['btmPart1'])){
    $num1 = $_REQUEST['val1Part1'];
    $base1 = $_REQUEST['base1Part1'];
    $num2 = $_REQUEST['val2Part1'];
    $base2 = $_REQUEST['base2Part1'];
    $op = $_REQUEST['operacion'];

    switch($op){
        case 1:
            operacion::sumar($num1,$num2,$base1,$base2);
            break;
        case 2:
            operacion::restar($num1,$num2,$base1,$base2);
            break;
        case 3:
            operacion::multiplicar($num1,$num2,$base1,$base2);
            break;
        case 4:
            operacion::dividir($num1,$num2,$base1,$base2);
            break;
    }
}
    
if(isset($_REQUEST['btmPart2'])){     

    //Líneas de código

}

?>