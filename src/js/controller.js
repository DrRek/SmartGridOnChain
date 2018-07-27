$(document).ready(function() {
    $("#dinamic-content").load("storage.html");
});

function home(){
	cleanWindow();
	$('#home-button').addClass('active');
    $("#dinamic-content").load("home.html");
    $("input#search").attr("placeholder", "Search account statistic...");
}

function history(){
	cleanWindow();
	$('#history-button').addClass('active');
    $("#dinamic-content").load("history.html");
    $("input#search").attr("placeholder", "Search account history...");
}

function storage(){
	cleanWindow();
	$('#storage-button').addClass('active');
    $("#dinamic-content").load("storage.html");
    $("input#search").attr("placeholder", "Search storage...");
}

function cleanWindow(){
	$('#dinamic-content').html('');
	$('.sidebar-wrapper >> li').removeClass('active');
}