const formulario = document.getElementById('formulario');

formulario.addEventListener('submit',e=>{
	e.preventDefault();
	const token = grecaptcha.getResponse();
	if (!token) {
		alert("Por favor, completa el reCAPTCHA.");
		return;
	}
	const formData = new FormData(e.target);
	const data = Object.fromEntries(formData.entries());
    data['g-recaptcha-response'] = token;
    fetch('/contact/add',{
    	method:'POST',
    	headers:{
    		"Content-Type":"application/json"
    	},
    	body:JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(res=>{
    	if(res.status==true){
    		alert('¡Datos de Contacto creados Correctamente!');
    	}else{
    		alert('¡Los Datos no se pudieron crear correctamente por alguna extraña razon hijo JAJAJAJAJ!');
    	}
    })

});
