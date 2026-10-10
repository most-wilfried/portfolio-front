import { FaPhone } from 'react-icons/fa';
import { useTranslation } from '../i18n';
import '../contact-details.css';

export default function PhoneContacts({ variant = 'default' }) {
  const { t, content: { profile } } = useTranslation();
  const phones = profile.phones ?? [];

  if (!phones.length) return null;

  return (
    <ul className={`phone-contacts phone-contacts-${variant}`} aria-label={t('contact.phone')}>
      {phones.map((phone) => {
        const country = t(`contact.phone${phone.country_code}`);
        return (
          <li key={phone.country_code}>
            <a className="phone-contact-link" href={phone.href} aria-label={t('contact.callPhone', { country, number: phone.display })}>
              <span className="phone-contact-marker" aria-hidden="true">
                <FaPhone />
                <span>{phone.country_code}</span>
              </span>
              <span className="phone-contact-copy">
                <span className="phone-contact-country">{country}</span>
                <span className="phone-contact-number">{phone.display}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
