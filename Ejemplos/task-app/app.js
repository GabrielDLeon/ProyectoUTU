$(function(){
    console.log('jQuery está funcionando');
    $('#task-result').hide();
    fetchTasks();

    let edit = false;
    $('#search').keyup(function(e){
        if ($('#search').val()){
            let search = $('#search').val();
            $.ajax({
                url: 'task-search.php',
                type: 'POST',
                data: {search},
                success: function(response){
                    let tasks = JSON.parse(response);
                    let template = '';
    
                    tasks.forEach(task => {
                        template += `<li> ${task.name} </li>`;
                    });
                    
                    $('#task-result').show();
                    $('#container').html(template);
                }
            });
        }  
    })

    $('#task-form').submit(function(e){
        const postData = {
            name: $('#name').val(),
            description: $('#description').val(),
            id: $('#taskId').val()
        };

        let url = edit === false ? 'task-add.php' : 'task-edit.php';

        $.post(url, postData, function(response) {
            console.log(response);
            edit = false;
            fetchTasks();
            $('#task-form').trigger('reset');
        })
        e.preventDefault();
    });

    function fetchTasks(){
        $.ajax({
            url: 'task-list.php',
            type: 'GET',
            success: function(response){
                let tasks = JSON.parse(response);
                let template = '';
    
                tasks.forEach(task => {
                    template += `
                        <tr taskId="${task.id}">
                            <td> ${task.id} </td>
                            <td>
                                <a class="task-item">${task.name}</a>
                            </td>
                            <td> ${task.description} </td>
                            <td>
                                <button class="task-delete btn btn-danger">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `
                });
                $('#tasks').html(template);
            }
        });
    }

    $(document).on('click', '.task-delete', function(){
        if(confirm('Are you sure to delete this task?')){
            let element = $(this)[0].parentElement.parentElement;
            let id = $(element).attr('taskId');
            $.post('task-delete.php', {id}, function(response){
                fetchTasks();
                console.log(response);
            })
        }
    })

    $(document).on('click', '.task-item', function(){
        let element = $(this)[0].parentElement.parentElement;
        let id = $(element).attr('taskId');
        $.post('task-single.php', {id}, function(response){
            const task = JSON.parse(response);
            $('#name').val(task.name);
            $('#description').val(task.description);
            $('#taskId').val(task.id);
            edit = true;
        })
        
    })

})