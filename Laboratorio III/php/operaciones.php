<?php
class operacion{

    public static function sumar($num1, $num2, $base1, $base2){
        $resultado = base_convert($num1,$base1,10) + base_convert($num2,$base2,10);
        echo "<script> alert('$num1($base1) + $num2($base2) = $resultado');window.location.href='../index.html'; </script>";
    }

    public static function restar($num1, $num2, $base1, $base2){
        $resultado = base_convert($num1,$base1,10) - base_convert($num2,$base2,10);
        echo "<script> alert('$num1($base1) - $num2($base2) = $resultado');window.location.href='../index.html'; </script>";
    }

    public static function multiplicar($num1, $num2, $base1, $base2){
        $resultado = base_convert($num1,$base1,10) * base_convert($num2,$base2,10);
        echo "<script> alert('$num1($base1) * $num2($base2) = $resultado');window.location.href='../index.html'; </script>";
    }

    public static function dividir($num1, $num2, $base1, $base2){
        $resultado = base_convert($num1,$base1,10) / base_convert($num2,$base2,10);
        echo "<script> alert('$num1($base1) / $num2($base2) = $resultado');window.location.href='../index.html'; </script>";
    }

}
?>