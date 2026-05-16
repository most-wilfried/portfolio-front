import { useEffect, useMemo, useRef, useState } from 'react';
import { FaSave, FaSignOutAlt, FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import {
  clearAuthToken,
  createResource,
  deleteResource,
  fetchCertifications,
  fetchExperiences,
  fetchMessages,
  fetchProfile,
  fetchProjects,
  fetchSkills,
  getMe,
  getAuthToken,
  login,
  logout,
  updateProfile,
  updateResource,
  setAuthToken,
  fetchResource,
} from '../services/api';

const sections = ['profile', 'skills', 'projects', 'experiences', 'certifications', 'messages'];

const sectionLabels = {
  profile: 'Profil',
  skills: 'Compétences',
  projects: 'Projets',
  experiences: 'Expériences',
  certifications: 'Certifications',
  messages: 'Messages',
};

const skillCategories = [
  'Frontend',
  'Backend',
  'Frameworks',
  'Mobile',
  'IoT / Électronique',
  'Base de données',
  'Outils',
];

function toDateInput(value) {
  if (!value) {
    return '';
  }

  return String(value).slice(0, 10);
}

function formatItem(resource, item) {
  if (resource === 'projects') {
    return {
      ...item,
      technologies: item.technologies?.join(', ') || '',
      image: null,
      images: null,
    };
  }
  if (resource === 'certifications') {
    return {
      ...item,
      date: toDateInput(item.date),
      file: null,
    };
  }
  if (resource === 'experiences') {
    return {
      ...item,
      start_date: toDateInput(item.start_date),
      end_date: toDateInput(item.end_date),
    };
  }
  if (resource === 'skills') {
    return {
      ...item,
      percentage: item.percentage ?? 70,
      display_order: item.display_order ?? 0,
      is_active: item.is_active ?? true,
    };
  }
  return item;
}

function initialForm(resource) {
  switch (resource) {
    case 'profile':
      return {
        full_name: '',
        age: '',
        professional_title: '',
        location: '',
        short_description: '',
        about_intro: '',
        journey: '',
        goals: '',
        github_url: '',
        linkedin_url: '',
        whatsapp_number: '',
        email: '',
        phone: '',
        avatar: null,
        avatar_url: null,
        cv: null,
        cv_url: null,
      };
    case 'skills':
      return { name: '', category: 'Frontend', icon: '', percentage: 70, display_order: 0, is_active: true };
    case 'projects':
      return {
        title: '',
        description: '',
        category: 'Web',
        project_type: 'personnel',
        year: new Date().getFullYear(),
        status: 'terminé',
        technologies: '',
        github_url: '',
        demo_url: '',
        image: null,
        images: null,
      };
    case 'experiences':
      return { company: '', position: '', location: '', start_date: '', end_date: '', description: '' };
    case 'certifications':
      return { title: '', issuer: '', date: '', url: '', file: null, description: '' };
    default:
      return {};
  }
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('profile');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm('profile'));
  const [message, setMessage] = useState('');
  const sectionRef = useRef(section);

  const apiMap = useMemo(
    () => ({
      skills: {
        fetch: () => fetchSkills({ includeInactive: true }),
        path: '/skills',
      },
      projects: {
        fetch: fetchProjects,
        path: '/projects',
      },
      experiences: {
        fetch: fetchExperiences,
        path: '/experiences',
      },
      certifications: {
        fetch: fetchCertifications,
        path: '/certifications',
      },
      messages: {
        fetch: fetchMessages,
        path: '/messages',
      },
    }),
    [],
  );

  useEffect(() => {
    // Désactiver toute connexion automatique côté client pour raisons de sécurité
    // (l'administrateur doit saisir ses identifiants manuellement)
    clearAuthToken();
    setUser(null);
  }, []);

  useEffect(() => {
    sectionRef.current = section;
    if (!user) {
      return;
    }
    if (section === 'profile') {
      loadProfile();
    } else {
      loadItems(section);
    }
  // loadProfile/loadItems depend on the active section and are intentionally called from this effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, section]);

  const loadProfile = async () => {
    try {
      const data = await fetchProfile();
      setForm({ ...initialForm('profile'), ...data, avatar: null });
      setItems([]);
      setSelected(null);
    } catch {
      setMessage('Erreur de chargement du profil.');
    }
  };

  const loadItems = async (targetSection = section) => {
    try {
      const data = await apiMap[targetSection].fetch();
      if (sectionRef.current !== targetSection) {
        return;
      }
      setItems(data.map((item) => formatItem(targetSection, item)));
    } catch {
      setMessage('Erreur de chargement des données.');
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await login(email, password);
      setAuthToken(response.token);
      const currentUser = await getMe();
      setUser(currentUser);
      setMessage('Connecté.');
    } catch (error) {
      const message =
        error?.message ||
        error?.errors?.email?.[0] ||
        error?.errors?.password?.[0] ||
        'Identifiants invalides.';
      setMessage(message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuthToken();
      setUser(null);
      setItems([]);
      setSelected(null);
      setForm(initialForm('skills'));
    }
  };

  const selectSection = (target) => {
    setSection(target);
    sectionRef.current = target;
    setItems([]);
    setSelected(null);
    setForm(initialForm(target));
    setMessage('');
  };

  const handleSelectItem = (item) => {
    // Récupérer les données complètes côté serveur (pour notamment charger la galerie)
    (async () => {
      try {
        if (apiMap[section]) {
          const detail = await fetchResource(`${apiMap[section].path}/${item.id}`);
          setSelected(detail);
          setForm(formatItem(section, detail));
        } else {
          setSelected(item);
          setForm(formatItem(section, item));
        }
        setMessage('');
      } catch (err) {
        setMessage('Impossible de charger l\'élément.');
      }
    })();
  };

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  const handleDelete = async (item) => {
    if (!window.confirm('Supprimer cet élément ?')) {
      return;
    }
    try {
      await deleteResource(`${apiMap[section].path}/${item.id}`);
      setMessage('Élément supprimé.');
      loadItems();
      setSelected(null);
      setForm(initialForm(section));
    } catch {
      setMessage('Erreur lors de la suppression.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Sauvegarde en cours...');

    try {
      let payload = form;
      if (section === 'profile') {
        const formData = new FormData();
        formData.append('full_name', form.full_name);
        formData.append('age', form.age || '');
        formData.append('professional_title', form.professional_title);
        formData.append('location', form.location || '');
        formData.append('short_description', form.short_description || '');
        formData.append('about_intro', form.about_intro || '');
        formData.append('journey', form.journey || '');
        formData.append('goals', form.goals || '');
        formData.append('github_url', form.github_url || '');
        formData.append('linkedin_url', form.linkedin_url || '');
        formData.append('whatsapp_number', form.whatsapp_number || '');
        formData.append('email', form.email || '');
        formData.append('phone', form.phone || '');
        if (form.avatar instanceof File) {
          formData.append('avatar', form.avatar);
        }
        if (form.cv instanceof File) {
          formData.append('cv', form.cv);
        }
        await updateProfile(formData);
        setMessage('Profil mis à jour.');
        loadProfile();
        return;
      }
      if (section === 'projects') {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('category', form.category);
        formData.append('project_type', form.project_type);
        formData.append('year', form.year || '');
        formData.append('status', form.status);
        formData.append('technologies', form.technologies);
        formData.append('github_url', form.github_url);
        formData.append('demo_url', form.demo_url);
        if (form.image instanceof File) {
          formData.append('image', form.image);
        }
        if (form.images instanceof FileList) {
          Array.from(form.images).forEach((file) => formData.append('images[]', file));
        }
        payload = formData;
      }
      if (section === 'certifications') {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('issuer', form.issuer);
        formData.append('date', form.date);
        formData.append('url', form.url);
        formData.append('description', form.description);
        if (form.file instanceof File) {
          formData.append('file', form.file);
        }
        payload = formData;
      }

      if (selected) {
        await updateResource(`${apiMap[section].path}/${selected.id}`, payload);
        setMessage('Mise à jour réussie.');
      } else {
        await createResource(apiMap[section].path, payload instanceof FormData ? payload : payload);
        setMessage('Création réussie.');
      }

      loadItems();
      setSelected(null);
      setForm(initialForm(section));
    } catch (error) {
      setMessage(error?.message || 'Erreur lors de l’enregistrement.');
    }
  };

  if (!user) {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <h1>Admin Portfolio</h1>
          <AdminLogin onLogin={handleLogin} message={message} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>Administrateur</strong>
          <button className="button button-secondary" onClick={handleLogout}>
            <FaSignOutAlt /> Déconnexion
          </button>
        </div>
        <nav>
          {sections.map((item) => (
            <button
              key={item}
              className={section === item ? 'nav-link active' : 'nav-link'}
              onClick={() => selectSection(item)}
            >
              {sectionLabels[item]}
            </button>
          ))}
        </nav>
      </aside>
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>Gestion : {sectionLabels[section]}</h1>
            <p>
              {section === 'profile'
                ? 'Renseigner les informations qui apparaissent sur la page publique.'
                : section === 'messages'
                ? 'Consulter les messages reçus depuis le formulaire de contact.'
                : 'Modifier, ajouter ou supprimer les éléments du site public.'}
            </p>
          </div>
        </header>
        <section className="admin-panel">
          <div className="admin-list">
            <div className="admin-list-header">
              <h2>Éléments</h2>
              {section !== 'messages' && section !== 'profile' ? (
                <button
                  className="button button-primary"
                  onClick={() => {
                    setSelected(null);
                    setForm(initialForm(section));
                  }}
                >
                  <FaPlus /> Nouveau
                </button>
              ) : null}
            </div>
            <div className="admin-items">
              {section === 'profile' ? (
                <p className="empty-state">Photo, nom, titre et liens sociaux.</p>
              ) : items.length === 0 ? (
                <p className="empty-state">Aucun élément trouvé.</p>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    className={selected?.id === item.id ? 'resource-item active' : 'resource-item'}
                    onClick={() => handleSelectItem(item)}
                  >
                    <strong>{item.title || item.name || item.position || item.subject || item.issuer}</strong>
                    {section === 'messages' ? <span>{item.email}</span> : null}
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="admin-form-card">
            {section === 'profile' ? (
              <>
                <h2>Profil public</h2>
                <form onSubmit={handleSubmit} className="admin-form profile-form">
                  <div className="profile-upload-zone">
                    {form.avatar_url ? <img className="profile-preview" src={form.avatar_url} alt="Photo de profil actuelle" /> : <div className="profile-preview profile-preview-empty">Photo</div>}
                    <label>
                      Photo de profil
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setForm({ ...form, avatar: e.target.files?.[0] ?? null })}
                      />
                    </label>
                  </div>
                  <label>
                    Nom complet
                    <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                  </label>
                  <label>
                    Âge
                    <input type="number" min="1" max="120" value={form.age || ''} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                  </label>
                  <label>
                    Titre professionnel
                    <input value={form.professional_title} onChange={(e) => setForm({ ...form, professional_title: e.target.value })} required />
                  </label>
                  <label>
                    Ville / pays
                    <input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </label>
                  <label className="full-width">
                    Courte description
                    <textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
                  </label>
                  <label className="full-width">
                    Présentation personnelle
                    <textarea value={form.about_intro} onChange={(e) => setForm({ ...form, about_intro: e.target.value })} />
                  </label>
                  <label className="full-width">
                    Parcours
                    <textarea value={form.journey} onChange={(e) => setForm({ ...form, journey: e.target.value })} />
                  </label>
                  <label className="full-width">
                    Objectifs professionnels
                    <textarea value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
                  </label>
                  <label>
                    GitHub URL
                    <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
                  </label>
                  <label>
                    LinkedIn URL
                    <input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
                  </label>
                  <label>
                    WhatsApp
                    <input value={form.whatsapp_number || ''} placeholder="Ex: 237699000000" onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
                  </label>
                  <label>
                    Email
                    <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </label>
                  <label>
                    Téléphone
                    <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </label>
                  <label>
                    CV
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setForm({ ...form, cv: e.target.files?.[0] ?? null })}
                    />
                  </label>
                  {form.cv_url ? <a className="cv-link" href={form.cv_url} target="_blank" rel="noreferrer">CV actuel</a> : null}
                  <div className="admin-form-actions">
                    <button type="submit" className="button button-primary">
                      <FaSave /> Enregistrer le profil
                    </button>
                  </div>
                  {message ? <p className="form-status">{message}</p> : null}
                </form>
              </>
            ) : section === 'messages' ? (
              <div className="message-view">
                <h2>{selected ? selected.subject : 'Sélectionner un message'}</h2>
                {selected ? (
                  <>
                    <p><strong>Nom :</strong> {selected.name}</p>
                    <p><strong>Email :</strong> <a href={`mailto:${selected.email}`}>{selected.email}</a></p>
                    <p><strong>Date :</strong> {new Date(selected.created_at).toLocaleString('fr-FR')}</p>
                    <p className="message-body">{selected.message}</p>
                    <button type="button" className="button button-danger" onClick={() => handleDelete(selected)}>
                      <FaTrash /> Supprimer
                    </button>
                  </>
                ) : (
                  <p className="empty-state">Choisis un message dans la liste.</p>
                )}
                {message ? <p className="form-status">{message}</p> : null}
              </div>
            ) : (
            <>
              <h2>{selected ? 'Modifier' : 'Ajouter'} un élément</h2>
              <form onSubmit={handleSubmit} className="admin-form">
              {section === 'skills' && (
                <>
                  <label>
                    Nom
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Catégorie
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {skillCategories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Icône personnalisée
                    <input
                      value={form.icon || ''}
                      placeholder="Optionnel, ex: react"
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    />
                  </label>
                  <label>
                    Pourcentage de maîtrise
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.percentage}
                      onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Ordre d’affichage
                    <input
                      type="number"
                      min="0"
                      max="9999"
                      value={form.display_order}
                      onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                    />
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={Boolean(form.is_active)}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    Afficher cette compétence
                  </label>
                </>
              )}

              {section === 'projects' && (
                <>
                  <label>
                    Titre
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Catégorie du projet
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Type de projet
                    <select value={form.project_type || 'personnel'} onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
                      <option value="académique">Académique</option>
                      <option value="personnel">Personnel</option>
                      <option value="professionnel">Professionnel</option>
                    </select>
                  </label>
                  <label>
                    Année
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={form.year || ''}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                    />
                  </label>
                  <label>
                    Statut
                    <select value={form.status || 'terminé'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="terminé">Terminé</option>
                      <option value="en cours">En cours</option>
                    </select>
                  </label>
                  <label>
                    Technologies (séparées par des virgules)
                    <input
                      value={form.technologies}
                      onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                    />
                  </label>
                  <label>
                    GitHub URL
                    <input
                      value={form.github_url}
                      onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    />
                  </label>
                  <label>
                    Démo URL
                    <input
                      value={form.demo_url}
                      onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                    />
                  </label>
                  <label>
                    Image de projet
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })}
                    />
                  </label>
                  <label>
                    Images supplémentaires
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setForm({ ...form, images: e.target.files ?? null })}
                    />
                  </label>
                  {form.image_url || form.gallery_images?.length ? (
                    <div className="project-admin-preview full-width">
                      {form.image_url ? (
                        <a href={form.image_url} target="_blank" rel="noreferrer">Voir l’image principale</a>
                      ) : null}
                      {form.gallery_images?.map((image, index) => (
                        <a key={image.id || image.url} href={image.url} target="_blank" rel="noreferrer">
                          Voir image {index + 1}
                        </a>
                      ))}
                      <div style={{marginTop:8}}>
                        <button
                          type="button"
                          className="button button-link"
                          onClick={() => {
                            setGalleryImages([...(form.image_url ? [{ url: form.image_url }] : []), ...(form.gallery_images || [])]);
                            setGalleryOpen(true);
                          }}
                        >
                          <FaEye /> Voir la galerie
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {section === 'experiences' && (
                <>
                  <label>
                    Entreprise
                    <input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Poste
                    <input
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Lieu
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </label>
                  <label>
                    Date de début
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Date de fin
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                  </label>
                  <label className="full-width">
                    Description
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </label>
                </>
              )}

              {section === 'certifications' && (
                <>
                  <label>
                    Titre
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Organisme / plateforme
                    <input
                      value={form.issuer}
                      placeholder="Ex: Google, Cisco, Coursera, Udemy, OpenClassrooms"
                      onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                      required
                    />
                    <span className="field-hint">
                      Nom de l’école, entreprise ou plateforme qui a délivré la certification.
                    </span>
                  </label>
                  <label>
                    Date
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    URL
                    <input
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                    />
                  </label>
                  <label>
                    Image ou fichier PDF
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
                    />
                  </label>
                  <label className="full-width">
                    Description
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </label>
                </>
              )}

              <div className="admin-form-actions">
                <button type="submit" className="button button-primary">
                  <FaSave /> {selected ? 'Mettre à jour' : 'Créer'}
                </button>
                {selected ? (
                  <button type="button" className="button button-danger" onClick={() => handleDelete(selected)}>
                    <FaTrash /> Supprimer
                  </button>
                ) : null}
              </div>
              {message ? <p className="form-status">{message}</p> : null}
            </form>
            </>
            )}
          </div>
        </section>
      </main>
      {galleryOpen && (
        <div className="gallery-modal">
          <div className="gallery-backdrop" onClick={() => setGalleryOpen(false)} />
          <div className="gallery-panel">
            <div className="gallery-header">
              <button type="button" className="button button-link" onClick={() => setGalleryOpen(false)}>Fermer</button>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="gallery-item">
                  <img src={img.url} alt={`Image ${idx + 1}`} style={{maxWidth:'100%',borderRadius:8}} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLogin({ onLogin, message }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="login-form"
      autoComplete="off"
      onSubmit={(event) => {
        event.preventDefault();
        onLogin(credentials.email, credentials.password);
      }}
    >
      <label>
        Email
        <input
          type="email"
          name="admin_email"
          autoComplete="off"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          required
        />
      </label>
      <label>
        Mot de passe
        <span className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            name="admin_password"
            autoComplete="new-password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </span>
      </label>
      <button type="submit" className="button button-primary">
        Se connecter
      </button>
      {message ? <p className="form-status">{message}</p> : null}
    </form>
  );
}
