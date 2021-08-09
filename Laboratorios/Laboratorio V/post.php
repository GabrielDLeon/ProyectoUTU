<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ficha</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <?php
    $nombre = $_POST['nombre'];
    $cedula = $_POST['cedula'];
    $email = $_POST['email'];
    $localidad = $_POST['localidad'];
    $direccion = $_POST['direccion'];
    $telefono = $_POST['telefono'];
    
    $ada = $_POST['nota1'];
    $basedatos = $_POST['nota2'];
    $web = $_POST['nota3'];
    $proyecto = $_POST['nota4'];
    $filosofia = $_POST['nota5'];
    $formacion = $_POST['nota6'];
    $ingles = $_POST['nota7'];
    $matematicas = $_POST['nota8'];
    $programacion = $_POST['nota9'];
    $sistemas = $_POST['nota10'];
    $promedio = ($ada + $basedatos + $web + $proyecto + $filosofia + $formacion + $ingles + $matematicas + $programacion + $sistemas)/10;
    ?>
</head>
<body class="bg-light">
    
    <div class="container">
        <div class="py-5 text-center">
            <img class="mb-3 d-block mx-auto" src="img/mortarboard.png" width="72" height="72">
            <h2>Ingreso satisfactorio</h1>
            <p class="lead">Se ha ingresado correctamente los datos del alumno en cuestión.<br>Para los datos que aún no fueron ingresados, se marcará a continuación "No se ha ingresado ningún valor"</p>
        </div>
    </div>

    <div class="container h6 lead">
        <h3>Información básica</h3>
        <?php
        echo "Nombre completo: $nombre"."<br>";
        echo "Cedula de Identidad: ".operaciones::generador($cedula)."<br>";
        echo "Email: ".operaciones::comprobador($email)."<br>";
        echo "Localidad: ".operaciones::comprobador($localidad)."<br>";
        echo "Dirección: ".operaciones::comprobador($direccion)."<br>";
        echo "Telefono: ".operaciones::comprobador($telefono)."<br>";
        ?>
        <br>
        <h3>Notas</h3>
        <?php
        echo "ADA: $ada <br>";
        echo "Base de datos II: $basedatos <br>";
        echo "Diseño Web: $web <br>";
        echo "Gestión de proyecto: $proyecto <br>";
        echo "Filosofía: $filosofia <br>";
        echo "Formación empresarial: $formacion <br>";
        echo "Inglés: $ingles <br>";
        echo "Matemáticas: $matematicas <br>";
        echo "Programación: $programacion <br>";
        echo "Sistemas operativos III: $sistemas <br>";
        ?>
        <br>
        <button class="btn btn-success">
        <?php
        echo "Promedio: $promedio";
        echo "<br> Juicio: ".operaciones::juicio($promedio);
        ?>
        </button>
        
    </div>
</body>
</html>

<?php  
class operaciones{
    public static function comprobador($variable){
        if ($variable ==""){
            return "No se ha ingresado ningún valor";
        } else if ($variable != ""){
            return $variable;
        }
    }
    public static function generador ($cedula) {
        $resultado=$cedula[0]*2+$cedula[1]*9+$cedula[2]*8+$cedula[3]*7+$cedula[4]*6+$cedula[5]*3+$cedula[6]*4;
        $a = $resultado;
        while (($a % 10)!= 0) {
           $a++;
        }
        $resultado = $a - $resultado;
        return "$cedula-$resultado";
    }
    public static function juicio ($promedio){
        if ($promedio >= 1 && $promedio <= 3){
            return "Examen Febrero.";
        }
        if ($promedio >= 4 && $promedio <= 7) {
            return "Examen reglamentado.";
        }
        if ($promedio >= 8 && $promedio <= 12) {
            return "Exonerado.";
        }
    }
}

?>