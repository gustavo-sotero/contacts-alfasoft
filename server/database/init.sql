-- Script de inicialização com dados de exemplo
-- Execute este script após executar o create_database.sql
USE contacts_db;

-- Inserir usuário admin padrão
INSERT IGNORE INTO users (username, password, email) VALUES ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com');

-- Inserir dados de exemplo para contatos
INSERT IGNORE INTO contacts (name, contact, email, picture) VALUES
('João Silva Santos', '123456789', 'joao.silva@email.com', 'https://ui-avatars.com/api/?name=João+Silva+Santos&size=150&background=random'),
('Maria Oliveira Costa', '987654321', 'maria.oliveira@email.com', 'https://ui-avatars.com/api/?name=Maria+Oliveira&size=150&background=random'),
('Carlos Eduardo Pereira', '456789123', 'carlos.pereira@email.com', 'https://ui-avatars.com/api/?name=Carlos+Pereira&size=150&background=random'),
('Ana Paula Ferreira', '789123456', 'ana.ferreira@email.com', 'https://ui-avatars.com/api/?name=Ana+Paula+Ferreira&size=150&background=random'),
('Pedro Henrique Lima', '321654987', 'pedro.lima@email.com', 'https://ui-avatars.com/api/?name=Pedro+Lima&size=150&background=random');
