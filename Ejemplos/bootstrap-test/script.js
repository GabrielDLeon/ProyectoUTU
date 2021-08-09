$(document).ready(function(){

    $(document).on('click', '#checkbox', function(){
        let check = $('#checkbox').prop('checked');
        if (check===true){
            $('#boton').prop('disabled', false);
        } else {
            $('#boton').prop('disabled', true);
        }
        
    });

});