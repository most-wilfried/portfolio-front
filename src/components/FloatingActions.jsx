import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const WHATSAPP_NUMBER = '33612345678';
const EMAIL_ADDRESS = 'contact@votre-portfolio.com';

export default function FloatingActions({ whatsappNumber = WHATSAPP_NUMBER, email = EMAIL_ADDRESS }) {
  const normalizedWhatsApp = whatsappNumber ? String(whatsappNumber).replace(/\D/g, '') : '';

  return (
    <div className="floating-actions">
      {normalizedWhatsApp ? (
        <a
          href={`https://wa.me/${normalizedWhatsApp}`}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
        >
          <FaWhatsapp />
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} aria-label="Email">
          <FaEnvelope />
        </a>
      ) : null}
    </div>
  );
}
