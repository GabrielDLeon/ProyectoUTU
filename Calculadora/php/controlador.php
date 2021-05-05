<?php
include("funciones.php"); //Conecta este el menú con las funciones

//Si se presiona el botón "Calcular" en las operaciones básicas.
if(isset($_REQUEST['calcularBasicas'])){

    $num1 = $_REQUEST['numero1'];
    $num2 = $_REQUEST['numero2'];
    $op = $_REQUEST['selector'];
    echo "<script> alert('Suma realizada correctamente $num1 / $num2'); window.location.href='../index.html'; </script>";
    
}

if(isset($_REQUEST['calcularComplejas'])){

    //Si se presiona el botón "Calcular" en las operaciones complejas.
    echo "<script> alert('Falta hacer la función'); window.location.href='../index.html'; </script>";

}

if(isset($_REQUEST['calcularGeometricas'])){

    //Si se presiona el botón "Calcular" en las operaciones geometricas.
    echo "<script> alert('Falta hacer la función'); window.location.href='../index.html'; </script>";

}
?>