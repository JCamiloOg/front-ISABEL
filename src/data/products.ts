// ==========================================
// Tipos Auxiliares para Creación (sin ID)
// ==========================================

import type { ProductoConRelaciones } from "../@types/Products";

// ==========================================
// Datos de Prueba (10 Zapatos en Pesos Colombianos - COP)
// Descuentos configurados como porcentaje (ej: 10 = 10%)
// ==========================================

export const MOCK_PRODUCTOS_PRISMA: ProductoConRelaciones[] = [
    {
        idProducto: 1,
        nombre: "Nike Air Force 1 '07",
        sku: 'NK-AF1-001',
        idCategoriaProducto: 1,
        idMarca: 1,
        idTipoZapato: 1,
        precioCompra: 160000,
        precioVenta: 289900,
        publico: true,
        genero: 'Unisex',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 1,
                idProducto: 1,
                idColor: 101,
                imagenes: [
                    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 1,
                        idProductoColor: 1,
                        idTalla: 1,
                        stockActual: 15,
                        descuento: 0,
                        estado: 'Activo',
                        talla: { idTalla: 1, numeroTalla: '42', genero: 'Unisex', tallaInternacional: 'US 9' }
                    },
                    {
                        idVariante: 2,
                        idProductoColor: 1,
                        idTalla: 2,
                        stockActual: 8,
                        descuento: 0,
                        estado: 'Activo',
                        talla: { idTalla: 2, numeroTalla: '43', genero: 'Unisex', tallaInternacional: 'US 10' }
                    }
                ]
            },
            {
                idProductoColor: 2,
                idProducto: 1,
                idColor: 102,
                imagenes: [
                    '/shoesBlackWhite.jpg',
                    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 3,
                        idProductoColor: 2,
                        idTalla: 2,
                        stockActual: 20,
                        descuento: 10, // 10% de descuento
                        estado: 'Activo',
                        talla: { idTalla: 2, numeroTalla: '43', genero: 'Unisex', tallaInternacional: 'US 10' }
                    }
                ]
            }
        ]
    },
    {
        idProducto: 2,
        nombre: 'Adidas Ultraboost Light',
        sku: 'AD-UBL-002',
        idCategoriaProducto: 2,
        idMarca: 2,
        idTipoZapato: 2,
        precioCompra: 220000,
        precioVenta: 389900,
        publico: true,
        genero: 'Hombre',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 3,
                idProducto: 2,
                idColor: 102,
                imagenes: [
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1000&q=80',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 4,
                        idProductoColor: 3,
                        idTalla: 3,
                        stockActual: 5,
                        descuento: 15, // 15% de descuento
                        estado: 'Activo',
                        talla: { idTalla: 3, numeroTalla: '41', genero: 'Hombre', tallaInternacional: 'US 8.5' }
                    }
                ]
            }
        ]
    },
    {
        idProducto: 3,
        nombre: 'Puma Suede Classic XXI',
        sku: 'PM-SDC-003',
        idCategoriaProducto: 1,
        idMarca: 3,
        idTipoZapato: 1,
        precioCompra: 110000,
        precioVenta: 199900,
        publico: true,
        genero: 'Unisex',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 4,
                idProducto: 3,
                idColor: 103,
                imagenes: [
                    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 5,
                        idProductoColor: 4,
                        idTalla: 2,
                        stockActual: 12,
                        descuento: 0,
                        estado: 'Activo',
                        talla: { idTalla: 2, numeroTalla: '43', genero: 'Unisex', tallaInternacional: 'US 10' }
                    }
                ]
            }
        ]
    },
    {
        idProducto: 4,
        nombre: 'New Balance 574 Core',
        sku: 'NB-574-004',
        idCategoriaProducto: 1,
        idMarca: 4,
        idTipoZapato: 1,
        precioCompra: 140000,
        precioVenta: 249900,
        publico: true,
        genero: 'Mujer',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 5,
                idProducto: 4,
                idColor: 104,
                imagenes: [
                    'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 6,
                        idProductoColor: 5,
                        idTalla: 1,
                        stockActual: 0,
                        descuento: 5, // 5% de descuento
                        estado: 'Inactivo',
                        talla: { idTalla: 1, numeroTalla: '38', genero: 'Mujer', tallaInternacional: 'US 7.5' }
                    }
                ]
            }
        ]
    },
    {
        idProducto: 5,
        nombre: 'Converse Chuck Taylor All Star High',
        sku: 'CV-CTA-005',
        idCategoriaProducto: 1,
        idMarca: 5,
        idTipoZapato: 3,
        precioCompra: 95000,
        precioVenta: 179900,
        publico: true,
        genero: 'Unisex',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 6,
                idProducto: 5,
                idColor: 102,
                imagenes: [
                    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
                    '/login-shoes.jpg',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 7,
                        idProductoColor: 6,
                        idTalla: 3,
                        stockActual: 25,
                        descuento: 0,
                        estado: 'Activo',
                        talla: { idTalla: 3, numeroTalla: '40', genero: 'Unisex', tallaInternacional: 'US 7' }
                    }
                ]
            }
        ]
    },
    {
        idProducto: 6,
        nombre: 'Vans Old Skool Core Classics',
        sku: 'VN-OSK-006',
        idCategoriaProducto: 1,
        idMarca: 6,
        idTipoZapato: 1,
        precioCompra: 105000,
        precioVenta: 189900,
        publico: true,
        genero: 'Unisex',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 7,
                idProducto: 6,
                idColor: 102,
                imagenes: [
                    '/shoesGreenSplash.jpg',
                    '/shoesBlackWhite.jpg',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 8,
                        idProductoColor: 7,
                        idTalla: 2,
                        stockActual: 18,
                        descuento: 0,
                        estado: 'Activo',
                        talla: { idTalla: 2, numeroTalla: '42', genero: 'Unisex', tallaInternacional: 'US 9' }
                    }
                ]
            }
        ]
    },
    {
        idProducto: 7,
        nombre: 'ASICS GEL-Kayano 30',
        sku: 'AS-GK30-007',
        idCategoriaProducto: 2,
        idMarca: 7,
        idTipoZapato: 2,
        precioCompra: 210000,
        precioVenta: 359900,
        publico: true,
        genero: 'Hombre',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 8,
                idProducto: 7,
                idColor: 105,
                imagenes: [
                    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 9,
                        idProductoColor: 8,
                        idTalla: 4,
                        stockActual: 7,
                        descuento: 20, // 20% de descuento
                        estado: 'Activo',
                        talla: { idTalla: 4, numeroTalla: '44', genero: 'Hombre', tallaInternacional: 'US 10.5' }
                    }
                ]
            }
        ]
    },
    {
        idProducto: 8,
        nombre: 'Salomon Speedcross 6',
        sku: 'SL-SC6-008',
        idCategoriaProducto: 3,
        idMarca: 8,
        idTipoZapato: 4,
        precioCompra: 195000,
        precioVenta: 329900,
        publico: true,
        genero: 'Hombre',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 9,
                idProducto: 8,
                idColor: 102,
                imagenes: [
                    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1000&q=80',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 10,
                        idProductoColor: 9,
                        idTalla: 3,
                        stockActual: 10,
                        descuento: 0,
                        estado: 'Activo',
                        talla: { idTalla: 3, numeroTalla: '43', genero: 'Hombre', tallaInternacional: 'US 9.5' }
                    }
                ]
            }
        ]
    },
    {
        idProducto: 9,
        nombre: 'Timberland Premium 6-Inch Waterproof Boot',
        sku: 'TB-P6B-009',
        idCategoriaProducto: 4,
        idMarca: 9,
        idTipoZapato: 5,
        precioCompra: 280000,
        precioVenta: 459900,
        publico: true,
        genero: 'Hombre',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 10,
                idProducto: 9,
                idColor: 106,
                imagenes: [
                    'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1000&q=80',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 11,
                        idProductoColor: 10,
                        idTalla: 4,
                        stockActual: 14,
                        descuento: 0,
                        estado: 'Activo',
                        talla: { idTalla: 4, numeroTalla: '44', genero: 'Hombre', tallaInternacional: 'US 10.5' }
                    }
                ]
            }
        ]
    },
    {
        idProducto: 10,
        nombre: 'Reebok Club C 85 Vintage',
        sku: 'RB-CC85-010',
        idCategoriaProducto: 1,
        idMarca: 10,
        idTipoZapato: 1,
        precioCompra: 120000,
        precioVenta: 219900,
        publico: true,
        genero: 'Mujer',
        estado: 'Activo',
        colores: [
            {
                idProductoColor: 11,
                idProducto: 10,
                idColor: 107,
                imagenes: [
                    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
                ],
                estado: 'Activo',
                variantes: [
                    {
                        idVariante: 12,
                        idProductoColor: 11,
                        idTalla: 1,
                        stockActual: 9,
                        descuento: 0,
                        estado: 'Activo',
                        talla: { idTalla: 1, numeroTalla: '37', genero: 'Mujer', tallaInternacional: 'US 6.5' }
                    }
                ]
            }
        ]
    }
];
