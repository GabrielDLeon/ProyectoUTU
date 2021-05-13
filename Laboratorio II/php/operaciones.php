<?php
class matematica {

    //Operaciones básicas:

    public static function factorial($n){
        
        if ($n != 0){
            $factorial = 1;
            $cadena = "$n! = ";
            for($i = $n; $i > 0; $i--){
                if ($i == 1){
                    $cadena .= "$i";
                } else if ($i > 1){
                    $cadena .= "$i x ";
                }
                $factorial *= $i; 
            }
            echo "<script> alert('$cadena = $factorial'); window.location.href='../html/complejas.html'; </script>";
        } else if ($n == 0){
            echo "<script> alert('El factorial de 0 es 1'); window.location.href='../html/complejas.html'; </script>";
        }
    }

    //Comprobador de existencia
    //Comprueba si se ingreso un valor en el campo

    public static function comprobadorExistencia($valor){
        if ($valor == ""){
            return false;
        } else if ($valor != ""){
            return true;
        }
    }
}
?>