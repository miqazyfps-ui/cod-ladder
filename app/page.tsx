'use client';

import { useState } from 'react';

const tournaments = [
  { id: 1, game: 'Valorant', name: 'Spring Championship 2026', format: '5v5 · Single Elim', teams: 9, maxTeams: 16, prize: '500 €', status: 'open', color: '#00e5a0' },
  { id: 2, game: 'League of Legends', name: 'Midnight Clash #4', format: '5v5 · Double Elim', teams: 8, maxTeams: 8, prize: '250 €', status: 'live', color: '#ef4444' },
  { id: 3, game: 'CS2', name: 'FragFest Invitational', format: '5v5 · Swiss', teams: 21, maxTeams: 32, prize: '1 000 €', status: 'open', color: '#7c3aed' },
  { id: 4, game: 'Rocket League', name: 'Boost or Die #7', format: '3v3 · Round Robin', teams: 12, maxTeams: 12, prize: '150 €', status: 'done', color: '#f59e0b' },
];

const leaderboard = [
  { rank: 1, name: 'NovaTeam', points: 1840, wins: 12, color: '#f59e0b' },
  { rank: 2, name: 'XionGG', points: 1620, wins: 10, color: '#94a3b8' },
  { rank: 3, name: 'PhantomX', points: 1480, wins: 9, color: '#ea580c' },
  { rank: 4, name: 'StormFive', points: 1310, wins: 8, color: '#64748b' },
  { rank: 5, name: 'AlphaSquad', points: 1190, wins: 7, color: '#64748b' },
];

const matches = [
  { time: 'En direct', teamA: 'StormFive', teamB: 'ReapersClan', game: 'Valorant', live: true },
  { time: "Auj. 20:30", teamA: 'PhantomX', teamB: 'TBD', game: 'Valorant', live: false },
  { time: 'Sam. 15:00', teamA: 'NovaTeam', teamB: 'TBD', game: 'Valorant', live: false },
  { time: 'Sam. 16:00', teamA: 'AlphaSquad', teamB: 'XionGG', game: 'CS2', live: false },
  { time: 'Dim. 14:00', teamA: 'NovaTeam', teamB: 'FragKings', game: 'League of Legends', live: false },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('tournois');

  return (
    <div style={{ background: '#0b0c0f', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', color: '#e2e8f0' }}>

      {/* NAVBAR */}
      <nav style={{ background: '#0f1117', borderBottom: '1px solid #1c1f2e', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '3px', color: '#00e5a0' }}>
          COD<span style={{ color: '#7c3aed' }}>.</span>GG
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['tournois', 'calendrier', 'classement'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? 'rgba(0,229,160,0.1)' : 'transparent',
              color: activeTab === tab ? '#00e5a0' : '#64748b',
              border: 'none', padding: '8px 16px', borderRadius: '8px',
              fontWeight: 700, fontSize: '12px', letterSpacing: '1px',
              textTransform: 'uppercase', cursor: 'pointer'
            }}>
              {tab}
            </button>
          ))}
        </div>
        <button style={{ background: '#5865f2', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
          Se connecter
        </button>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '48px 24px 32px', borderBottom: '1px solid #1c1f2e' }}>
        <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#00e5a0', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', padding: '4px 14px', borderRadius: '20px', marginBottom: '16px' }}>
          PLATEFORME ESPORT
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#f1f5f9', marginBottom: '8px' }}>
          Rejoins la <span style={{ color: '#00e5a0' }}>compétition</span>
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>Tournois, brackets, classements — tout en un seul endroit.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button style={{ background: '#00e5a0', color: '#0b0c0f', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
            Créer un tournoi
          </button>
          <button style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #1c1f2e', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            Voir les tournois
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#0f1117', borderBottom: '1px solid #1c1f2e' }}>
        {[['247', 'Tournois'], ['1 840', 'Joueurs'], ['12 K€', 'Prize pools'], ['4', 'En direct']].map(([val, lbl]) => (
          <div key={lbl} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #1c1f2e' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#00e5a0' }}>{val}</div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* CONTENU PRINCIPAL */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

        {/* GAUCHE */}
        <div>
          {activeTab === 'tournois' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8' }}>Tournois actifs</div>
                <button style={{ background: '#00e5a0', color: '#0b0c0f', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>+ Créer</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tournaments.map(t => (
                  <div key={t.id} style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                    <div style={{ width: '4px', borderRadius: '2px', alignSelf: 'stretch', background: t.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>{t.game}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>{t.name}</div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                        <span>{t.format}</span>
                        <span>{t.teams} / {t.maxTeams} équipes</span>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                          background: t.status === 'open' ? 'rgba(0,229,160,0.12)' : t.status === 'live' ? 'rgba(239,68,68,0.12)' : 'rgba(100,116,139,0.12)',
                          color: t.status === 'open' ? '#00e5a0' : t.status === 'live' ? '#ef4444' : '#64748b'
                        }}>
                          {t.status === 'open' ? 'Inscriptions' : t.status === 'live' ? '🔴 En direct' : 'Terminé'}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>{t.prize}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{t.maxTeams - t.teams} places restantes</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'calendrier' && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '16px' }}>Calendrier des matchs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matches.map((m, i) => (
                  <div key={i} style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '12px', color: m.live ? '#ef4444' : '#64748b', minWidth: '90px', fontWeight: m.live ? 700 : 400 }}>{m.live ? '🔴 ' : ''}{m.time}</div>
                    <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 600, fontSize: '14px' }}>
                      <span>{m.teamA}</span>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>VS</span>
                      <span>{m.teamB}</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(124,58,237,0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: '4px' }}>{m.game}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'classement' && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '16px' }}>Classement général</div>
              <div style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '12px', overflow: 'hidden' }}>
                {leaderboard.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: i < leaderboard.length - 1 ? '1px solid #0b0c0f' : 'none' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: p.color, width: '20px' }}>{p.rank}</div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${p.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: p.color }}>{p.name[0]}</div>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: '14px' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#00e5a0' }}>{p.wins} V</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: p.color }}>{p.points} pts</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* DROITE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Leaderboard mini */}
          <div style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#64748b', padding: '12px 16px', borderBottom: '1px solid #1c1f2e' }}>Top classement</div>
            {leaderboard.slice(0, 3).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid #0b0c0f' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: p.color, width: '16px' }}>{p.rank}</div>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${p.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: p.color }}>{p.name[0]}</div>
                <div style={{ flex: 1, fontSize: '13px', fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: p.color }}>{p.points}</div>
              </div>
            ))}
          </div>

          {/* Match en direct */}
          <div style={{ background: '#0f1117', border: '1px solid #1c1f2e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#64748b', padding: '12px 16px', borderBottom: '1px solid #1c1f2e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
              Match en direct
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>StormFive</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#00e5a0', marginTop: '4px' }}>9</div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>VS</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>ReapersClan</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, marginTop: '4px' }}>6</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Valorant · Midnight Clash #4</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}