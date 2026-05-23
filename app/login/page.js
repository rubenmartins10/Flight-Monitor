'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    let res, data = {};
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    e.target.email.value,
          password: e.target.password.value,
        }),
      });
      try { data = await res.json(); } catch {}
    } catch (fetchErr) {
      setError(fetchErr.message || 'Erro de rede.');
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError(data.error || 'Erro ao entrar.');
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.photoPanel} className="grain">
        <div style={styles.photoOverlay} />
        <div style={styles.photoBg} />
        <div style={styles.photoText}>
          <p style={styles.photoTagline}>Os melhores voos.<br />Ao melhor preco.</p>
        </div>
      </div>
      <div style={styles.formPanel}>
        <div style={styles.formWrap}>
          <div style={styles.wordmark}>Flight Monitor</div>
          <h1 style={styles.heading}>Entrar</h1>
          <p style={styles.sub}>Nao tens conta? <Link href="/register" style={styles.link}>Registar</Link></p>
          <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input className="input" type="email" name="email" placeholder="o_teu@email.com" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input className="input" type="password" name="password" placeholder="••••••••" required />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button className="btn" type="submit" disabled={loading}
              style={{ width: '100%', marginTop: 24, padding: '14px 0' }}>
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { display: 'flex', minHeight: '100vh', background: '#080808' },
  photoPanel: { flex: 1, position: 'relative', overflow: 'hidden' },
  photoBg: {
    position: 'absolute', inset: 0,
    backgroundImage: `url('https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=1600')`,
    backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'brightness(0.45) saturate(0.7)', transform: 'scale(1.03)',
  },
  photoOverlay: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.6) 100%)',
    zIndex: 1, pointerEvents: 'none',
  },
  photoText: { position: 'absolute', bottom: 56, left: 48, zIndex: 2 },
  photoTagline: {
    fontFamily: 'var(--font-display), Georgia, serif',
    fontSize: '2.2rem', fontWeight: 300, color: '#f0ece4',
    lineHeight: 1.25, letterSpacing: '.02em',
  },
  formPanel: {
    width: '100%', maxWidth: 480, margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px',
  },
  formWrap: { width: '100%', maxWidth: 360 },
  wordmark: {
    fontFamily: 'var(--font-display), Georgia, serif',
    fontSize: '.95rem', letterSpacing: '.2em', textTransform: 'uppercase',
    color: '#555', marginBottom: 48,
  },
  heading: {
    fontFamily: 'var(--font-display), Georgia, serif',
    fontSize: '2.4rem', fontWeight: 300, letterSpacing: '.04em', lineHeight: 1,
  },
  sub: { fontSize: '.72rem', color: '#555', marginTop: 8, letterSpacing: '.04em' },
  link: { color: '#f0ece4', textDecoration: 'none', borderBottom: '1px solid #333' },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#555', marginBottom: 6 },
  error: { fontSize: '.72rem', color: '#9b2335', marginTop: 12, letterSpacing: '.04em' },
};