"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.render('pages/index'); // Página principal
});
router.get('/vistas', (req, res) => {
    res.render('pages/vistas');
});
exports.default = router;
//# sourceMappingURL=homeRoutes.js.map