import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { teamsAPI, matchesAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalMatches: 0,
    completedMatches: 0,
    liveMatches: 0
  });
  
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch teams
      const teamsResponse = await teamsAPI.getAll();
      const teams = teamsResponse.data.teams || [];
      
      // Fetch matches
      const matchesResponse = await matchesAPI.getAll();
      const matches = matchesResponse.data.matches || [];
      
      // DEBUG: Log matches to see their structure
      console.log('Fetched matches:', matches);
      if (matches.length > 0) {
        console.log('First match structure:', matches[0]);
        console.log('First match _id:', matches[0]._id);
        console.log('First match id:', matches[0].id);
      }
      
      // Calculate stats
      const completedMatches = matches.filter(m => m.status === 'completed').length;
      const liveMatches = matches.filter(m => m.status === 'live').length;
      
      setStats({
        totalTeams: teams.length,
        totalMatches: matches.length,
        completedMatches: completedMatches,
        liveMatches: liveMatches
      });
      
      // Get recent 5 matches
      const sortedMatches = matches.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 5);
      
      setRecentMatches(sortedMatches);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-success',
      live: 'bg-danger',
      setup: 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Navbar />

      <div className="container py-5">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 style={{ color: '#fcb852', fontWeight: 700 }}>
              Welcome, {user?.name || 'Player'}!
            </h2>
            <p className="text-muted">Your cricket scoreboard dashboard</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div 
                  className="stats-card text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px',
                    padding: '25px',
                    border: '1px solid rgba(252, 184, 82, 0.2)',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(252,184,82,0.4)';
                    e.currentTarget.style.borderColor = '#fcb852';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(252, 184, 82, 0.2)';
                  }}
                  onClick={() => navigate('/teams')}
                >
                  <i className="fas fa-users fa-2x mb-3" style={{ color: '#fcb852' }}></i>
                  <h3 style={{ color: '#fcb852', fontSize: '2.5rem', marginBottom: '10px' }}>
                    {stats.totalTeams}
                  </h3>
                  <p className="text-muted">Teams Created</p>
                  <button className="btn btn-sm btn-outline-light mt-2">
                    View Teams
                  </button>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div 
                  className="stats-card text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px',
                    padding: '25px',
                    border: '1px solid rgba(252, 184, 82, 0.2)',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(252,184,82,0.4)';
                    e.currentTarget.style.borderColor = '#fcb852';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(252, 184, 82, 0.2)';
                  }}
                  onClick={() => navigate('/match')}
                >
                  <i className="fas fa-trophy fa-2x mb-3" style={{ color: '#fcb852' }}></i>
                  <h3 style={{ color: '#fcb852', fontSize: '2.5rem', marginBottom: '10px' }}>
                    {stats.totalMatches}
                  </h3>
                  <p className="text-muted">Total Matches</p>
                  <button className="btn btn-sm btn-outline-light mt-2">
                    New Match
                  </button>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div 
                  className="stats-card text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px',
                    padding: '25px',
                    border: '1px solid rgba(252, 184, 82, 0.2)',
                    transition: 'all 0.3s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(252,184,82,0.4)';
                    e.currentTarget.style.borderColor = '#fcb852';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(252, 184, 82, 0.2)';
                  }}
                >
                  <i className="fas fa-check-circle fa-2x mb-3" style={{ color: '#28a745' }}></i>
                  <h3 style={{ color: '#28a745', fontSize: '2.5rem', marginBottom: '10px' }}>
                    {stats.completedMatches}
                  </h3>
                  <p className="text-muted">Completed</p>
                  <span className="badge bg-success mt-2">Finished</span>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div 
                  className="stats-card text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px',
                    padding: '25px',
                    border: '1px solid rgba(252, 184, 82, 0.2)',
                    transition: 'all 0.3s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(252,184,82,0.4)';
                    e.currentTarget.style.borderColor = '#fcb852';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(252, 184, 82, 0.2)';
                  }}
                >
                  <i className="fas fa-circle fa-2x mb-3" style={{ color: '#dc3545' }}></i>
                  <h3 style={{ color: '#dc3545', fontSize: '2.5rem', marginBottom: '10px' }}>
                    {stats.liveMatches}
                  </h3>
                  <p className="text-muted">Live Now</p>
                  <span className="badge bg-danger mt-2">
                    <i className="fas fa-circle fa-xs me-1"></i>Live
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row mt-5">
              <div className="col-12">
                <h4 style={{ color: '#fcb852', fontWeight: 600 }} className="mb-3">
                  <i className="fas fa-bolt me-2"></i>Quick Actions
                </h4>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <button
                      className="btn btn-outline-light w-100 py-3"
                      style={{ transition: 'all 0.3s' }}
                      onClick={() => navigate('/teams')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fcb852';
                        e.currentTarget.style.color = '#0b0f19';
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      }}
                    >
                      <i className="fas fa-users d-block mb-2" style={{ fontSize: '2rem' }}></i>
                      Manage Teams
                    </button>
                  </div>
                  <div className="col-md-3 mb-3">
                    <button
                      className="btn btn-outline-light w-100 py-3"
                      style={{ transition: 'all 0.3s' }}
                      onClick={() => navigate('/match')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fcb852';
                        e.currentTarget.style.color = '#0b0f19';
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      }}
                    >
                      <i className="fas fa-plus-circle d-block mb-2" style={{ fontSize: '2rem' }}></i>
                      New Match
                    </button>
                  </div>
                  <div className="col-md-3 mb-3">
                    <button
                      className="btn btn-outline-light w-100 py-3"
                      style={{ transition: 'all 0.3s' }}
                      onClick={() => {
                        if (stats.totalTeams > 0) {
                          navigate('/teams');
                        } else {
                          alert('Please create a team first');
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fcb852';
                        e.currentTarget.style.color = '#0b0f19';
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      }}
                    >
                      <i className="fas fa-user-plus d-block mb-2" style={{ fontSize: '2rem' }}></i>
                      Add Players
                    </button>
                  </div>
                  <div className="col-md-3 mb-3">
                    <button
                      className="btn btn-outline-light w-100 py-3"
                      style={{ transition: 'all 0.3s' }}
                      onClick={() => {
                        const liveMatch = recentMatches.find(m => m.status === 'live');
                        if (liveMatch) {
                          const matchId = liveMatch._id || liveMatch.id;
                          navigate(`/board/${matchId}`);
                        } else {
                          alert('No live matches available');
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fcb852';
                        e.currentTarget.style.color = '#0b0f19';
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      }}
                    >
                      <i className="fas fa-chart-line d-block mb-2" style={{ fontSize: '2rem' }}></i>
                      Live Score
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Matches */}
            <div className="row mt-5">
              <div className="col-12">
                <h4 style={{ color: '#fcb852', fontWeight: 600 }} className="mb-3">
                  <i className="fas fa-history me-2"></i>Recent Matches
                </h4>

                {recentMatches.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-cricket fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No matches played yet</p>
                    <button 
                      className="btn btn-warning mt-2"
                      onClick={() => navigate('/match')}
                    >
                      Start Your First Match
                    </button>
                  </div>
                ) : (
                  recentMatches.map((match) => {
                    // Extract match ID - handle both _id and id
                    const matchId = match._id || match.id;
                    
                    return (
                      <div
                        key={matchId || Math.random()}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '15px',
                          marginBottom: '15px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease-in-out',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = '#fcb852';
                          e.currentTarget.style.transform = 'scale(1.01)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        onClick={() => {
                          console.log('=== MATCH CLICKED ===');
                          console.log('Full match object:', match);
                          console.log('Match _id:', match._id);
                          console.log('Match id:', match.id);
                          console.log('Using matchId:', matchId);
                          console.log('Match ID type:', typeof matchId);
                          console.log('===================');
                          
                          if (matchId && matchId !== 'undefined' && matchId !== 'null') {
                            navigate(`/matches/${matchId}`);
                          } else {
                            console.error('Invalid match ID!');
                            alert('Error: Cannot open match - Invalid match ID');
                          }
                        }}
                      >
                        <div className="row align-items-center">
                          <div className="col-md-4">
                            <div className="d-flex align-items-center">
                              <img
                                src={match.team1?.logo || 'https://via.placeholder.com/40'}
                                alt="Team 1"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  marginRight: '10px',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect fill=%22%23fcb852%22 width=%2240%22 height=%2240%22/%3E%3Ctext x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22%23000%22 font-size=%2220%22%3ET%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <span className="text-white">{match.team1?.name || 'Team 1'}</span>
                            </div>
                          </div>
                          <div className="col-md-1 text-center">
                            <strong style={{ color: '#fcb852' }}>VS</strong>
                          </div>
                          <div className="col-md-4">
                            <div className="d-flex align-items-center">
                              <img
                                src={match.team2?.logo || 'https://via.placeholder.com/40'}
                                alt="Team 2"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  marginRight: '10px',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect fill=%22%23fcb852%22 width=%2240%22 height=%2240%22/%3E%3Ctext x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22%23000%22 font-size=%2220%22%3ET%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <span className="text-white">{match.team2?.name || 'Team 2'}</span>
                            </div>
                          </div>
                          <div className="col-md-3 text-end">
                            <span className={`badge ${getStatusBadge(match.status)}`}>
                              {match.status === 'live' && <i className="fas fa-circle fa-xs me-1"></i>}
                              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                            </span>
                            <br />
                            <small className="text-muted">
                              {formatDate(match.createdAt)}
                            </small>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info Footer */}
      <div 
        className="container-fluid mt-5 py-3"
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <small className="text-muted">
                <i className="fas fa-chart-bar me-1"></i>
                <strong>Dashboard Overview:</strong> Track your teams, matches, and cricket statistics in real-time.
              </small>
            </div>
            <div className="col-md-4 text-end">
              <small className="text-muted">
                <i className="fas fa-server me-1"></i>
                MongoDB Atlas Storage
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;