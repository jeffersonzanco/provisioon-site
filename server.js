const express = require('express');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuração SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configuração Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get('/', (req, res) => res.send('Servidor PROVISIOON Online! 🔑'));

// ROTA PARA ENVIAR CHAVE (E-mail e SMS)
app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room } = req.body;
    const keyUrl = `https://provisioon.com/key.html?room=${room}`;

    try {
        // 1. Enviar E-mail via SendGrid
        const msg = {
            to: email,
            from: 'noreply@provisioon.com',
            subject: '🔑 Sua Chave Digital PROVISIOON',
            html: `<h2>Olá ${name}!</h2><p>Sua chave para o quarto ${room} está pronta.</p><a href="${keyUrl}" style="background:#00d4ff;color:white;padding:15px;text-decoration:none;border-radius:5px;display:inline-block;">ABRIR PORTA</a>`
        };
        await sgMail.send(msg);

        // 2. Enviar SMS via Twilio (Só funcionará após aprovação de quarta-feira)
        if (phone) {
            await twilioClient.messages.create({
                body: `PROVISIOON: Ola ${name}! Sua chave para o quarto ${room} esta pronta: ${keyUrl}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
        }

        res.status(200).json({ success: true, message: 'Chave enviada com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao enviar chave.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
