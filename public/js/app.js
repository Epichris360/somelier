/* Your custom app logic goes here */

$(function(){
    $("#closeAlert").on('click', function(event){
        $.get("/remover-alert",
        function(data, status){
            $("#alertMsg").hide()
            console.log('status: ',status)
            console.log("works!")
        });
    })
}) 
