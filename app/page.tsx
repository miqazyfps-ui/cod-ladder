'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Home() {
  const [activeTab, setActiveTab] = useState('tournois');
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTournoi, setShowCreateTournoi] = useState(false);
  const [newTournoi, setNewTournoi] = useState({ name: '', game: 'valorant', format: 'single_elimination', max_teams: 16, team_size: 5, prize_pool: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setShowAuth(false);
    });
    fetchData();
    return () => subscription.unsubscribe();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: t } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
    const { data: m } = await supabase.from('matches').select('*, team_a:team_a_id(name), team_b:team_b_id(name)').order('scheduled_at', { ascending: true });
    const { data: lb } = await supabase.from('leaderboard').select('*').limit(5);
    setTournaments(t || []);
    setMatches(m || []);
    setLeaderboard(lb || []);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function handleCreateTournoi() {
    if (!user) { setShowAuth(true); return; }
    await supabase.from('tournaments').insert({ ...newTournoi, organizer_id: user.id, status: 'open', prize_currency: 'EUR' });
    setShowCreateTournoi(false);
    setNewTournoi({ name: '', game: 'valorant', format: 'single_elimination', max_teams: 16, team_size: 5, prize_pool: 0 });
    fetchData();
  }

  const statusColor = (s: string) => s === 'open' ? '#00e5a0' : s === 'ongoing' ? '#ef4444' : '#64748b';
  const statusLabel = (s: string) => s === 'open' ? 'Inscriptions' : s === 'ongoing' ? 'En direct' : s === 'completed' ? 'Termine' : s;
  const gameColors: any = { valorant: '#00e5a0', cs2: '#7c3aed', lol: '#f59e0b', rocket_league: '#ef4444' };

  return (
    <div style={{ background: '#0b0c0f', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', color: '#e2e8f0' }}>

      {showAuth && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '16px', padding: '32px', width: '400px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#00e5a0' }}>COD GG</div>
              <button onClick={() => setShowAuth(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>x</button>
            </div>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#00e5a0', brandAccent: '#00c484' } } } }}
              providers={[]}
            />
          </div>
        </div>
      )}

      {showCreateTournoi && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '16px', padding: '32px', width: '480px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#e2e8f0' }}>Creer un tournoi</div>
              <button onClick={() => setShowCreateTournoi(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>x</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Nom du tournoi</div>
                <input value={newTournoi.name} onChange={e => setNewTournoi({ ...newTournoi, name: e.target.value })} placeholder="Ex: Spring Championship 2026" style={{ width: '100%', background: '#0b0c0f', border: '1px solid #1c1f2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Jeu</div>
                <select value={newTournoi.game} onChange={e => setNewTournoi({ ...newTournoi, game: e.target.value })} style={{ width: '100%', background: '#0b0c0f', border: '1px solid #1c1f2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px' }}>
                  <option value="valorant">Valorant</option>
                  <option value="cs2">CS2</option>
                  <option value="lol">League of Legends</option>
                  <option value="rocket_league">Rocket League</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Format</div>
                <select value={newTournoi.format} onChange={e => setNewTournoi({ ...newTournoi, format: e.target.value })} style={{ width: '100%', background: '#0b0c0f', border: '1px solid #1c1f2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px' }}>
                  <option value="single_elimination">Single Elimination</option>
                  <option value="double_elimination">Double Elimination</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="swiss">Swiss</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Max equipes</div>
                  <input type="number" value={newTournoi.max_teams} onChange={e => setNewTournoi({ ...newTournoi, max_teams: parseInt(e.target.value) })} style={{ width: '100%', background: '#0b0c0f', border: '1px solid #1c1f2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Joueurs/equipe</div>
                  <input type="number" value={newTournoi.team_size} onChange={e => setNewTournoi({ ...newTournoi, team_size: parseInt(e.target.value) })} style={{ width: '100%', background: '#0b0c0f', border: '1px solid #1c1f2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Prize pool</div>
                  <input type="number" value={newTournoi.prize_pool} onChange={e => setNewTournoi({ ...newTournoi, prize_pool: parseInt(e.target.value) })} style={{ width: '100%', background: '#0b0c0f', border: '1px solid #1c1f2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px' }} />
                </div>
              </div>
              <button onClick={handleCreateTournoi} style={{ background: '#00e5a0', color: '#0b0c0f', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
                Creer le tournoi
              </button>
            </div>
          </div>
        </div>
      )}

      <nav style={{ background: '#0f1117', borderBottom: '1px solid #1c1f2e', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '3px', color: '#00e5a0' }}>COD GG</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['tournois', 'calendrier', 'classement'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? 'rgba(0,229,160,0.1)' : 'transparent', color: activeTab === tab ? '#00e5a0' : '#64748b', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>{tab}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{user.email}</div>
              <button onClick={handleSignOut} style={{ background: 'transparent', color: '#64748b', border: '1px solid #1c1f2e', padding: '7px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Deconnexion</button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ background: '#5865f2', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Se connecter</button>
          )}
        </div>
      </nav>

      <div style={{ textAlign: 'center', padding: '48px 24px 32px', borderBottom: '1px solid #1c1f2e' }}>
        <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#00e5a0', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', padding: '4px 14px', borderRadius: '20px', marginBottom: '16px' }}>PLATEFORME ESPORT</div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#f1f5f9', marginBottom: '8px' }}>Rejoins la <span style={{ color: '#00e5a0' }}>competition</span></h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>Tournois, brackets, classements tout en un seul endroit.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => { if (!user) { setShowAuth(true); } else { setShowCreateTournoi(true); } }} style={{ background: '#00e5a0', color: '#0b0c0f', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>Creer un tournoi</button>
          <button onClick={() => setActiveTab('tournois')} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #1c1f2e', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Voir les tournois</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#0f1117', borderBottom: '1px solid #1c1f2e' }}>
        {[[tournaments.length.toString(), 'Tournois'], [matches.filter(m => m.status === 'live').length.toString(), 'En direct'], [tournaments.filter(m => m.status === 'open').length.toString(), 'Inscriptions ouvertes'], [leaderboard.length.toString(), 'Joueurs classes']].map(([val, lbl]) => (
          <div key={lbl} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #1c1f2e' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#00e5a0' }}>{val}</div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Chargement...</div>
          ) : (
            <>
              {activeTab === 'tournois' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8' }}>Tournois ({tournaments.length})</div>
                    <button onClick={() => { if (!user) { setShowAuth(true); } else { setShowCreateTournoi(true); } }} style={{ background: '#00e5a0', color: '#0b0c0f', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>+ Creer</button>
                  </div>
                  {tournaments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: '#0f1117', borderRadius: '12px', border: '1px solid #1c1f2e' }}>
                      <div style={{ fontSize: '14px', marginBottom: '12px' }}>Aucun tournoi pour l instant</div>
                      <button onClick={() => { if (!user) { setShowAuth(true); } else { setShowCreateTournoi(true); } }} style={{ background: '#00e5a0', color: '#0b0c0f', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>Creer le premier tournoi</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {tournaments.map(t => (
                        <div key={t.id} style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                          <div style={{ width: '4px', borderRadius: '2px', alignSelf: 'stretch', background: gameColors[t.game] || '#64748b', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>{t.game}</div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>{t.name}</div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                              <span>{t.format?.replace(/_/g, ' ')}</span>
                              <span>{t.team_size}v{t.team_size}</span>
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: statusColor(t.status) + '22', color: statusColor(t.status) }}>{statusLabel(t.status)}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>{t.prize_pool} euro</div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{t.max_teams} equipes max</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {activeTab === 'calendrier' && (
                <>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '16px' }}>Calendrier des matchs</div>
                  {matches.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: '#0f1117', borderRadius: '12px', border: '1px solid #1c1f2e' }}>Aucun match planifie pour l instant</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {matches.map((m, i) => (
                        <div key={i} style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontSize: '12px', color: m.status === 'live' ? '#ef4444' : '#64748b', minWidth: '90px' }}>{m.status === 'live' ? 'En direct' : m.scheduled_at ? new Date(m.scheduled_at).toLocaleDateString('fr-FR') : 'A planifier'}</div>
                          <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 600, fontSize: '14px' }}>
                            <span>{m.team_a?.name || 'TBD'}</span>
                            <span style={{ color: '#64748b', fontSize: '12px' }}>VS</span>
                            <span>{m.team_b?.name || 'TBD'}</span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa' }}>{m.score_a} - {m.score_b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {activeTab === 'classement' && (
                <>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '16px' }}>Classement general</div>
                  {leaderboard.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: '#0f1117', borderRadius: '12px', border: '1px solid #1c1f2e' }}>Aucun joueur classe pour l instant</div>
                  ) : (
                    <div style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '12px', overflow: 'hidden' }}>
                      {leaderboard.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: i < leaderboard.length - 1 ? '1px solid #0b0c0f' : 'none' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#ea580c' : '#64748b', width: '20px' }}>{i + 1}</div>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: '#00e5a0' }}>{p.username?.[0]?.toUpperCase()}</div>
                          <div style={{ flex: 1, fontWeight: 600, fontSize: '14px' }}>{p.username}</div>
                          <div style={{ fontSize: '12px', color: '#00e5a0' }}>{p.total_wins || 0} V</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>{p.total_points || 0} pts</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#64748b', padding: '12px 16px', borderBottom: '1px solid #1c1f2e' }}>Top classement</div>
            {leaderboard.length === 0 ? (
              <div style={{ padding: '20px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Aucun joueur encore</div>
            ) : leaderboard.slice(0, 3).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid #0b0c0f' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#ea580c', width: '16px' }}>{i + 1}</div>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#00e5a0' }}>{p.username?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, fontSize: '13px', fontWeight: 600 }}>{p.username}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>{p.total_points || 0}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#64748b', padding: '12px 16px', borderBottom: '1px solid #1c1f2e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />Match en direct
            </div>
            {matches.filter(m => m.status === 'live').length === 0 ? (
              <div style={{ padding: '20px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Aucun match en direct</div>
            ) : matches.filter(m => m.status === 'live').slice(0, 1).map((m, i) => (
              <div key={i} style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{m.team_a?.name || 'TBD'}</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#00e5a0', marginTop: '4px' }}>{m.score_a}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>VS</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{m.team_b?.name || 'TBD'}</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, marginTop: '4px' }}>{m.score_b}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {user && (
            <div style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>Mon profil</div>
              <div style={{ fontSize: '13px', color: '#e2e8f0', marginBottom: '4px' }}>{user.email}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Connecte</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}