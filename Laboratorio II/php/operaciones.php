<?php
class matematica {

   public static function multiplicaciones($numero, $limite){
        if ($numero > 0){
            $cadena = "Tabla del $numero hasta el ".($limite+1);
            for ($i=1; $i <= $limite+1; $i++) {
                $resultado = $numero * $i; 
                $cadena .=  "\\n"."$i x $numero = $resultado";
            }
            echo "<script> alert('$cadena'); window.location.href='../html/sistemas.html'; </script>";
       } else if ($numero <= 0){
            echo "<script> alert('El programa aún no está capacitado para hacer la tabla del $numero'); window.location.href='../html/sistemas.html'; </script>";
       }
        
    }
   
   public static function factorial($n){
        
        if ($n != 0 && $n > 0){
            $factorial = 1;
            $cadena = "Se ha realizado existosamente el factorial de $n\\n"."$n! = ";
            for($i = $n; $i > 0; $i--){
                if ($i == 1){
                    $cadena .= "$i";
                } else if ($i > 1){
                    $cadena .= "$i x ";
                }
                $factorial *= $i; 
            }
            echo "<script> alert('$cadena = $factorial'); window.location.href='../html/factoriales.html'; </script>";
        } else if ($n == 0){
            echo "<script> alert('El factorial de 0 es 1'); window.location.href='../html/factoriales.html'; </script>";
        } else if ($n < 0){
            echo "<script> alert('La función factorial solo está disponible entre números positivos'); window.location.href='../html/factoriales.html'; </script>";
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