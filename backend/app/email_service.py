import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from dotenv import load_dotenv

load_dotenv()


def send_email(to_email: str, subject: str, body: str, html_body: str | None = None):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender_name = os.getenv("SMTP_FROM_NAME", "Arte da Magia")

    if not smtp_user or not smtp_password:
        raise ValueError("Configurações SMTP não encontradas no .env")

    message = EmailMessage()
    message["From"] = formataddr((sender_name, smtp_user))
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    if html_body:
        message.add_alternative(html_body, subtype="html")

    with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(message)

def send_shipping_email(
    customer_email: str,
    customer_name: str,
    order_id: int,
    tracking_code: str,
    shipping_company: str
):
    subject = f"Seu pedido #{order_id} foi enviado! - Arte da Magia"

    body = f"""Olá, {customer_name}!

Seu pedido #{order_id} da Arte da Magia foi enviado!

Transportadora: {shipping_company}
Código de rastreamento: {tracking_code}

Acompanhe sua encomenda pelo site oficial dos Correios:
https://rastreamento.correios.com.br/app/index.php

Basta acessar o link e informar seu código de rastreamento.

Agradecemos pela sua compra!

Equipe Arte da Magia
"""

    from html import escape

    tracking_url = "https://rastreamento.correios.com.br/app/index.php"

    safe_name = escape(customer_name)
    safe_code = escape(tracking_code)
    safe_company = escape(shipping_company)

    html_body = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="margin:0; padding:30px 15px;
                 background-color:#0f172a;
                 font-family:Arial,sans-serif;">

        <div style="max-width:560px; margin:auto;
                    background-color:#1e293b;
                    border-radius:16px;
                    padding:35px 25px;
                    text-align:center;
                    color:#ffffff;">

            <h1 style="color:#c4b5fd; letter-spacing:2px;">
                ✦ ARTE DA MAGIA ✦
            </h1>

            <hr style="border:0; border-top:1px solid #475569;">

            <h2 style="margin-top:30px;">
                Seu pedido está a caminho!
            </h2>

            <p style="color:#cbd5e1; line-height:1.7;">
                Olá, {safe_name}!<br>
                Seu pedido <strong>#{order_id}</strong> foi enviado.
            </p>

            <div style="background-color:#0f172a;
                        border-radius:10px;
                        padding:20px; margin:25px 0;">

                <p style="color:#94a3b8; margin:0 0 10px;">
                    Código de rastreamento
                </p>

                <p style="font-size:22px; font-weight:bold;
                          color:#c4b5fd; margin:0;">
                    {safe_code}
                </p>

                <p style="color:#cbd5e1; font-size:13px;">
                    Transportadora: {safe_company}
                </p>
            </div>

            <a href="{tracking_url}"
               style="display:inline-block;
                      background-color:#7c3aed;
                      color:#ffffff;
                      text-decoration:none;
                      padding:15px 28px;
                      border-radius:10px;
                      font-weight:bold;">
                Rastrear minha encomenda
            </a>

            <p style="color:#94a3b8; font-size:13px;
                      margin-top:25px; line-height:1.6;">
                Ao acessar os Correios, informe seu código
                de rastreamento para consultar a entrega.
            </p>

            <hr style="border:0; border-top:1px solid #475569;
                       margin-top:30px;">

            <p style="color:#cbd5e1; font-size:13px;">
                Obrigado por comprar na Arte da Magia! 💜
            </p>

        </div>
    </body>
    </html>
    """

    send_email(
        to_email=customer_email,
        subject=subject,
        body=body,
        html_body=html_body
    )