<?php
include("operaciones.php");

if(isset($_REQUEST['salir'])){
    header("Status: 301 Moved Permanently");
    header("Location: ../index.html");
    exit;
}

if(isset($_REQUEST['calcularTablas'])){
    $num = $_REQUEST['numTabla'];
    $op = $_REQUEST['Multiplicar'];

    if (matematica::comprobadorExistencia($num) == true){
        matematica::multiplicaciones($num, $op);
    } else {
        echo "<script> alert('Falta ingresar valor!');window.location.href='../html/sistemas.html'; </script>";
    }
}
    

if(isset($_REQUEST['calcularFactorial'])){   
    $num = $_REQUEST['numero'];
    if (matematica::comprobadorExistencia($num) == true){
        matematica::factorial($num);
    } else {
        echo "<script> alert('Falta ingresar valor!');window.location.href='../html/factoriales.html'; </script>";
    }  
}
if(isset($_REQUEST['calcularPosibilidad'])){
    $num1 = $_REQUEST['bolilla1'];
    $num2 = $_REQUEST['bolilla2'];
    $num3 = $_REQUEST['bolilla3'];
    $num4 = $_REQUEST['bolilla4'];
    $num5 = $_REQUEST['bolilla5'];
    
    if (matematica::comprobadorExistencia($num1) == true &&  matematica::comprobadorExistencia($num2) == true && matematica::comprobadorExistencia($num3) == true &&  matematica::comprobadorExistencia($num4) == true && matematica::comprobadorExistencia($num5) == true){
        matematica::aEntero($num1,$num2,$num3,$num4,$num5);
    } else {
        echo "<script> alert('Falta ingresar valor!');window.location.href='../html/factoriales.html'; </script>";
    }  
 
}

?>