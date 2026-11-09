-- Tabla para tokens de recuperación de contraseña (MySQL - superFerrDB)
-- El token viaja en el correo; en la BD solo se guarda su hash SHA-256
CREATE TABLE password_reset_tokens (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);
