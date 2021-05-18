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

?>