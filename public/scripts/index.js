$(".dropdown-menu li a").click(function(event){
    var value = this.text;
    console.log(this.text);
    console.log($("div .dropdown-toggle"));
    $("div .dropdown-toggle:first").html(value);
});