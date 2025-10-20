import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { teamsAPI, matchesAPI } from '../services/api';

const Match = () => {
  const navigate = useNavigate();
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam1, setSelectedTeam1] = useState(null);
  const [selectedTeam2, setSelectedTeam2] = useState(null);
  const [tossCall, setTossCall] = useState('');
  const [tossChoice, setTossChoice] = useState('batting');
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState(null);
  const [tossResult, setTossResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await teamsAPI.getAll();
      if (response.data.success) {
        setTeams(response.data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      alert('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // Handle team selection
  const handleTeam1Select = (e) => {
    const teamId = e.target.value;
    if (!teamId) {
      setSelectedTeam1(null);
      return;
    }
    
    const team = teams.find(t => t._id === teamId);
    if (selectedTeam2 && selectedTeam2._id === teamId) {
      alert('Please select different teams');
      e.target.value = '';
      return;
    }
    setSelectedTeam1(team);
    setTossResult(null);
  };

  const handleTeam2Select = (e) => {
    const teamId = e.target.value;
    if (!teamId) {
      setSelectedTeam2(null);
      return;
    }
    
    const team = teams.find(t => t._id === teamId);
    if (selectedTeam1 && selectedTeam1._id === teamId) {
      alert('Please select different teams');
      e.target.value = '';
      return;
    }
    setSelectedTeam2(team);
    setTossResult(null);
  };

  // Flip coin
  const flipCoin = () => {
    if (!tossCall) {
      alert('Please choose Heads or Tails');
      return;
    }

    setCoinFlipping(true);
    setTossResult(null);

    // Simulate coin flip after animation
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      setCoinResult(result);
      
      const tossWon = tossCall === result;
      const winner = tossWon ? selectedTeam1 : selectedTeam2;
      const loser = tossWon ? selectedTeam2 : selectedTeam1;
      
      const battingFirst = tossChoice === 'batting' ? winner : loser;
      const fieldingFirst = tossChoice === 'batting' ? loser : winner;
      
      setTossResult({
        coinResult: result,
        winner: winner,
        battingFirst: battingFirst,
        fieldingFirst: fieldingFirst,
        tossChoice: tossChoice
      });
      
      setCoinFlipping(false);
    }, 2000);
  };

  // Start match
  const startMatch = async () => {
    if (!tossResult) {
      alert('Please complete the toss first');
      return;
    }

    setSubmitting(true);

    try {
      const matchData = {
        team1Id: selectedTeam1._id,
        team2Id: selectedTeam2._id,
        tossWinnerId: tossResult.winner._id,
        coinResult: tossResult.coinResult,
        tossChoice: tossResult.tossChoice,
        battingFirstId: tossResult.battingFirst._id,
        fieldingFirstId: tossResult.fieldingFirst._id
      };

      const response = await matchesAPI.create(matchData);

      if (response.data.success) {
        alert('Match created successfully!');
        navigate(`/board/${response.data.match._id}`);
      }
    } catch (error) {
      console.error('Create match error:', error);
      alert(error.response?.data?.message || 'Failed to create match');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="container py-5">
        {/* Header */}
        <div className="row align-items-center mb-4">
          <div className="col-auto">
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={() => navigate('/teams')}
            >
              <i className="fas fa-arrow-left"></i> Back to Teams
            </button>
          </div>
          <div className="col">
            <h2 className="mb-1" style={{ color: '#fcb852', fontWeight: 700 }}>
              Match Setup
            </h2>
            <p className="mb-0 text-muted">
              Select teams, conduct toss, and start your cricket match
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="alert alert-warning" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            No teams available. Please <a href="/teams" className="alert-link">create teams</a> first.
          </div>
        ) : (
          <>
            {/* Team Selection */}
            <div className="row mb-5">
              <div className="col-lg-6 mb-4">
                <div 
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px',
                    padding: '20px',
                    border: '1px solid rgba(252, 184, 82, 0.2)'
                  }}
                >
                  <h5 style={{ color: '#fcb852', marginBottom: '15px' }}>
                    <i className="fas fa-users me-2"></i>Team 1
                  </h5>
                  <select 
                    className="form-select mb-3"
                    onChange={handleTeam1Select}
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'white',
                      border: '1px solid rgba(252, 184, 82, 0.3)'
                    }}
                  >
                    <option value="">Choose Team 1...</option>
                    {teams.map(team => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>

                  {selectedTeam1 && (
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        background: 'rgba(252, 184, 82, 0.1)',
                        borderRadius: '10px',
                        animation: 'fadeIn 0.3s ease-in'
                      }}
                    >
                      <img 
                        src={selectedTeam1.logo} 
                        alt="Team 1"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          marginRight: '15px',
                          objectFit: 'cover',
                          border: '2px solid #fcb852'
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect fill=%22%23fcb852%22 width=%2260%22 height=%2260%22/%3E%3Ctext x=%2230%22 y=%2235%22 text-anchor=%22middle%22 fill=%22%23000%22 font-size=%2220%22%3ET%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div>
                        <h6 style={{ color: '#fcb852', margin: 0 }}>{selectedTeam1.name}</h6>
                        <p style={{ color: '#c5c6c7', margin: 0, fontSize: '0.9rem' }}>
                          Captain: {selectedTeam1.captain}
                        </p>
                        <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.85rem' }}>
                          {selectedTeam1.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-6 mb-4">
                <div 
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px',
                    padding: '20px',
                    border: '1px solid rgba(252, 184, 82, 0.2)'
                  }}
                >
                  <h5 style={{ color: '#fcb852', marginBottom: '15px' }}>
                    <i className="fas fa-users me-2"></i>Team 2
                  </h5>
                  <select 
                    className="form-select mb-3"
                    onChange={handleTeam2Select}
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'white',
                      border: '1px solid rgba(252, 184, 82, 0.3)'
                    }}
                  >
                    <option value="">Choose Team 2...</option>
                    {teams.map(team => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>

                  {selectedTeam2 && (
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        background: 'rgba(252, 184, 82, 0.1)',
                        borderRadius: '10px',
                        animation: 'fadeIn 0.3s ease-in'
                      }}
                    >
                      <img 
                        src={selectedTeam2.logo} 
                        alt="Team 2"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          marginRight: '15px',
                          objectFit: 'cover',
                          border: '2px solid #fcb852'
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect fill=%22%23fcb852%22 width=%2260%22 height=%2260%22/%3E%3Ctext x=%2230%22 y=%2235%22 text-anchor=%22middle%22 fill=%22%23000%22 font-size=%2220%22%3ET%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div>
                        <h6 style={{ color: '#fcb852', margin: 0 }}>{selectedTeam2.name}</h6>
                        <p style={{ color: '#c5c6c7', margin: 0, fontSize: '0.9rem' }}>
                          Captain: {selectedTeam2.captain}
                        </p>
                        <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.85rem' }}>
                          {selectedTeam2.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Toss Section */}
            {selectedTeam1 && selectedTeam2 && (
              <div className="row">
                <div className="col-12">
                  <div 
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '15px',
                      padding: '30px',
                      border: '1px solid rgba(252, 184, 82, 0.2)',
                      animation: 'fadeIn 0.5s ease-in'
                    }}
                  >
                    <div className="text-center mb-4">
                      <h4 style={{ color: '#fcb852', fontWeight: 600 }}>
                        <i className="fas fa-coins me-2"></i>Toss Time
                      </h4>
                      <p className="text-muted">Choose your call and flip the coin!</p>
                    </div>

                    <div className="row align-items-center">
                      {/* Toss Options */}
                      <div className="col-lg-4">
                        <h6 className="mb-3" style={{ color: '#fcb852' }}>Choose Your Call:</h6>
                        <div className="d-grid gap-2 mb-4">
                          <button
                            className={`btn ${tossCall === 'heads' ? 'btn-warning' : 'btn-outline-light'}`}
                            onClick={() => setTossCall('heads')}
                            disabled={coinFlipping}
                          >
                            <i className="fas fa-circle me-2"></i>Heads
                          </button>
                          <button
                            className={`btn ${tossCall === 'tails' ? 'btn-warning' : 'btn-outline-light'}`}
                            onClick={() => setTossCall('tails')}
                            disabled={coinFlipping}
                          >
                            <i className="fas fa-circle me-2"></i>Tails
                          </button>
                        </div>

                        <h6 className="mb-2" style={{ color: '#fcb852' }}>If Won, Choose:</h6>
                        <div className="d-grid gap-2">
                          <button
                            className={`btn btn-sm ${tossChoice === 'batting' ? 'btn-warning' : 'btn-outline-light'}`}
                            onClick={() => setTossChoice('batting')}
                            disabled={coinFlipping}
                          >
                            <i className="fas fa-baseball-ball me-2"></i>Batting
                          </button>
                          <button
                            className={`btn btn-sm ${tossChoice === 'fielding' ? 'btn-warning' : 'btn-outline-light'}`}
                            onClick={() => setTossChoice('fielding')}
                            disabled={coinFlipping}
                          >
                            <i className="fas fa-running me-2"></i>Fielding
                          </button>
                        </div>
                      </div>

                      {/* Coin Animation */}
                      <div className="col-lg-4 text-center">
                        <div style={{ margin: '20px 0' }}>
                          <div 
                            style={{
                              width: '150px',
                              height: '150px',
                              margin: '0 auto',
                              background: coinResult === 'heads' ? '#FFD700' : coinResult === 'tails' ? '#C0C0C0' : '#fcb852',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '3rem',
                              fontWeight: 'bold',
                              color: '#000',
                              boxShadow: '0 4px 15px rgba(252, 184, 82, 0.5)',
                              animation: coinFlipping ? 'coinFlip 2s ease-in-out' : 'none',
                              transform: coinFlipping ? 'rotateY(720deg)' : 'rotateY(0deg)',
                              transition: 'all 0.3s'
                            }}
                          >
                            {coinFlipping ? '?' : coinResult ? (coinResult === 'heads' ? 'H' : 'T') : '🪙'}
                          </div>
                        </div>
                        
                        <button 
                          className="btn btn-warning btn-lg mt-4"
                          onClick={flipCoin}
                          disabled={!tossCall || coinFlipping}
                        >
                          {coinFlipping ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Flipping...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-hand-paper me-2"></i>Flip Coin
                            </>
                          )}
                        </button>
                      </div>

                      {/* Toss Result */}
                      <div className="col-lg-4">
                        {tossResult && (
                          <div 
                            style={{
                              background: 'rgba(252, 184, 82, 0.1)',
                              borderRadius: '10px',
                              padding: '20px',
                              border: '1px solid rgba(252, 184, 82, 0.3)',
                              animation: 'fadeIn 0.5s ease-in'
                            }}
                          >
                            <div className="text-center">
                              <div style={{ fontSize: '3rem', color: '#fcb852', marginBottom: '10px' }}>
                                <i className="fas fa-trophy"></i>
                              </div>
                              <h5 style={{ color: '#fcb852' }}>{tossResult.winner.name} Wins Toss!</h5>
                              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Coin: {tossResult.coinResult.toUpperCase()} | Chooses to {tossResult.tossChoice} first
                              </p>
                              
                              <div className="mt-3">
                                <div className="mb-2">
                                  <small className="text-muted">BATTING FIRST</small>
                                  <div 
                                    style={{
                                      background: 'rgba(40, 167, 69, 0.2)',
                                      padding: '8px',
                                      borderRadius: '5px',
                                      color: '#28a745',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {tossResult.battingFirst.name}
                                  </div>
                                </div>
                                <div>
                                  <small className="text-muted">FIELDING FIRST</small>
                                  <div 
                                    style={{
                                      background: 'rgba(220, 53, 69, 0.2)',
                                      padding: '8px',
                                      borderRadius: '5px',
                                      color: '#dc3545',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {tossResult.fieldingFirst.name}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Start Match Button */}
            {tossResult && (
              <div className="row mt-4">
                <div className="col-12 text-center">
                  <button 
                    className="btn btn-warning btn-lg"
                    onClick={startMatch}
                    disabled={submitting}
                    style={{
                      minWidth: '200px',
                      fontWeight: 'bold',
                      animation: 'fadeIn 0.5s ease-in'
                    }}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Starting Match...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-arrow-right me-2"></i>Start Match
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes coinFlip {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(720deg);
          }
        }

        .form-select option {
          background: #1a1a2e;
          color: white;
        }
      `}</style>

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
                <i className="fas fa-info-circle me-1"></i>
                <strong>Match Setup:</strong> Select two teams, conduct the toss, and proceed to match scoring.
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

export default Match;