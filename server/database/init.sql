CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(9) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    picture VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (username, password, email) VALUES ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com');

INSERT IGNORE INTO contacts (name, contact, email, picture) VALUES ('João Silva Santos', '123456789', 'joao.silva@email.com', 'https://ui-avatars.com/api/?name=João+Silva+Santos&size=150&background=random');

INSERT IGNORE INTO contacts (name, contact, email, picture) VALUES ('Maria Oliveira', '987654321', 'maria.oliveira@email.com', 'https://ui-avatars.com/api/?name=Maria+Oliveira&size=150&background=random');

INSERT IGNORE INTO contacts (name, contact, email, picture) VALUES ('Carlos Pereira', '456789123', 'carlos.pereira@email.com', 'https://ui-avatars.com/api/?name=Carlos+Pereira&size=150&background=random');
