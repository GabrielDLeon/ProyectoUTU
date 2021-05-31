<?php
class operacion{

    //Comprobador de existencia
    public static function comprobadorExistencia($valor){
        if ($valor == ""){
            return false;
        } else if ($valor != ""){
            return true;
        }
    }
}
?>