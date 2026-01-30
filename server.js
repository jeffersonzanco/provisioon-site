const express = require('express');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos
app.use(express.static(__dirname));

// ROTA PARA ABRIR O PAINEL ADMIN
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ROTA PARA ABRIR A PÁGINA INICIAL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ROTA PARA ENVIAR CHAVE (E-mail e SMS)
app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room } = req.body;
    const keyUrl = `https://provisioon.com/key.html?room=${room}`;

    try {
        const msg = {
            to: email,
            from: 'noreply@provisioon.com',
            subject: '🔑 Sua Chave Digital PROVISIOON',
            html: `<h2>Olá ${name}!</h2><p>Sua chave para o quarto ${room} está pronta.</p><a href="${keyUrl}" style="background:#00d4ff;color:white;padding:15px;text-decoration:none;border-radius:5px;display:inline-block;">ABRIR PORTA</a>`
        };
        await sgMail.send(msg);

        if (phone) {
            await twilioClient.messages.create({
                body: `PROVISIOON: Ola ${name}! Sua chave para o quarto ${room} esta pronta: ${keyUrl}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
        }
        res.status(200).json({ success: true, message: 'Chave enviada!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
