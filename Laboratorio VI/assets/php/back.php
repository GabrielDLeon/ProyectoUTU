<?php
        $cedula=$_POST['cedula'];
        $nombre=$_POST['nombre'];
        $email=$_POST['email'];
        $localidad=$_POST['localidad'];
        $direccion=$_POST['direccion'];
        $telefono=$_POST['telefono'];
        $ada=$_POST['nota1'];
        $basedatos=$_POST['nota2'];
        $web=$_POST['nota3'];
        $proyecto=$_POST['nota4'];
        $filosofia=$_POST['nota5'];
        $formacion=$_POST['nota6'];
        $ingles=$_POST['nota7'];
        $matematicas=$_POST['nota8'];
        $programacion=$_POST['nota9'];
        $sistemas=$_POST['nota10'];
        $suma=$ada+$basedatos+$web+$proyecto+$filosofia+$formacion+$ingles+$matematicas+$programacion+$sistemas;
        $promedio=$suma/10;

        echo "<h3>Ficha del alumno</h3>";
        echo "Nombre: $nombre <br>" ;
        echo "Cédula: " . operacion::generador($cedula) . "<br>";
        echo "Email: $email <br>";
        echo "Localidad: $localidad <br>";
        echo "Dirección: $direccion <br>";
        echo "Teléfono: $telefono <br>";
        echo "<hr>"; 
        echo "<h4> Notas </h4>";
        echo "ADA: $ada <br>";
        echo "Base de datos: $basedatos <br>";
        echo "Diseño web: $web <br>";
        echo "Gestión de proyecto: $proyecto <br>"; 
        echo "Formación empresarial: $filosofia <br>";
        echo "Filosofía: $formacion <br>";
        echo "Inglés: $ingles <br>";
        echo "Matemáticas $matematicas <br>";
        echo "Programación: $programacion <br>";
        echo "Sistemas operativos: $sistemas <br>";
        echo "<br>";

        if ($promedio >= 1 && $promedio <= 3){
                echo "<button type='button' class='btn btn-danger'>"."Promedio: $promedio"."<br> Juicio: Examen febrero"."</button>";
        }
        if ($promedio >= 4 && $promedio <= 7) {
                echo "<button type='button' class='btn btn-warning'>"."Promedio: $promedio"."<br> Juicio: Examen reglamentado"."</button>";
        }
        if ($promedio >= 8 && $promedio <= 12) {
                echo "<button type='button' class='btn btn-success'>"."Promedio: $promedio"."<br> Juicio: Exonerado"."</button>";
        }

        

        class operacion {
        public static function generador ($cedula) {
                $resultado=$cedula[0]*2+$cedula[1]*9+$cedula[2]*8+$cedula[3]*7+$cedula[4]*6+$cedula[5]*3+$cedula[6]*4;
                $a = $resultado;
                while (($a % 10)!= 0) {
                   $a++;
                }
                $resultado = $a - $resultado;
                return "$cedula-$resultado";
            }
        }
?>