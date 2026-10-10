import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

export default function FloatingActions({ whatsappNumber = null, email = null }) {
  const normalizedWhatsApp = whatsappNumber ? String(whatsappNumber).replace(/\D/g, '') : '';

  if (!normalizedWhatsApp && !email) return null;

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
