'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Image from 'next/image';

const LADDERS = [
  { mode: '1v1', label: 'Solo', size: 1 },
  { mode: '2v2', label: 'Duo', size: 2 },
  { mode: '3v3', label: 'Trio', size: 3 },
  { mode: '4v4', label: 'Squad', size: 4 },
  { mode: '5v5', label: 'Team', size: 5 },
];


function ProfileInput({ value, userId, field, label, onSave, gold, dark, border, muted, placeholder }: any) {
  const [val, setVal] = useState(value);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await supabase.from('profiles').update({ [field]: val }).eq('id', userId);
    await onSave(userId);
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder={placeholder || ''}
        style={{ flex: 1, background: dark, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px' }}
      />
      <button onClick={save} disabled={saving} style={{ background: gold, color: dark, border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
        {saving ? '...' : label}
      </button>
    </div>
  );
}

function ImageUpload({ userId, bucket, field, label, onSave, gold, dark, border, muted }: any) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');

  async function handleUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${userId}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase.from('profiles').update({ [field]: url }).eq('id', userId);
      setPreview(url);
      await onSave(userId);
    }
    setUploading(false);
  }

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: dark, border: `1px solid ${border}`, borderRadius: '6px', padding: '10px 14px', cursor: 'pointer' }}>
        <span style={{ fontSize: '13px', color: uploading ? muted : '#e2e8f0', flex: 1 }}>
          {uploading ? 'Upload en cours...' : `Choisir une image`}
        </span>
        <span style={{ background: gold, color: dark, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '4px' }}>
          {uploading ? '...' : 'Parcourir'}
        </span>
        <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
      </label>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('ladders');
  const [activeLadder, setActiveLadder] = useState('1v1');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      setShowAuth(false);
      if (session?.user) {
        const discordUsername = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
        const avatarUrl = session.user.user_metadata?.avatar_url;
        if (discordUsername) {
          await supabase.from('profiles').update({ discord_username: discordUsername, avatar_url: avatarUrl }).eq('id', session.user.id);
        }
        fetchProfile(session.user.id);
      }
    });
    fetchData();
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  }

  async function fetchData() {
    setLoading(true);
    const { data: m } = await supabase.from('matches').select('*, team_a:team_a_id(name), team_b:team_b_id(name)').order('created_at', { ascending: false });
    const { data: lb } = await supabase.from('leaderboard').select('*').limit(10);
    setMatches(m || []);
    setLeaderboard(lb || []);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const liveMatches = matches.filter(m => m.status === 'live');
  const completedMatches = matches.filter(m => m.status === 'completed');

  const gold = '#c9a227';
  const goldBg = 'rgba(201,162,39,0.1)';
  const goldBorder = 'rgba(201,162,39,0.3)';
  const dark = '#0a0a0a';
  const card = '#0f0f0f';
  const border = '#1a1a1a';
  const muted = '#555';
  const light = '#e2e8f0';

  const navBtn = (active: boolean) => ({
    background: active ? goldBg : 'none',
    color: active ? gold : '#666',
    border: 'none', fontSize: '11px', fontWeight: 700,
    letterSpacing: '1.5px', textTransform: 'uppercase' as const,
    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer'
  });

  const ladderCard = (active: boolean) => ({
    background: active ? goldBg : card,
    border: `1px solid ${active ? gold : border}`,
    borderRadius: '8px', padding: '14px 10px',
    textAlign: 'center' as const, cursor: 'pointer'
  });

  const panel = {
    background: card, border: `1px solid ${border}`,
    borderRadius: '8px', overflow: 'hidden', marginBottom: '12px'
  };

  const panelTitle = {
    fontSize: '10px', fontWeight: 700, letterSpacing: '2px',
    textTransform: 'uppercase' as const, color: muted,
    padding: '10px 14px', borderBottom: `1px solid ${border}`
  };

  const lbRow = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderBottom: `1px solid #111`
  };

  return (
    <div style={{ background: dark, minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', color: light }}>

      {showAuth && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: card, border: `1px solid ${gold}`, borderRadius: '16px', padding: '32px', width: '400px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
              <button onClick={() => setShowAuth(false)} style={{ position: 'absolute', right: 0, top: 0, background: 'none', border: 'none', color: muted, fontSize: '20px', cursor: 'pointer' }}>x</button>
              <Image src="/images/Logo_Png_CL.png" alt="COD Ladders" width={140} height={60} style={{ objectFit: 'contain' }} />
            </div>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: gold, brandAccent: '#a07d1a' } } } }}
              providers={['discord']}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Adresse email',
                    password_label: 'Mot de passe',
                    button_label: 'Se connecter',
                    link_text: 'Vous avez deja un compte ? Connectez-vous',
                    email_input_placeholder: 'Votre adresse email',
                    password_input_placeholder: 'Votre mot de passe',
                  },
                  sign_up: {
                    email_label: 'Adresse email',
                    password_label: 'Mot de passe',
                    button_label: "S'inscrire",
                    link_text: 'Pas encore de compte ? Inscrivez-vous',
                    email_input_placeholder: 'Votre adresse email',
                    password_input_placeholder: 'Choisissez un mot de passe',
                    confirmation_text: 'Verifiez votre email pour confirmer votre inscription',
                  },
                  forgotten_password: {
                    link_text: 'Mot de passe oublie ?',
                    button_label: 'Envoyer le lien de reinitialisation',
                    email_label: 'Adresse email',
                    email_input_placeholder: 'Votre adresse email',
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ background: '#0f0f0f', borderBottom: `2px solid ${gold}`, padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Image src="/images/Logo_Png_CL.png" alt="COD Ladders" width={90} height={60} style={{ objectFit: 'contain', cursor: 'pointer' }} onClick={() => setActiveTab('ladders')} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {['ladders', 'tournois', 'classement'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={navBtn(activeTab === tab)}>{tab}</button>
          ))}
          {user && <button onClick={() => setActiveTab('profil')} style={navBtn(activeTab === 'profil')}>Profil</button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <div style={{ fontSize: '12px', color: muted }}>{profile?.username || user.email}</div>
              <button onClick={handleSignOut} style={{ background: 'transparent', color: muted, border: `1px solid ${border}`, padding: '7px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
                Deconnexion
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ background: gold, color: dark, border: 'none', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' as const, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
              Se connecter
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: dark, padding: '32px 24px 24px', textAlign: 'center', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: gold, background: goldBg, border: `1px solid ${goldBorder}`, padding: '4px 14px', borderRadius: '20px', marginBottom: '14px' }}>
          Call of Duty Black Ops 7
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
          Domine la <span style={{ color: gold }}>comp&eacute;tition</span>
        </h1>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Ladders 1v1 &mdash; 5v5 &middot; Classements en temps r&eacute;el</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => setActiveTab('ladders')} style={{ background: gold, color: dark, border: 'none', padding: '10px 22px', borderRadius: '6px', fontWeight: 800, fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
            Rejoindre un ladder
          </button>
          <button onClick={() => setActiveTab('classement')} style={{ background: 'transparent', color: '#888', border: `1px solid ${border}`, padding: '10px 22px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
            Voir le classement
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* LADDERS */}
        {activeTab === 'ladders' && (
          <>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: muted, marginBottom: '14px' }}>Choisir un mode</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px' }}>
              {LADDERS.map(l => (
                <div key={l.mode} onClick={() => setActiveLadder(l.mode)} style={ladderCard(activeLadder === l.mode)}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: gold, marginBottom: '4px' }}>{l.mode}</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, color: muted }}>{l.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: muted, marginBottom: '14px' }}>
                  Matchs en cours &mdash; {activeLadder}
                </div>
                {loading ? (
                  <div style={{ color: muted, padding: '40px', textAlign: 'center' }}>Chargement...</div>
                ) : liveMatches.length === 0 ? (
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '8px', padding: '40px', textAlign: 'center', color: muted }}>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>Aucun match en cours</div>
                    <div style={{ fontSize: '12px' }}>Rejoins le ladder pour d&eacute;fier un adversaire</div>
                  </div>
                ) : liveMatches.map((m, i) => (
                  <div key={i} style={{ background: card, border: `1px solid ${goldBorder}`, borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: gold, display: 'flex', alignItems: 'center', gap: '4px', minWidth: '50px' }}>
                      <div style={{ width: '6px', height: '6px', background: gold, borderRadius: '50%' }} />LIVE
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: gold }}>{m.team_a?.name || 'TBD'}</div>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: gold }}>{m.score_a}</div>
                      <div style={{ fontSize: '11px', color: '#444', fontWeight: 700 }}>—</div>
                      <div style={{ fontSize: '15px', fontWeight: 900 }}>{m.score_b}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{m.team_b?.name || 'TBD'}</div>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', background: goldBg, color: gold, padding: '3px 8px', borderRadius: '4px' }}>{activeLadder}</div>
                  </div>
                ))}

                {completedMatches.length > 0 && (
                  <>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: muted, margin: '20px 0 14px' }}>
                      Historique des matchs
                    </div>
                    {completedMatches.slice(0, 5).map((m, i) => (
                      <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', color: muted, minWidth: '60px' }}>
                          {m.ended_at ? new Date(m.ended_at).toLocaleDateString('fr-FR') : 'Termin&eacute;'}
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: m.winner_id === m.team_a_id ? gold : light }}>{m.team_a?.name || 'TBD'}</div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: m.winner_id === m.team_a_id ? gold : light }}>{m.score_a}</div>
                          <div style={{ fontSize: '11px', color: '#444' }}>—</div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: m.winner_id === m.team_b_id ? gold : light }}>{m.score_b}</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: m.winner_id === m.team_b_id ? gold : light }}>{m.team_b?.name || 'TBD'}</div>
                        </div>
                        <div style={{ fontSize: '10px', color: muted }}>Termin&eacute;</div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div>
                <div style={panel}>
                  <div style={panelTitle}>Top {activeLadder}</div>
                  {leaderboard.length === 0 ? (
                    <div style={{ padding: '20px', fontSize: '12px', color: muted, textAlign: 'center' }}>Aucun joueur encore</div>
                  ) : leaderboard.slice(0, 5).map((p, i) => (
                    <div key={i} style={lbRow}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: i === 0 ? gold : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : muted, width: '18px', textAlign: 'center' }}>{i + 1}</div>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: gold }}>{p.username?.[0]?.toUpperCase()}</div>
                      <div style={{ flex: 1, fontSize: '13px', fontWeight: 600 }}>{p.username}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: gold }}>{p.total_points || 0}</div>
                    </div>
                  ))}
                </div>

                <div style={panel}>
                  <div style={panelTitle}>Stats</div>
                  <div style={lbRow}>
                    <div style={{ flex: 1, fontSize: '12px', color: muted }}>Matchs jou&eacute;s</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: gold }}>{matches.length}</div>
                  </div>
                  <div style={lbRow}>
                    <div style={{ flex: 1, fontSize: '12px', color: muted }}>En direct</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: gold }}>{liveMatches.length}</div>
                  </div>
                  <div style={lbRow}>
                    <div style={{ flex: 1, fontSize: '12px', color: muted }}>Joueurs class&eacute;s</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: gold }}>{leaderboard.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TOURNOIS */}
        {activeTab === 'tournois' && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: muted }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: gold, marginBottom: '8px', letterSpacing: '3px', textTransform: 'uppercase' as const }}>
              &Agrave; venir
            </div>
            <div style={{ fontSize: '14px', color: muted }}>Les tournois arrivent bient&ocirc;t. Reste connect&eacute;.</div>
          </div>
        )}

        {/* CLASSEMENT */}
        {activeTab === 'classement' && (
          <>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: muted, marginBottom: '14px' }}>Classement g&eacute;n&eacute;ral</div>
            {loading ? (
              <div style={{ color: muted, padding: '40px', textAlign: 'center' }}>Chargement...</div>
            ) : leaderboard.length === 0 ? (
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '8px', padding: '60px', textAlign: 'center', color: muted }}>
                Aucun joueur class&eacute; pour l&apos;instant
              </div>
            ) : (
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px', padding: '10px 16px', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: muted, borderBottom: `1px solid ${border}` }}>
                  <div>#</div><div>Joueur</div><div style={{ textAlign: 'center' }}>V</div><div style={{ textAlign: 'center' }}>D</div><div style={{ textAlign: 'center' }}>Pts</div>
                </div>
                {leaderboard.map((p, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px', padding: '12px 16px', borderBottom: `1px solid #111`, alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: i === 0 ? gold : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : muted }}>{i + 1}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: gold }}>{p.username?.[0]?.toUpperCase()}</div>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{p.username}</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: gold }}>{p.total_wins || 0}</div>
                    <div style={{ textAlign: 'center', fontSize: '13px', color: muted }}>{p.total_losses || 0}</div>
                    <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, color: gold }}>{p.total_points || 0}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* PROFIL */}
        {activeTab === 'profil' && user && (
          <>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: muted, marginBottom: '14px' }}>Mon profil</div>
            
            {/* BANNIERE */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '140px', background: profile?.banner_url ? `url(${profile.banner_url}) center/cover` : `linear-gradient(135deg, #1a1400, #2d2000, #1a1400)`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${gold}`, overflow: 'hidden', background: goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: gold, position: 'absolute', bottom: '-40px', left: '24px' }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile?.username || user.email)?.[0]?.toUpperCase()}
                </div>
              </div>
              <div style={{ padding: '50px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: light }}>{profile?.username || 'Joueur'}</div>
                  <div style={{ fontSize: '12px', color: muted, marginTop: '4px' }}>{user.email}</div>
                  {profile?.discord_username && (
                    <div style={{ fontSize: '12px', color: '#5865f2', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Discord:</span><span style={{ fontWeight: 700 }}>{profile.discord_username}</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                  <div style={{ background: goldBg, border: `1px solid ${goldBorder}`, borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: gold }}>{leaderboard.find(p => p.id === user.id)?.total_points || 0}</div>
                    <div style={{ fontSize: '10px', color: muted, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Points</div>
                  </div>
                  <div style={{ background: goldBg, border: `1px solid ${goldBorder}`, borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: gold }}>{leaderboard.find(p => p.id === user.id)?.total_wins || 0}</div>
                    <div style={{ fontSize: '10px', color: muted, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Victoires</div>
                  </div>
                  <div style={{ background: '#111', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: muted }}>{leaderboard.find(p => p.id === user.id)?.total_losses || 0}</div>
                    <div style={{ fontSize: '10px', color: muted, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>D&eacute;faites</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
              
              {/* PARAMETRES */}
              <div style={panel}>
                <div style={panelTitle}>Param&egrave;tres</div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: muted, marginBottom: '6px' }}>Nom d&apos;utilisateur</div>
                    <ProfileInput value={profile?.username || ''} userId={user.id} field="username" label="Sauvegarder" onSave={fetchProfile} gold={gold} dark={dark} border={border} muted={muted} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: muted, marginBottom: '6px' }}>Banni&egrave;re</div>
                    <ImageUpload userId={user.id} bucket="banners" field="banner_url" label="Changer la banniere" onSave={fetchProfile} gold={gold} dark={dark} border={border} muted={muted} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: muted, marginBottom: '6px' }}>Avatar</div>
                    <ImageUpload userId={user.id} bucket="avatars" field="avatar_url" label="Changer l avatar" onSave={fetchProfile} gold={gold} dark={dark} border={border} muted={muted} />
                  </div>
                  <div style={{ borderTop: `1px solid ${border}`, paddingTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: muted, marginBottom: '8px' }}>Discord</div>
                    {profile?.discord_username ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.3)', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '13px', color: '#5865f2', fontWeight: 700 }}>{profile.discord_username}</div>
                        <div style={{ fontSize: '10px', color: '#5865f2', background: 'rgba(88,101,242,0.2)', padding: '2px 8px', borderRadius: '4px' }}>Li&eacute;</div>
                      </div>
                    ) : (
                      <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: window.location.origin } })} style={{ width: '100%', background: '#5865f2', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', letterSpacing: '1px' }}>
                        Lier mon Discord
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* HISTORIQUE */}
              <div style={panel}>
                <div style={panelTitle}>Historique des matchs</div>
                {completedMatches.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: muted, fontSize: '13px' }}>
                    Aucun match jou&eacute; pour l&apos;instant
                  </div>
                ) : completedMatches.slice(0, 10).map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderBottom: `1px solid #111` }}>
                    <div style={{ fontSize: '11px', color: muted, minWidth: '80px' }}>
                      {m.ended_at ? new Date(m.ended_at).toLocaleDateString('fr-FR') : '-'}
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: m.winner_id === m.team_a_id ? gold : light }}>{m.team_a?.name || 'TBD'}</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: m.winner_id === m.team_a_id ? gold : light }}>{m.score_a}</span>
                      <span style={{ color: '#444' }}>—</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: m.winner_id === m.team_b_id ? gold : light }}>{m.score_b}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: m.winner_id === m.team_b_id ? gold : light }}>{m.team_b?.name || 'TBD'}</span>
                    </div>
                    <div style={{ fontSize: '10px', background: goldBg, color: gold, padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Termin&eacute;</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}