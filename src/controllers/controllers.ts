import * as dotenv from 'dotenv';
dotenv.config();
import ContactosModel from '@models/models.js';
import {Request,Response} from 'express';
import {nanoid} from 'nanoid';
import axios from 'axios';
import { sendEmail} from '../utils/nodemailer.js';
interface Contacto {
  email: string;
  nombre: string;
  comentario: string;
  ip?: string;
}
interface Payment {
  correo: string;
  nombreTitular: string;
  cardNumber: string;
  expMonth: number | string;
  expYear: number | string;
  cvv: string;
  currency: string;
  amount:string;
  descripcion:string;
}

class ContactsController {
  /**
   * Agrega un nuevo contacto y envía notificación por correo
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
 async add(req: Request, res: Response): Promise<void> {
  const SECRET_KEY = process.env.SECRET_KEYY;
  const { email, nombre, comentario } = req.body;

    // Validación básica
  if (!email || !nombre || !comentario) {
    res.status(400).json({ status: false, message: 'Faltan campos obligatorios.' });
  }

  try {
    const token = req.body['g-recaptcha-response'];
    if (!token) {
      res.status(400).json({ 
        status: false, 
        message: 'Por favor, confirma que no eres un robot.' 
      });
    }
    const recaptchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      { params: { secret: SECRET_KEY, response: token } }
      );
    if (!recaptchaResponse.data.success) {
     res.status(400).json({ 
      status: false, 
      message: 'Falló la verificación del captcha.' 
    });
   }
   const ip = req.ip || 'unknown';
   const ipstackResponse = await fetch(
 `http://api.ipstack.com/${ip}?access_key=${process.env.KEYIPAPI}`
 );
   const ipstackData = await ipstackResponse.json();
   const pais = ipstackData.country_name || 'datos-de-prueba-activados';
   await ContactosModel.addContact({ email, nombre, comentario, pais, ip });
   const subject = 'Alerta de contacto';
   const message = `Datos del contacto:
-----------------------------
• Nombre: ${nombre}
• Comentario: ${comentario}
• Email: ${email}
• Dirección IP: ${ip}
• País: ${pais}
• Fecha y hora: ${new Date().toLocaleString()}
   -----------------------------`;
   const recipients = ['programacion2ais@yopmail.com','carloscolmenarestorres888@gmail.com'];

   const result = await sendEmail(recipients, subject, message);
   if (!result.success) {
    console.error('Error al enviar correo:', result.error);
  }
        // Única respuesta
  res.status(201).json({ 
    status: true, 
    message: 'Contacto registrado correctamente.',
    emailSent: result.success 
  });

} catch (error: any) {
  console.error('Error en /contact/add:',error.message);
  res.status(500).json({
    status: false,
    message: 'Error interno al agregar el contacto',
  });
}
}
async getAllContacts(req:Request,res:Response):Promise<void>{
  try {
    const contacts = await ContactosModel.getAllContacts();
    console.log("Datos a renderizar:", contacts);
    res.render('contactos', { contacts });
  }catch(error: any) {
    console.error('Error:', error);
    res.status(500).render('error', { message: 'Error al cargar contactos' });
  }
}

payment(req:Request,res:Response):Promise<void>{
  return new Promise<void>((resolve) => {
    try {
      res.render('payment');
      resolve();
    } catch(error: any) {
      console.error('Error:', error);
      res.status(500).render('error', { message: 'error al cargar vista formulario de pago' });
      resolve();
    }
  });
}

async paymentAdd(req: Request, res: Response): Promise<void> {
  const { correo, nombreTitular, cardNumber, expMonth, expYear, cvv, currency,amount,descripcion}: Payment = req.body;
  const reference = nanoid(10);
  try {
    const response = await fetch('https://fakepayment.onrender.com/payments',{
      method:'POST',
      headers:{
        'Authorization': `Bearer ${process.env.KEYAPIFAKE}`,
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        "amount": amount.toString(),
        "card-number": cardNumber,
        "cvv":cvv,
        "expiration-month":expMonth,
        "expiration-year":expYear,
        "full-name":nombreTitular,
        "currency":currency,
        "description":descripcion,
        "reference":reference
      })
    });
    const data = await response.json();
    if(!response.ok){
      throw new Error(data.message || 'Error en el pago');
    }
    await ContactosModel.paymentAdd({
      correo,
      nombreTitular,
      cardNumber:String(cardNumber),
      expMonth: Number(expMonth),
      expYear: Number(expYear),
      cvv: String(cvv),
      currency,
      amount:String(amount),
      descripcion:String(descripcion),
      reference
    });
    res.status(201).json({status:true,pago:true,transactionId:data.data.transaction_id});
  } catch(error: any) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error al procesar el pago',
      error: error.message
    });
  }
}

async getPayment(req: Request, res: Response):Promise<void>{
 try{
   const datePayments = await ContactosModel.getAllPayments();
   res.render('getPayments',{datePayments});
 }catch(error:any){
   console.error('Error:', error);
   res.status(500).render('error', { 
    message: 'Error al procesar el pago',
    error: error.message
  });
 }
}

  /**
   * Obtiene todos los comentarios
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
async getComentarios(req: Request, res: Response): Promise<void> {
  try {
    const comentarios = await ContactosModel.getAllContacts();
    res.status(200).json(comentarios);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ 
      message: 'Error al obtener comentarios',
      status: false
    });
  }
}

  /**
   * Renderiza la página principal con las imágenes disponibles
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
async index(req: Request, res: Response): Promise<void> {
  try {
    res.render('index',{sitioKey:process.env.SITIO_KEY});
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
}



}

export default new ContactsController();
