<?php
class matematica {

    //Operaciones básicas:

    public static function sumar($num1,$num2){
        $suma=$num1+$num2;
        return $suma;
    }
    public static function restar($num1,$num2){
        $resta=$num1-$num2;
        return $resta;
    }
    public static function multiplicar($num1,$num2){
        $multi=$num1*$num2;
        return $multi;
    }
    public static function dividir($num1,$num2){
        if ($num2 != 0){
            $divi=$num1/$num2;
            return $divi;
        } else if ($num2 == 0){
            return "No se puede dividir entre 0";
        }
        
    }

    //Operaciones complejas:

    public static function potencia($base,$exponente){
        $potencia=pow($base,$exponente);
        return $potencia;
    }

    public static function raizCuadrada($num){
        if ($num > 0){
            $resultado=sqrt($num);
            return $resultado;
        } else{
            return "No se pudo realizar el calculo.";
        }
    }

    public static function baskara($a,$b,$c){
        if (sqrt($b*$b-4*$a*$c)>0){

            $raiz = sqrt($b*$b-4*$a*$c);
            $solucion1 = (($b*-1)+$raiz)/(2*$a);
            $solucion2 = (($b*-1)-$raiz)/(2*$a);
            return "| Raíz 1 = $solucion1 | Raíz 2 = $solucion2 |";
        } else{
            return "No tiene solución real";
        }
    }

    //Operaciones geometricas:

    public static function aCuadrado($num1,$num2){
        if ($num1==$num2) {
        $areaCuadrado=$num1*$num2;
            return "El area del cuadrado es $areaCuadrado cm²";
        } else {
            return "Ingrese dos medidas iguales";
        }
    }

    public static function aRectangulo($num1,$num2){
        if ($num1!=$num2) {
        $areaRectangulo=$num1*$num2;
            return "El area del rectangulo es $areaRectangulo cm²";
        } else {
            return "Ingrese dos medidas distintas";
        }	
    }

    public static function aCircunferencia($num1){
        $areaCircunferencia=3.141592*$num1*$num1;
        return $areaCircunferencia;
    }
    
    public static function aTriangulo($num1,$num2){
        $areaTriangulo=$num1*$num2;
	    $areaTriangulo=$areaTriangulo/2;
        return $areaTriangulo;
    }
    
}
?>
