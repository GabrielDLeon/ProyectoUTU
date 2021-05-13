<?php

if(isset($_REQUEST['Nombre del boton'])){   
    $num = $_REQUEST['Nombre de la caja de texto'];
    
    if (matematica::comprobadorExistencia($num) == true){
        matematica::factorial($num);
    } else {
        echo "<script> alert('Falta ingresar valor!');window.location.href='../html/otros.html'; </script>";
    }  
}

?>