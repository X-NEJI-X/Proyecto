import { Request, Response } from 'express';

export const index = (req: Request, res: Response) => {
  res.render('pages/index');
};


// Ruta para la vista de pago
export const vistas = (req: Request, res: Response) => {
  res.render('pages/vistas');
};
