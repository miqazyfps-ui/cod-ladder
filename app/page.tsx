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
  { mode: '6v6', label: 'Team+', size: 6 },
];

const LADDER_GROUPS = [
  { id: 'cage', name: 'Match en cage', modes: ['1v1'], icon: '🎯', desc: 'Solo - Le meilleur gagne' },
  { id: 'duo', name: 'Duo', modes: ['2v2'], icon: '👥', desc: '2 contre 2' },
  { id: 'squad', name: 'Escouade', modes: ['3v3', '4v4'], icon: '💪', desc: '3v3 et 4v4 reunis' },
  { id: 'team', name: 'Team', modes: ['5v5', '6v6'], icon: '🏆', desc: '5v5 et 6v6 reunis' },
];



function AdminMatchForm({ onCreate, gold, dark, border, muted }: any) {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [mode, setMode] = useState('1v1');
  const [creating, setCreating] = useState(false);

  async function handle() {
    if (!teamA || !teamB) return;
    setCreating(true);
    await onCreate(teamA, teamB, mode);
    setTeamA('');
    setTeamB('');
    setCreating(false);
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '11px', color: muted, marginBottom: '4px' }}>Equipe A</div>
          <input value={teamA} onChange={e => setTeamA(e.target.value)} placeholder="Nom equipe A" style={{ width: '100%', background: dark, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px' }} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: muted, marginBottom: '4px' }}>Equipe B</div>
          <input value={teamB} onChange={e => setTeamB(e.target.value)} placeholder="Nom equipe B" style={{ width: '100%', background: dark, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px' }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '11px', color: muted, marginBottom: '4px' }}>Mode</div>
        <select value={mode} onChange={e => setMode(e.target.value)} style={{ width: '100%', background: dark, border: `1px solid ${border}`, borderRadius: '6px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px' }}>
          {['1v1','2v2','3v3','4v4','5v5'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <button onClick={handle} disabled={creating || !teamA || !teamB} style={{ background: gold, color: dark, border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
        {creating ? 'Creation...' : 'Creer le match'}
      </button>
    </div>
  );
}

function AdminScoreForm({ match, onUpdate, onDelete, gold, dark, border, muted }: any) {
  const [scoreA, setScoreA] = useState(match.score_a || 0);
  const [scoreB, setScoreB] = useState(match.score_b || 0);
  const [saving, setSaving] = useState(false);

  async function finish(winnerId: string) {
    setSaving(true);
    await onUpdate(match.id, scoreA, scoreB, winnerId);
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="number" value={scoreA} onChange={e => setScoreA(parseInt(e.target.value))} style={{ width: '60px', background: dark, border: `1px solid ${border}`, borderRadius: '6px', padding: '6px 10px', color: gold, fontSize: '16px', fontWeight: 900, textAlign: 'center' as const }} />
        <span style={{ color: muted }}>—</span>
        <input type="number" value={scoreB} onChange={e => setScoreB(parseInt(e.target.value))} style={{ width: '60px', background: dark, border: `1px solid ${border}`, borderRadius: '6px', padding: '6px 10px', color: gold, fontSize: '16px', fontWeight: 900, textAlign: 'center' as const }} />
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
        <button onClick={() => finish(match.team_a_id)} disabled={saving} style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', color: '#00e5a0', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
          Victoire A
        </button>
        <button onClick={() => finish(match.team_b_id)} disabled={saving} style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', color: '#00e5a0', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
          Victoire B
        </button>
        <button onClick={() => onDelete(match.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
          Supprimer
        </button>
      </div>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState('accueil');
  const [activeLadder, setActiveLadder] = useState('1v1');
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('matchs');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showBanMenu, setShowBanMenu] = useState(false);
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
    if (data?.is_admin) {
      setIsAdmin(true);
      fetchAllUsers();
    }
  }

  async function fetchAllUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setAllUsers(data || []);
  }

  async function createMatch(teamAName: string, teamBName: string, mode: string) {
    const { data: teamA } = await supabase.from('teams').insert({ name: teamAName, tournament_id: '00000000-0000-0000-0000-000000000000', captain_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    const { data: teamB } = await supabase.from('teams').insert({ name: teamBName, tournament_id: '00000000-0000-0000-0000-000000000000', captain_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (teamA && teamB) {
      await supabase.from('matches').insert({ team_a_id: teamA.id, team_b_id: teamB.id, round: 1, match_number: 1, status: 'live', tournament_id: '00000000-0000-0000-0000-000000000000' });
      fetchData();
    }
  }

  async function updateScore(matchId: string, scoreA: number, scoreB: number, winnerId: string) {
    await supabase.from('matches').update({ score_a: scoreA, score_b: scoreB, winner_id: winnerId, status: 'completed', ended_at: new Date().toISOString() }).eq('id', matchId);
    fetchData();
  }

  async function deleteMatch(matchId: string) {
    await supabase.from('matches').delete().eq('id', matchId);
    fetchData();
  }

  async function toggleAdmin(userId: string, currentVal: boolean) {
    await supabase.from('profiles').update({ is_admin: !currentVal }).eq('id', userId);
    fetchAllUsers();
  }

  async function banPlayer(userId: string, duration: string) {
    let bannedUntil = null;
    if (duration === '1h') bannedUntil = new Date(Date.now() + 3600000).toISOString();
    else if (duration === '24h') bannedUntil = new Date(Date.now() + 86400000).toISOString();
    else if (duration === '48h') bannedUntil = new Date(Date.now() + 172800000).toISOString();
    else if (duration === '7j') bannedUntil = new Date(Date.now() + 604800000).toISOString();
    else if (duration === 'permanent') bannedUntil = '2099-01-01T00:00:00.000Z';
    await supabase.from('profiles').update({ is_banned: true, banned_until: bannedUntil }).eq('id', userId);
    setShowBanMenu(false);
    setSelectedPlayer(null);
    fetchAllUsers();
  }

  async function unbanPlayer(userId: string) {
    await supabase.from('profiles').update({ is_banned: false, banned_until: null }).eq('id', userId);
    fetchAllUsers();
  }

  function getBanStatus(user: any) {
    if (!user.is_banned) return null;
    if (user.banned_until === '2099-01-01T00:00:00.000Z') return 'Permanent';
    if (user.banned_until) {
      const remaining = new Date(user.banned_until).getTime() - Date.now();
      if (remaining <= 0) return null;
      const hours = Math.floor(remaining / 3600000);
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days}j restants`;
      return `${hours}h restantes`;
    }
    return 'Banni';
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

  const gold = '#00ff88';
  const goldBg = 'rgba(0,255,136,0.1)';
  const greenBorder = 'rgba(0,255,136,0.3)';
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
              <Image src="/images/Logo_Png_CL.png" alt="Clutch2Win" width={140} height={60} style={{ objectFit: 'contain' }} />
            </div>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#00ff88', brandAccent: '#00cc6a', inputBackground: '#1a1a1a', inputText: '#e2e8f0', inputPlaceholder: '#666', inputBorder: '#2a2a2a', inputBorderFocus: '#00ff88' } } } }}
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
        <Image src="/images/Logo_Png_CL.png" alt="Clutch2Win" width={90} height={60} style={{ objectFit: 'contain', cursor: 'pointer' }} onClick={() => setActiveTab('jeux')} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {['accueil', 'jeux', 'tournois', 'classement'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={navBtn(activeTab === tab)}>{tab}</button>
          ))}
          {user && <button onClick={() => setActiveTab('profil')} style={navBtn(activeTab === 'profil')}>Profil</button>}
          {isAdmin && <button onClick={() => setActiveTab('admin')} style={{...navBtn(activeTab === 'admin'), color: activeTab === 'admin' ? '#ef4444' : '#666', background: activeTab === 'admin' ? 'rgba(239,68,68,0.1)' : 'none'}}>Admin</button>}
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



      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>


        {/* ACCUEIL */}
        {activeTab === 'accueil' && (
          <>
            {/* HERO BANNIERE */}
            <div style={{ position: 'relative', height: '420px', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
              <img src="/images/banner_home.png" alt="Clutch2Win" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.2) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', padding: '0 48px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: gold, textTransform: 'uppercase' as const, marginBottom: '12px' }}>Plateforme Esport</div>
                <h1 style={{ fontSize: '52px', fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
                  Domine la<br/><span style={{ color: gold }}>comp&eacute;tition</span>
                </h1>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '28px', maxWidth: '480px' }}>
                  Ladders 1v1 &mdash; 6v6 &middot; Call of Duty &middot; FC 26 &middot; Classements en temps r&eacute;el
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { if (!user) { setShowAuth(true); } else { setActiveTab('jeux'); } }} style={{ background: gold, color: dark, border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
                    {user ? 'Jouer maintenant' : 'Rejoindre gratuitement'}
                  </button>
                  <button onClick={() => setActiveTab('classement')} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '14px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                    Voir le classement
                  </button>
                </div>
              </div>
            </div>

            {/* STATS EN DIRECT */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
              {[
                { label: 'Joueurs inscrits', value: leaderboard.length.toString(), icon: '👥' },
                { label: 'Matchs en cours', value: liveMatches.length.toString(), icon: '🔴' },
                { label: 'Matchs joués', value: matches.length.toString(), icon: '🏆' },
              ].map((stat, i) => (
                <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '32px' }}>{stat.icon}</div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: gold }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: muted, textTransform: 'uppercase' as const, letterSpacing: '1px', marginTop: '2px' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* TOP 3 JOUEURS */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: muted, marginBottom: '16px' }}>Top joueurs</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {leaderboard.slice(0, 3).map((p, i) => (
                  <div key={i} style={{ background: card, border: `1px solid ${i === 0 ? gold : border}`, borderRadius: '12px', padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    {i === 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gold }} />}
                    <div style={{ fontSize: i === 0 ? '28px' : '20px', marginBottom: '8px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: goldBg, border: `2px solid ${i === 0 ? gold : border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: gold, margin: '0 auto 12px', overflow: 'hidden' }}>
                      {p.avatar_url ? <img src={p.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: light, marginBottom: '4px' }}>{p.username}</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: gold }}>{p.total_points || 0} pts</div>
                    <div style={{ fontSize: '11px', color: muted, marginTop: '4px' }}>{p.total_wins || 0} victoires</div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: muted, background: card, borderRadius: '12px', border: `1px solid ${border}` }}>
                    Aucun joueur class&eacute; pour l&apos;instant
                  </div>
                )}
              </div>
            </div>

            {/* CALL TO ACTION */}
            <div style={{ position: 'relative', height: '260px', borderRadius: '16px', overflow: 'hidden' }}>
              <img src="/images/cta_home.png" alt="Rejoindre" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '10px' }}>
                  Pr&ecirc;t &agrave; dominer ?
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                  Cr&eacute;e ton compte gratuitement et commence &agrave; jouer
                </div>
                <button onClick={() => { if (!user) { setShowAuth(true); } else { setActiveTab('jeux'); } }} style={{ background: gold, color: dark, border: 'none', padding: '14px 36px', borderRadius: '8px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
                  {user ? 'Jouer maintenant' : 'Créer mon compte'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* LADDERS - ETAPE 1: Categorie */}
        {activeTab === 'jeux' && !selectedCategory && (
          <>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: muted, marginBottom: '20px' }}>S&eacute;lectionner une cat&eacute;gorie</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '500px' }}>
                {[
                  { id: 'hardcore', label: 'Hardcore', icon: '💀', color: '#ef4444' },
                  { id: 'normal', label: 'Normal', icon: '⚔️', color: gold },
                ].map(cat => (
                  <div key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    style={{ cursor: 'pointer', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '40px 20px', textAlign: 'center', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = cat.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>{cat.icon}</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: cat.color, letterSpacing: '2px', textTransform: 'uppercase' as const }}>{cat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* LADDERS - ETAPE 2: Jeu */}
        {activeTab === 'jeux' && selectedCategory && !selectedGame && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button onClick={() => setSelectedCategory('')} style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>← Retour</button>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: selectedCategory === 'hardcore' ? '#ef4444' : gold }}>
                {selectedCategory === 'hardcore' ? '💀 Hardcore' : '⚔️ Normal'} &mdash; S&eacute;lectionner un jeu
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div onClick={() => setSelectedGame('bo7')} style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${border}`, position: 'relative', height: '220px', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = gold)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
                <img src="/images/bo7.jpg" alt="Black Ops 7" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: gold, textTransform: 'uppercase' as const, marginBottom: '4px' }}>Call of Duty</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Black Ops 7</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' as const }}>
                    {['1v1', '2v2', '3v3', '4v4', '5v5', '6v6'].map(m => (
                      <span key={m} style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(0,255,136,0.2)', color: gold, padding: '3px 8px', borderRadius: '4px', border: `1px solid ${greenBorder}` }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: gold, color: dark, fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', letterSpacing: '1px' }}>ACTIF</div>
              </div>

              {/* FC 26 */}
              <div onClick={() => setSelectedGame('fc26')} style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${border}`, position: 'relative', height: '220px', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = gold)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
                <img src="/images/fc26.jpg" alt="FC 26" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: gold, textTransform: 'uppercase' as const, marginBottom: '4px' }}>EA Sports</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>FC 26</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' as const }}>
                    {['1v1', '2v2'].map(m => (
                      <span key={m} style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(0,255,136,0.2)', color: gold, padding: '3px 8px', borderRadius: '4px', border: `1px solid ${greenBorder}` }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: gold, color: dark, fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', letterSpacing: '1px' }}>ACTIF</div>
              </div>
            </div>
          </>
        )}

        {/* LADDERS - ETAPE 3: Groupe de mode */}
        {activeTab === 'jeux' && selectedGame && !selectedGroup && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button onClick={() => setSelectedGame('')} style={{ background: 'transparent', border: `1px solid ${border}`, color: muted, padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>← Retour</button>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: muted }}>Black Ops 7 &mdash; Choisir un mode</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '600px' }}>
                {LADDER_GROUPS.map(g => (
                  <div key={g.id} onClick={() => { setSelectedGroup(g.id); setActiveLadder(g.modes[0]); }}
                    style={{ cursor: 'pointer', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '32px 20px', textAlign: 'center', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = gold)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>{g.icon}</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: gold, marginBottom: '12px' }}>{g.name}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, justifyContent: 'center' }}>
                      {g.modes.map(m => (
                        <span key={m} style={{ fontSize: '11px', fontWeight: 700, background: goldBg, color: gold, padding: '4px 10px', borderRadius: '4px', border: `1px solid ${greenBorder}` }}>{m}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* LADDERS - ETAPE 4: Matchs et classement */}
        {activeTab === 'jeux' && selectedGame && selectedGroup && (
          <>
            {/* Bannière du jeu */}
            <div style={{ position: 'relative', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
              <img src={selectedGame === 'bo7' ? '/images/bo7.jpg' : '/images/fc26.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: '#00ff88', textTransform: 'uppercase' as const, marginBottom: '4px' }}>{selectedGame === 'bo7' ? 'Call of Duty' : 'EA Sports'}</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{selectedGame === 'bo7' ? 'Black Ops 7' : 'FC 26'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>{selectedCategory === 'hardcore' ? '💀 Hardcore' : '⚔️ Normal'} · {LADDER_GROUPS.find(g => g.id === selectedGroup)?.name}</div>
                </div>
                <button onClick={() => setSelectedGroup('')} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>← Retour</button>
              </div>
            </div>


            {/* Sous-modes + bouton rejoindre */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(LADDER_GROUPS.find(g => g.id === selectedGroup)?.modes.length || 0) > 1 && 
                  LADDER_GROUPS.find(g => g.id === selectedGroup)?.modes.map(m => (
                    <button key={m} onClick={() => setActiveLadder(m)} style={{ background: activeLadder === m ? goldBg : card, border: `1px solid ${activeLadder === m ? gold : border}`, color: activeLadder === m ? gold : muted, padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{m}</button>
                  ))
                }
              </div>
              <button onClick={() => { if (!user) { setShowAuth(true); } else { alert('Fonctionnalite bientot disponible !'); } }} style={{ background: gold, color: dark, border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' as const }}>
                Lancer un match
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: muted, marginBottom: '14px' }}>
                  Matchs en cours &mdash; {activeLadder} &mdash; Black Ops 7
                </div>
                {loading ? (
                  <div style={{ color: muted, padding: '40px', textAlign: 'center' }}>Chargement...</div>
                ) : liveMatches.length === 0 ? (
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '8px', padding: '40px', textAlign: 'center', color: muted }}>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>Aucun match en cours</div>
                    <div style={{ fontSize: '12px' }}>Rejoins le ladder pour d&eacute;fier un adversaire</div>
                  </div>
                ) : liveMatches.map((m, i) => (
                  <div key={i} style={{ background: card, border: `1px solid ${greenBorder}`, borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
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
                  <div style={{ background: goldBg, border: `1px solid ${greenBorder}`, borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: gold }}>{leaderboard.find(p => p.id === user.id)?.total_points || 0}</div>
                    <div style={{ fontSize: '10px', color: muted, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Points</div>
                  </div>
                  <div style={{ background: goldBg, border: `1px solid ${greenBorder}`, borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
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
                    <div style={{ fontSize: '10px', color: muted, marginTop: '4px' }}>Recommand&eacute; : 1200 x 300 px &middot; JPG, PNG &middot; Max 5MB</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: muted, marginBottom: '6px' }}>Avatar</div>
                    <ImageUpload userId={user.id} bucket="avatars" field="avatar_url" label="Changer l avatar" onSave={fetchProfile} gold={gold} dark={dark} border={border} muted={muted} />
                    <div style={{ fontSize: '10px', color: muted, marginTop: '4px' }}>Recommand&eacute; : 200 x 200 px &middot; JPG, PNG &middot; Max 2MB</div>
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


        {/* ADMIN */}
        {activeTab === 'admin' && isAdmin && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: '#ef4444' }}>Panneau Admin</div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {['matchs', 'joueurs'].map(t => (
                <button key={t} onClick={() => setAdminTab(t)} style={{ background: adminTab === t ? 'rgba(239,68,68,0.1)' : card, border: `1px solid ${adminTab === t ? '#ef4444' : border}`, color: adminTab === t ? '#ef4444' : muted, padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
                  {t}
                </button>
              ))}
            </div>

            {adminTab === 'matchs' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                <div style={panel}>
                  <div style={{ ...panelTitle, color: '#ef4444' }}>Cr&eacute;er un match</div>
                  <AdminMatchForm onCreate={createMatch} gold={gold} dark={dark} border={border} muted={muted} />
                </div>

                <div style={panel}>
                  <div style={{ ...panelTitle, color: '#ef4444' }}>Matchs en cours</div>
                  {liveMatches.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: muted, fontSize: '13px' }}>Aucun match en cours</div>
                  ) : liveMatches.map((m, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid #111` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: gold }}>{m.team_a?.name}</span>
                        <span style={{ color: muted }}>vs</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: gold }}>{m.team_b?.name}</span>
                      </div>
                      <AdminScoreForm match={m} onUpdate={updateScore} onDelete={deleteMatch} gold={gold} dark={dark} border={border} muted={muted} />
                    </div>
                  ))}
                </div>

                <div style={{ ...panel, gridColumn: '1 / -1' }}>
                  <div style={{ ...panelTitle, color: '#ef4444' }}>Historique complet</div>
                  {completedMatches.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: muted, fontSize: '13px' }}>Aucun match termin&eacute;</div>
                  ) : completedMatches.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 16px', borderBottom: `1px solid #111` }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                        <span style={{ fontWeight: 700, color: m.winner_id === m.team_a_id ? gold : light }}>{m.team_a?.name}</span>
                        <span style={{ color: gold, fontWeight: 900 }}>{m.score_a}</span>
                        <span style={{ color: muted }}>—</span>
                        <span style={{ color: m.winner_id === m.team_b_id ? gold : '#888', fontWeight: 900 }}>{m.score_b}</span>
                        <span style={{ fontWeight: 700, color: m.winner_id === m.team_b_id ? gold : light }}>{m.team_b?.name}</span>
                      </div>
                      <button onClick={() => deleteMatch(m.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === 'joueurs' && (
              <>
                {/* Modal ban */}
                {showBanMenu && selectedPlayer && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#0f0f0f', border: '1px solid #ef4444', borderRadius: '16px', padding: '28px', width: '360px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#ef4444' }}>Bannir {selectedPlayer.username}</div>
                        <button onClick={() => { setShowBanMenu(false); setSelectedPlayer(null); }} style={{ background: 'none', border: 'none', color: muted, fontSize: '20px', cursor: 'pointer' }}>x</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                        {[
                          { label: '1 heure', value: '1h' },
                          { label: '24 heures', value: '24h' },
                          { label: '48 heures', value: '48h' },
                          { label: '7 jours', value: '7j' },
                          { label: 'Permanent', value: 'permanent' },
                        ].map(opt => (
                          <button key={opt.value} onClick={() => banPlayer(selectedPlayer.id, opt.value)} style={{ background: opt.value === 'permanent' ? 'rgba(239,68,68,0.15)' : '#111', border: `1px solid ${opt.value === 'permanent' ? '#ef4444' : border}`, color: opt.value === 'permanent' ? '#ef4444' : light, padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' as const }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal actions joueur */}
                {selectedPlayer && !showBanMenu && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: '16px', padding: '28px', width: '360px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: gold, overflow: 'hidden' }}>
                            {selectedPlayer.avatar_url ? <img src={selectedPlayer.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedPlayer.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: light }}>{selectedPlayer.username}</div>
                            {selectedPlayer.discord_username && <div style={{ fontSize: '11px', color: '#5865f2' }}>@{selectedPlayer.discord_username}</div>}
                          </div>
                        </div>
                        <button onClick={() => setSelectedPlayer(null)} style={{ background: 'none', border: 'none', color: muted, fontSize: '20px', cursor: 'pointer' }}>x</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                        <button onClick={() => toggleAdmin(selectedPlayer.id, selectedPlayer.is_admin)} style={{ background: selectedPlayer.is_admin ? 'rgba(239,68,68,0.1)' : goldBg, border: `1px solid ${selectedPlayer.is_admin ? 'rgba(239,68,68,0.3)' : greenBorder}`, color: selectedPlayer.is_admin ? '#ef4444' : gold, padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                          {selectedPlayer.is_admin ? 'Retirer les droits admin' : 'Nommer admin'}
                        </button>
                        {selectedPlayer.is_banned ? (
                          <button onClick={() => { unbanPlayer(selectedPlayer.id); setSelectedPlayer(null); }} style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', color: '#00e5a0', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                            Lever le ban
                          </button>
                        ) : (
                          <button onClick={() => setShowBanMenu(true)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                            Bannir ce joueur
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div style={panel}>
                  <div style={{ ...panelTitle, color: '#ef4444' }}>Gestion des joueurs ({allUsers.length})</div>
                  {allUsers.map((u, i) => {
                    const banStatus = getBanStatus(u);
                    return (
                      <div key={i} onClick={() => { if (u.id !== user.id) { setSelectedPlayer(u); setShowBanMenu(false); } }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: `1px solid #111`, cursor: u.id !== user.id ? 'pointer' : 'default', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (u.id !== user.id) e.currentTarget.style.background = '#161616'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: gold, overflow: 'hidden', flexShrink: 0 }}>
                          {u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.username?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: banStatus ? '#ef4444' : light }}>{u.username}</div>
                          {u.discord_username && <div style={{ fontSize: '11px', color: '#5865f2' }}>@{u.discord_username}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {u.is_admin && <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>ADMIN</span>}
                          {banStatus && <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>BANNI {banStatus}</span>}
                          {u.id !== user.id && <span style={{ fontSize: '11px', color: muted }}>›</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}