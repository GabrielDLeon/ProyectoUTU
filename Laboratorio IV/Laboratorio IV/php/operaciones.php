<?php
class operacion{
    public static function generador ($cedula) {
        $resultado=$cedula[0]*2+$cedula[1]*9+$cedula[2]*8+$cedula[3]*7+$cedula[4]*6+$cedula[5]*3+$cedula[6]*4;
        $a = $resultado;
        while (($a % 10)!= 0) {
           $a++;
        }
        $resultado = $a - $resultado;
        echo "<script> alert('El número verificador de la cedula $cedula es $resultado / $cedula-$resultado');window.location.href='../index.html'; </script>";
    }
    public static function comprobador ($cedula) {
        $resultado=$cedula[0]*2+$cedula[1]*9+$cedula[2]*8+$cedula[3]*7+$cedula[4]*6+$cedula[5]*3+$cedula[6]*4;
        $a = $resultado;
        while (($a % 10)!= 0) {
           $a++;
        }
        $resultado = $a - $resultado;
        if ($cedula[7]!=$resultado) {
            echo "<script> alert('El número verificador de la cedula es incorrecto');window.location.href='../index.html'; </script>";
        } else {
            echo "<script> alert('El número verificador de la cedula es correcto');window.location.href='../index.html'; </script>";
        }
        /*
        $resultado = $resultado + $cedula[7];
        if (($resultado % 10)== 0){
            echo "<script> alert('El número verificador de la cedula es correcto');window.location.href='../index.html'; </script>";
        } else if (($resultado % 10)!= 0){
            echo "<script> alert('El número verificador de la cedula es incorrecto');window.location.href='../index.html'; </script>";
        }
        */
    } 
}   
?>