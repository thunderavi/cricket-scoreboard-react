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
  
  // NEW: State for created match ID
  const [createdMatchId, setCreatedMatchId] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Debug: Log when teams are selected
  useEffect(() => {
    console.log('selectedTeam1 changed:', selectedTeam1);
    console.log('selectedTeam2 changed:', selectedTeam2);
    console.log('Should show toss?', !!(selectedTeam1 && selectedTeam2));
  }, [selectedTeam1, selectedTeam2]);

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

  // ========================================
  // IMPROVED TEAM SELECTION HANDLERS
  // ========================================

  const handleTeam1Select = (e) => {
    const teamId = e.target.value;
    
    console.log('🔵 Team 1 Selection:');
    console.log('  - Selected ID:', teamId);
    console.log('  - All teams:', teams);
    
    if (!teamId) {
      setSelectedTeam1(null);
      setTossResult(null);
      setCoinResult(null);
      setCreatedMatchId(null); // Reset match ID
      return;
    }
    
    // Find team - try both _id and id
    const team = teams.find(t => {
      const teamIdentifier = t._id || t.id;
      console.log('  - Comparing:', teamIdentifier, 'with', teamId);
      return teamIdentifier === teamId;
    });
    
    if (!team) {
      console.error('❌ Team 1 not found!');
      console.error('  - Looking for ID:', teamId);
      console.error('  - Available team IDs:', teams.map(t => t._id || t.id));
      alert('Error: Team not found. Please refresh the page.');
      e.target.value = '';
      return;
    }

    // CRITICAL: Ensure _id exists on the team object
    const normalizedTeam = {
      ...team,
      _id: team._id || team.id
    };
    
    console.log('✅ Team 1 normalized:', normalizedTeam);
    console.log('  - _id:', normalizedTeam._id);
    console.log('  - name:', normalizedTeam.name);
    
    // Check for duplicate selection
    if (selectedTeam2) {
      const team2Id = selectedTeam2._id || selectedTeam2.id;
      if (team2Id === normalizedTeam._id) {
        alert('Please select different teams');
        e.target.value = '';
        return;
      }
    }
    
    setSelectedTeam1(normalizedTeam);
    setTossResult(null);
    setCoinResult(null);
    setCreatedMatchId(null); // Reset match ID
  };

  const handleTeam2Select = (e) => {
    const teamId = e.target.value;
    
    console.log('🔵 Team 2 Selection:');
    console.log('  - Selected ID:', teamId);
    console.log('  - All teams:', teams);
    
    if (!teamId) {
      setSelectedTeam2(null);
      setTossResult(null);
      setCoinResult(null);
      setCreatedMatchId(null); // Reset match ID
      return;
    }
    
    // Find team - try both _id and id
    const team = teams.find(t => {
      const teamIdentifier = t._id || t.id;
      console.log('  - Comparing:', teamIdentifier, 'with', teamId);
      return teamIdentifier === teamId;
    });
    
    if (!team) {
      console.error('❌ Team 2 not found!');
      console.error('  - Looking for ID:', teamId);
      console.error('  - Available team IDs:', teams.map(t => t._id || t.id));
      alert('Error: Team not found. Please refresh the page.');
      e.target.value = '';
      return;
    }

    // CRITICAL: Ensure _id exists on the team object
    const normalizedTeam = {
      ...team,
      _id: team._id || team.id
    };
    
    console.log('✅ Team 2 normalized:', normalizedTeam);
    console.log('  - _id:', normalizedTeam._id);
    console.log('  - name:', normalizedTeam.name);
    
    // Check for duplicate selection
    if (selectedTeam1) {
      const team1Id = selectedTeam1._id || selectedTeam1.id;
      if (team1Id === normalizedTeam._id) {
        alert('Please select different teams');
        e.target.value = '';
        return;
      }
    }
    
    setSelectedTeam2(normalizedTeam);
    setTossResult(null);
    setCoinResult(null);
    setCreatedMatchId(null); // Reset match ID
  };

  // ========================================
  // IMPROVED FLIP COIN WITH NORMALIZATION
  // ========================================

  const flipCoin = () => {
    if (!tossCall) {
      alert('Please choose Heads or Tails');
      return;
    }

    console.log('🪙 Flipping Coin:');
    console.log('  - Toss Call:', tossCall);
    console.log('  - Toss Choice:', tossChoice);
    console.log('  - Team 1:', selectedTeam1);
    console.log('  - Team 2:', selectedTeam2);

    setCoinFlipping(true);
    setTossResult(null);
    setCreatedMatchId(null); // Reset match ID on new toss

    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      setCoinResult(result);
      
      const tossWon = tossCall === result;
      const winner = tossWon ? selectedTeam1 : selectedTeam2;
      const loser = tossWon ? selectedTeam2 : selectedTeam1;
      
      const battingFirst = tossChoice === 'batting' ? winner : loser;
      const fieldingFirst = tossChoice === 'batting' ? loser : winner;
      
      // CRITICAL: Ensure all team objects have _id
      const normalizedWinner = { ...winner, _id: winner._id || winner.id };
      const normalizedBattingFirst = { ...battingFirst, _id: battingFirst._id || battingFirst.id };
      const normalizedFieldingFirst = { ...fieldingFirst, _id: fieldingFirst._id || fieldingFirst.id };
      
      const tossResultData = {
        coinResult: result,
        winner: normalizedWinner,
        battingFirst: normalizedBattingFirst,
        fieldingFirst: normalizedFieldingFirst,
        tossChoice: tossChoice
      };
      
      console.log('✅ Toss Result:', tossResultData);
      
      setTossResult(tossResultData);
      setCoinFlipping(false);
    }, 2000);
  };

  // ========================================
  // NEW: CREATE MATCH (without navigation)
  // ========================================

  const createMatch = async () => {
    console.log('🚀 Creating Match...');
    
    if (!tossResult) {
      alert('Please complete the toss first');
      return;
    }

    // STEP 1: Extract all required data
    const team1Id = selectedTeam1?._id;
    const team2Id = selectedTeam2?._id;
    const tossWinnerId = tossResult?.winner?._id;
    const coinResult = tossResult?.coinResult;
    const tossChoice = tossResult?.tossChoice;
    const battingFirstId = tossResult?.battingFirst?._id;
    const fieldingFirstId = tossResult?.fieldingFirst?._id;

    // STEP 2: Build match data object
    const matchData = {
      team1Id,
      team2Id,
      tossWinnerId,
      coinResult,
      tossChoice,
      battingFirstId,
      fieldingFirstId
    };

    // STEP 3: Log everything for debugging
    console.log('📋 Match Data to Send:');
    console.log('  - team1Id:', team1Id, typeof team1Id);
    console.log('  - team2Id:', team2Id, typeof team2Id);
    console.log('  - tossWinnerId:', tossWinnerId, typeof tossWinnerId);
    console.log('  - coinResult:', coinResult, typeof coinResult);
    console.log('  - tossChoice:', tossChoice, typeof tossChoice);
    console.log('  - battingFirstId:', battingFirstId, typeof battingFirstId);
    console.log('  - fieldingFirstId:', fieldingFirstId, typeof fieldingFirstId);
    console.log('');
    console.log('📦 Full Match Data Object:', matchData);

    // STEP 4: Validate - check for undefined/null/empty values
    const invalidFields = [];
    
    if (!team1Id) invalidFields.push('team1Id');
    if (!team2Id) invalidFields.push('team2Id');
    if (!tossWinnerId) invalidFields.push('tossWinnerId');
    if (!coinResult) invalidFields.push('coinResult');
    if (!tossChoice) invalidFields.push('tossChoice');
    if (!battingFirstId) invalidFields.push('battingFirstId');
    if (!fieldingFirstId) invalidFields.push('fieldingFirstId');

    if (invalidFields.length > 0) {
      console.error('❌ Validation Failed!');
      console.error('  - Invalid fields:', invalidFields);
      console.error('  - selectedTeam1:', selectedTeam1);
      console.error('  - selectedTeam2:', selectedTeam2);
      console.error('  - tossResult:', tossResult);
      
      alert(`Missing required data: ${invalidFields.join(', ')}\n\nPlease:\n1. Reselect both teams\n2. Redo the toss\n3. Try again`);
      return;
    }

    // STEP 5: All validation passed, send request
    console.log('✅ Validation Passed! Sending request...');
    setSubmitting(true);

    try {
      const response = await matchesAPI.create(matchData);

      console.log('✅ Match Created Successfully:', response.data);

      if (response.data.success) {
        const matchId = response.data.match._id || response.data.matchId;
        
        console.log('🎯 Match Created:');
        console.log('  - Match ID:', matchId);
        
        if (!matchId) {
          console.error('❌ No match ID in response!');
          console.error('  - Response data:', response.data);
          alert('Match created but ID is missing. Please check the match from dashboard.');
          return;
        }
        
        setCreatedMatchId(matchId);
        alert('Match created successfully! Copy the Match ID and then click "Start Match".');
      }
    } catch (error) {
      console.error('❌ Create Match Error:', error);
      console.error('  - Error message:', error.message);
      console.error('  - Response data:', error.response?.data);
      console.error('  - Status code:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 'Failed to create match. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // NEW: COPY MATCH ID FUNCTION
  // ========================================

  const copyMatchId = () => {
    if (!createdMatchId) return;
    
    navigator.clipboard.writeText(createdMatchId).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy Match ID');
    });
  };

  // ========================================
  // NEW: START MATCH (navigate to board)
  // ========================================

  const startMatch = () => {
    if (!createdMatchId) {
      alert('Please create the match first');
      return;
    }
    
    console.log('🎯 Navigating to match board:');
    console.log('  - Match ID:', createdMatchId);
    console.log('  - Navigation path:', `/board/${createdMatchId}`);
    
    navigate(`/board/${createdMatchId}`);
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
                    value={selectedTeam1?._id || ''}
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'white',
                      border: '1px solid rgba(252, 184, 82, 0.3)'
                    }}
                  >
                    <option value="">Choose Team 1...</option>
                    {teams.map(team => (
                      <option key={team._id || team.id} value={team._id || team.id}>
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
                    value={selectedTeam2?._id || ''}
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'white',
                      border: '1px solid rgba(252, 184, 82, 0.3)'
                    }}
                  >
                    <option value="">Choose Team 2...</option>
                    {teams.map(team => (
                      <option key={team._id || team.id} value={team._id || team.id}>
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
            {/* Debug Info */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="alert" style={{ 
                  background: (selectedTeam1 && selectedTeam2) ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)', 
                  border: `1px solid ${(selectedTeam1 && selectedTeam2) ? 'rgba(40, 167, 69, 0.5)' : 'rgba(255, 193, 7, 0.5)'}`,
                  padding: '15px',
                  fontSize: '14px'
                }}>
                  <strong>🔍 Debug Status:</strong><br />
                  <div className="mt-2">
                    Team 1: {selectedTeam1 ? `✅ ${selectedTeam1.name}` : '❌ Not selected'}<br />
                    Team 2: {selectedTeam2 ? `✅ ${selectedTeam2.name}` : '❌ Not selected'}<br />
                    Toss Section: {(selectedTeam1 && selectedTeam2) ? '✅ Should be visible' : '❌ Hidden (select both teams)'}
                  </div>
                </div>
              </div>
            </div>

            {selectedTeam1 && selectedTeam2 ? (
              <div className="row" style={{ marginTop: '30px' }}>
                <div className="col-12">
                  <div 
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '15px',
                      padding: '30px',
                      border: '2px solid #fcb852',
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
            ) : (
              <div className="row mt-4">
                <div className="col-12">
                  <div className="alert alert-warning text-center" style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Please select both teams to proceed with the toss</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Create Match & Start Match Buttons */}
            {tossResult && (
              <div className="row mt-4">
                <div className="col-12">
                  {/* Match ID Display Section */}
                  {createdMatchId && (
                    <div 
                      className="alert alert-success text-center mb-4"
                      style={{
                        background: 'rgba(40, 167, 69, 0.2)',
                        border: '2px solid rgba(40, 167, 69, 0.5)',
                        animation: 'fadeIn 0.5s ease-in'
                      }}
                    >
                      <div className="mb-3">
                        <i className="fas fa-check-circle me-2" style={{ fontSize: '2rem', color: '#28a745' }}></i>
                        <h5 style={{ color: '#28a745', marginTop: '10px' }}>Match Created Successfully!</h5>
                      </div>
                      
                      <div 
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          padding: '15px',
                          borderRadius: '10px',
                          marginBottom: '15px'
                        }}
                      >
                        <small className="text-muted d-block mb-2">MATCH ID</small>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <code 
                            style={{
                              background: 'rgba(252, 184, 82, 0.2)',
                              color: '#fcb852',
                              padding: '10px 20px',
                              borderRadius: '5px',
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              border: '1px solid rgba(252, 184, 82, 0.3)'
                            }}
                          >
                            {createdMatchId}
                          </code>
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={copyMatchId}
                            style={{ minWidth: '100px' }}
                          >
                            {copySuccess ? (
                              <>
                                <i className="fas fa-check me-2"></i>Copied!
                              </>
                            ) : (
                              <>
                                <i className="fas fa-copy me-2"></i>Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Copy this Match ID for your records before starting the match
                      </small>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="text-center">
                    {!createdMatchId ? (
                      // Create Match Button (Step 1)
                      <button 
                        className="btn btn-warning btn-lg"
                        onClick={createMatch}
                        disabled={submitting}
                        style={{
                          minWidth: '250px',
                          fontWeight: 'bold',
                          animation: 'fadeIn 0.5s ease-in'
                        }}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Creating Match...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus-circle me-2"></i>Create Match
                          </>
                        )}
                      </button>
                    ) : (
                      // Start Match Button (Step 2)
                      <button 
                        className="btn btn-success btn-lg"
                        onClick={startMatch}
                        style={{
                          minWidth: '250px',
                          fontWeight: 'bold',
                          animation: 'fadeIn 0.5s ease-in'
                        }}
                      >
                        <i className="fas fa-play-circle me-2"></i>Start Match
                      </button>
                    )}
                  </div>

                  {/* Helper Text */}
                  {!createdMatchId && (
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        <i className="fas fa-lightbulb me-1"></i>
                        Step 1: Create the match to get your Match ID
                      </small>
                    </div>
                  )}
                  {createdMatchId && (
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        <i className="fas fa-arrow-right me-1"></i>
                        Step 2: Click "Start Match" to begin scoring
                      </small>
                    </div>
                  )}
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