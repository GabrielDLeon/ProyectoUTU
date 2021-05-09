<?php
include("operaciones.php"); //Conecta este el menú con las funciones

$num1 = $_REQUEST['numero1'];
$num2 = $_REQUEST['numero2'];
$op = $_REQUEST['selector'];

//Si se presiona el botón "Calcular" en las operaciones básicas.
if(isset($_REQUEST['calcularBasicas'])){    

switch($op){
        case 0:
            echo "<script> alert('Se ha realizado la suma de $num1 y $num2. Resultado: ".matematica::sumar($num1,$num2)."');window.location.href='../index.html'; </script>";
            break;
            
        case 1:
            echo "<script> alert('Se ha realizado la resta de $num1 y $num2. Resultado: ".matematica::restar($num1,$num2)."');window.location.href='../index.html'; </script>";
            break;
       
        case 2:
            echo "<script> alert('Se ha realizado la multiplicación de $num1 y $num2. Resultado: ".matematica::multiplicar($num1,$num2)."');window.location.href='../index.html'; </script>";
            break;

        case 3:
            echo "<script> alert('Se ha realizado la división de $num1 y $num2. Resultado: ".matematica::dividir($num1,$num2)."');window.location.href='../index.html'; </script>";
            break;
    
}

if (isset($_REQUEST['calcularPotencia'])){
    $base = $_REQUEST['base'];
    $exp = $_REQUEST['exponente'];
    echo "<script> alert('Se ha realizado la potencia de base $base y exponente $exp. Resultado: ".matematica::potencia($base,$exp)."'); window.location.href='../index.html'; </script>";
}

if (isset($_REQUEST['calcularRaizcuadrada'])){
    $num1 = $_REQUEST['numero1'];
    echo "<script> alert('Se ha realizado la raíz cuadrada de $num1 = ".matematica::raizCuadrada($num1)."'); window.location.href='../index.html'; </script>";
}

if (isset($_REQUEST['calcularBaskara'])){
    $num1 = $_REQUEST['baskaraA'];
    $num2 = $_REQUEST['baskaraB'];
    $num3 = $_REQUEST['baskaraC'];
    echo "<script> alert('Se ha realizado baskara de la siguiente ecuación. a=$num1 b=$num2 c=$num3. Resultado: ".matematica::baskara($num1,$num2,$num3)."'); window.location.href='../index.html'; </script>";
}

if(isset($_REQUEST['calcularGeometricas'])){

    //Si se presiona el botón "Calcular" en las operaciones geometricas.
    
        switch($op){
        case 0:
            echo "<script> alert('El area del cuadrado es: " .matematica::aCuadrado($num1,$num2)." cm²'); window.location.href='../index.html'; </script>";
            break;
	case 1:
            echo "<script> alert('El area del rectangulo es: " .matematica::aRectangulo($num1,$num2)." cm²'); window.location.href='../index.html'; </script>";
            break;
        case 2: 
	    echo "<script> alert('El area de la circunferencia es: " .matematica::aCircunferencia($num1,$num2)." cm²'); window.location.href='../index.html'; </script>";
            break;
	case 3: 
	    echo "<script> alert('El area del triangulo es: " .matematica::aTriangulo($num1,$num2)." cm²'); window.location.href='../index.html'; </script>";
            break;
    }
}
?>