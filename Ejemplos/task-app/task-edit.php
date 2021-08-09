<?php

    include('database.php');

    $id = $_POST['id'];
    $name = $_POST['name'];
    $description = $_POST['description'];

    $query = "UPDATE task SET name = '$name', description = '$description' WHERE id = '$id'";
    $result = mysqli_query($connection, $query);
    if (!$result){
        die('Query failed.');
    }
    echo "Update Task Successfully";

?>