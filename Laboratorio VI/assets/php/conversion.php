<?php
$numero=$_POST['cvalor'];
$base=$_POST['cbase1'];
$objetivo=$_POST['cbase2'];

echo "La conversion de $numero($base) es ".operacion ::conversion ($numero, $base, $objetivo)."($objetivo)";

class operacion{
    public static function conversion($numero,$base,$objetivo){
        $resultado = base_convert($numero,$base,$objetivo);
        return $resultado;
    }
}
?>