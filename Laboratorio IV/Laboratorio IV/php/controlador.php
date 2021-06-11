<?php
include("operaciones.php");

if (isset($_REQUEST['btmPart1'])){
$cedula=$_REQUEST['valor1'];
    operacion :: comprobador($cedula);
}

if (isset($_REQUEST['btmPart2'])){
$cedula=$_REQUEST['valor2'];
    operacion :: generador ($cedula);
}

?>