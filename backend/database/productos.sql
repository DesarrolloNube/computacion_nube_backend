CREATE TABLE IF NOT EXISTS categorias (
    id INT NOT NULL AUTO_INCREMENT,
    nombre_categoria VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categorias_nombre_categoria (nombre_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS productos (
    id INT NOT NULL AUTO_INCREMENT,
    nombre_producto VARCHAR(150) NOT NULL,
    descripcion_producto TEXT NULL,
    precio_producto DECIMAL(12,2) NOT NULL,
    stock_producto INT NOT NULL DEFAULT 0,
    imagen_producto VARCHAR(500) NULL,
    id_categoria INT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY ix_productos_nombre_producto (nombre_producto),
    KEY ix_productos_id_categoria (id_categoria),
    CONSTRAINT fk_productos_categorias FOREIGN KEY (id_categoria)
        REFERENCES categorias (id) ON DELETE SET NULL,
    CONSTRAINT chk_productos_precio CHECK (precio_producto > 0),
    CONSTRAINT chk_productos_stock CHECK (stock_producto >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO categorias (nombre_categoria) VALUES ('Herramientas');

SET @id_herramientas = (SELECT id FROM categorias WHERE nombre_categoria = 'Herramientas');

INSERT INTO productos
    (nombre_producto, precio_producto, stock_producto, imagen_producto, id_categoria, created_at, updated_at)
VALUES
    ('Taladro Makita DP2011', 45900.00, 10, 'https://storage.googleapis.com/se-ferre-bucket/productos/herramientas/MakitaTaladroDP2011-1.webp', @id_herramientas, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('Martillo de acero', 8500.00, 10, 'https://placehold.co/600x600?text=Martillo', @id_herramientas, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('Juego de destornilladores', 12500.00, 10, 'https://placehold.co/600x600?text=Destornilladores', @id_herramientas, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('Taladro inalámbrico', 65000.00, 10, 'https://placehold.co/600x600?text=Taladro+inalambrico', @id_herramientas, UTC_TIMESTAMP(), UTC_TIMESTAMP());
