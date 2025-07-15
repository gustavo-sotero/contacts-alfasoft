-- Script para criar o banco de dados e estrutura inicial
-- Execute este script primeiro no seu servidor MariaDB/MySQL

CREATE DATABASE IF NOT EXISTS contacts_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Verificar se o banco foi criado
SHOW DATABASES LIKE 'contacts_db';

-- Usar o banco
USE contacts_db;

-- Verificar se estamos no banco correto
SELECT DATABASE();

-- Criar tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(9) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    picture VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints para validação
    CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) >= 5),
    CONSTRAINT chk_contact_format CHECK (contact REGEXP '^[0-9]{9}$'),
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

-- Criar tabela de usuários para autenticação
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_contact ON contacts(contact);
CREATE INDEX idx_users_username ON users(username);
