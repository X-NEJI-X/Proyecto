"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vistas = exports.index = void 0;
const index = (req, res) => {
    res.render('pages/index');
};
exports.index = index;
// Ruta para la vista de pago
const vistas = (req, res) => {
    res.render('pages/vistas');
};
exports.vistas = vistas;
//# sourceMappingURL=homeController.js.map