$(document).ready(function () {
    console.log("jquery working!!");
    document.getElementById('project_1').click();	
    document.getElementById('project_2').click();
    document.getElementById('project_3').click();
    document.getElementById('project_4').click();	
});

function opendrawer(obj){
    $('#'+obj.dataset.link).slideToggle(500);
}
