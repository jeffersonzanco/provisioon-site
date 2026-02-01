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

// Configurações das chaves
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/send-key', async (req, res) => {
    const { name, email, phone, room } = req.body;
    const keyUrl = `https://provisioon.com/key.html?room=${room}`;

    try {
        // 1. Enviar E-mail (Remetente oficial)
        const msg = {
            to: email,
            from: {
                email: 'keys@provisioon.com',
                name: '🔑 PROVISIOON'
            },
            subject: '🔑 Sua Chave Digital PROVISIOON',
            html: `
                <div style="font-family:sans-serif; max-width:500px; margin:auto; border:1px solid #eee; padding:20px; border-radius:10px;">
                    <h2 style="color:#001a33;">Olá ${name}!</h2>
                    <p>Sua chave digital para o <strong>Quarto ${room}</strong> já está disponível.</p>
                    <div style="text-align:center; margin:30px 0;">
                        <a href="${keyUrl}" style="background:#00d4ff; color:white; padding:15px 25px; text-decoration:none; border-radius:5px; font-weight:bold; display:inline-block;">ABRIR PORTA AGORA</a>
                    </div>
                    <p style="font-size:12px; color:#666;">Se o botão não funcionar, copie e cole este link: ${keyUrl}</p>
                </div>
            `
        };
        await sgMail.send(msg);

        // 2. Enviar SMS (Reativado!)
        if (phone) {
            await twilioClient.messages.create({
                body: `PROVISIOON: Ola ${name}! Sua chave para o quarto ${room} esta pronta. Acesse: ${keyUrl}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
        }

        res.status(200).json({ success: true, message: 'Chave enviada por E-mail e SMS!' });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
