const express = require('express');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(__dirname));

// CONFIGURAÇÃO SEGURA: Busca as chaves das variáveis do Railway
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room } = req.body;
    const keyUrl = `https://provisioon.com/key.html?room=${room}`;

    try {
        const msg = {
            to: email,
            from: jeffersonzancousa@gmail.com,
            subject: '🔑 Sua Chave Digital PROVISIOON',
            html: `<h2>Olá ${name}!</h2><p>Sua chave para o quarto ${room} está pronta.</p><a href="${keyUrl}" style="background:#00d4ff;color:white;padding:15px;text-decoration:none;border-radius:5px;display:inline-block;">ABRIR PORTA</a>`
        };
        await sgMail.send(msg);
        res.status(200).json({ success: true, message: 'Chave enviada!' });
    } catch (error) {
        console.error('Erro detalhado:', error.response ? error.response.body : error);
        res.status(500).json({ success: false, message: 'Erro: ' + (error.message || 'Unauthorized') });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
