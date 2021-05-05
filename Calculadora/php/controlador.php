<?php
include("funciones.php"); //Conecta este el menú con las funciones
if(isset($_REQUEST['calcularBasicas'])){

    //Creación de variables
    $num1 = $_REQUEST['numero1'];
    $num2 = $_REQUEST['numero2'];
    $op = $_REQUEST['selector'];
    echo "<script> alert('Suma realizada correctamente $num1 / $num2'); window.location.href='../index.html'; </script>";
}
?>