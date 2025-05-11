$(#successcontainer).hide();
$(document).ready(function () {
    $("#btn1").click(function () {
        alert("El pago se ha realizado con éxito");
        $("#success-container").show();
        form.reset();
    });
});


