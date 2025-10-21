import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { matchesAPI, playersAPI } from '../services/api';

const Board = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [liveScore, setLiveScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  
  const [showOutModal, setShowOutModal] = useState(false);
  const [activeInningsTab, setActiveInningsTab] = useState(1);
  
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    console.log('🏏 Board Component Mounted');
    console.log('  - matchId from params:', matchId);
    console.log('  - matchId type:', typeof matchId);
    console.log('  - matchId is valid?', matchId && matchId !== 'undefined' && matchId !== 'null');
    
    if (matchId && matchId !== 'undefined' && matchId !== 'null') {
      fetchMatchData();
    } else {
      console.error('❌ Invalid Match ID detected');
      setError('Invalid match ID. Please start a new match.');
      setLoading(false);
    }
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching match data for ID:', matchId);
      
      const response = await matchesAPI.getById(matchId);
      
      console.log('📦 Match API Response:', response.data);
      
      if (response.data.success) {
        const matchData = response.data.match;
        console.log('✅ Match data loaded:', matchData);
        
        setMatch(matchData);
        
        // Initialize live score structure
        initializeLiveScore(matchData);
        
        // Fetch available players for current batting team
        await fetchAvailablePlayers(matchData);
      } else {
        console.error('❌ Match not found in response');
        setError('Match not found');
      }
    } catch (error) {
      console.error('❌ Error fetching match:', error);
      console.error('  - Error message:', error.message);
      console.error('  - Error response:', error.response?.data);
      console.error('  - Status code:', error.response?.status);
      
      setError(error.response?.data?.message || 'Failed to load match data');
    } finally {
      setLoading(false);
    }
  };

  const initializeLiveScore = (matchData) => {
    console.log('🎯 Initializing live score');
    console.log('  - Match status:', matchData.status);
    
    // Initialize or use existing live score
    const score = {
      currentInnings: matchData.status === 'live' ? 2 : 1,
      innings1: matchData.innings1Score || {
        runs: 0,
        wickets: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        completedPlayers: []
      },
      innings2: matchData.innings2Score || {
        runs: 0,
        wickets: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        completedPlayers: []
      },
      currentPlayer: null
    };
    
    console.log('✅ Live score initialized:', score);
    setLiveScore(score);
    setActiveInningsTab(score.currentInnings);
  };

  const fetchAvailablePlayers = async (matchData) => {
    try {
      console.log('👥 Fetching available players');
      console.log('  - Match data:', matchData);
      console.log('  - battingFirst:', matchData.battingFirst);
      console.log('  - fieldingFirst:', matchData.fieldingFirst);
      
      const currentInnings = matchData.status === 'live' ? 2 : 1;
      const battingTeamId = currentInnings === 1 ? 
        matchData.battingFirst?._id || matchData.battingFirst?.id :
        matchData.fieldingFirst?._id || matchData.fieldingFirst?.id;
      
      console.log('  - Current innings:', currentInnings);
      console.log('  - Batting team ID:', battingTeamId);
      
      if (!battingTeamId) {
        console.error('❌ No batting team ID found');
        return;
      }
      
      const response = await playersAPI.getByTeam(battingTeamId);
      
      console.log('📦 Players API Response:', response.data);
      
      if (response.data.success) {
        const allPlayers = response.data.players || [];
        console.log('  - Total players from API:', allPlayers.length);
        console.log('  - All players:', allPlayers);
        
        // Log the structure of the first player to see what fields are available
        if (allPlayers.length > 0) {
          console.log('  - First player structure:', allPlayers[0]);
          console.log('  - First player keys:', Object.keys(allPlayers[0]));
        }
        
        // Filter out players who have already batted
        const currentInningsData = liveScore?.[`innings${currentInnings}`];
        const completedPlayerIds = currentInningsData?.completedPlayers?.map(p => {
          const playerId = p.player?.id || p.player?._id || p.playerId;
          console.log('  - Completed player ID:', playerId);
          return playerId;
        }) || [];
        
        console.log('  - Completed player IDs:', completedPlayerIds);
        
        const available = allPlayers.filter(p => {
          const pid = p.id || p._id;
          const isCompleted = completedPlayerIds.includes(pid);
          const pname = p.playerName || p.player_name || p.name || 'Unknown';
          console.log(`  - Player ${pname} (${pid}): ${isCompleted ? '❌ Already batted' : '✅ Available'}`);
          return !isCompleted;
        });
        
        console.log('✅ Available players for selection:', available.length);
        console.log('  - Players:', available.map(p => p.playerName || p.player_name || p.name));
        
        setAvailablePlayers(available);
        
        // If no players available and none selected, might need to end innings
        if (available.length === 0 && !currentPlayer) {
          console.log('⚠️ No players available and no current player - innings might need to end');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching players:', error);
      console.error('  - Error response:', error.response?.data);
    }
  };

  const handleSelectPlayer = async () => {
    if (!selectedPlayerId) {
      alert('Please select a player');
      return;
    }

    console.log('🎯 Selecting Player:');
    console.log('  - Match ID:', matchId);
    console.log('  - Player ID:', selectedPlayerId);
    console.log('  - Player ID type:', typeof selectedPlayerId);

    setProcessing(true);
    try {
      const requestData = {
        playerId: selectedPlayerId
      };
      
      console.log('📤 Sending request:', requestData);
      
      const response = await matchesAPI.selectPlayer(matchId, requestData);

      console.log('📦 Select Player Response:', response.data);

      if (response.data.success) {
        // FIXED: Set current player with proper structure
        const playerData = {
          id: response.data.player.id || response.data.player._id,
          playerName: response.data.player.playerName,
          position: response.data.player.position,
          photo: response.data.player.photo,
          stats: response.data.stats || {
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0
          }
        };
        
        console.log('✅ Setting current player:', playerData);
        setCurrentPlayer(playerData);
        setSelectedPlayerId(''); // Reset dropdown
        alert('Player selected successfully!');
      }
    } catch (error) {
      console.error('❌ Error selecting player:', error);
      console.error('  - Error message:', error.message);
      console.error('  - Response data:', error.response?.data);
      console.error('  - Status code:', error.response?.status);
      console.error('  - Full error:', error);
      
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.error || 
                       'Failed to select player. Please check the console for details.';
      alert(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const handleScoreRuns = async (runs) => {
    if (!currentPlayer) {
      showMessage('No player selected', 'warning');
      return;
    }

    console.log('🏏 Scoring runs:');
    console.log('  - Runs:', runs);
    console.log('  - Current player before:', currentPlayer);

    setProcessing(true);
    try {
      const response = await matchesAPI.scoreRuns(matchId, { runs });

      console.log('📦 Score runs response:', response.data);

      if (response.data.success) {
        // FIXED: Update both live score AND current player stats
        setLiveScore(prev => ({
          ...prev,
          [`innings${prev.currentInnings}`]: response.data.teamStats
        }));
        
        // CRITICAL: Update current player stats
        setCurrentPlayer(prev => ({
          ...prev,
          stats: response.data.playerStats
        }));
        
        console.log('✅ Updated stats:');
        console.log('  - Team stats:', response.data.teamStats);
        console.log('  - Player stats:', response.data.playerStats);
        
        if (runs === 4) showMessage('Boundary! +4 runs', 'success');
        else if (runs === 6) showMessage('Six! +6 runs', 'success');
        else if (runs > 0) showMessage(`+${runs} run${runs > 1 ? 's' : ''}`, 'info');
        else showMessage('Dot ball', 'info');
      }
    } catch (error) {
      console.error('Error scoring runs:', error);
      showMessage('Failed to score runs', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleScoreExtra = async (type) => {
    setProcessing(true);
    try {
      const response = await matchesAPI.scoreExtra(matchId, { type });

      if (response.data.success) {
        // Update team stats
        setLiveScore(prev => ({
          ...prev,
          [`innings${prev.currentInnings}`]: response.data.teamStats
        }));
        
        showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)}! +1 run`, 'warning');
      }
    } catch (error) {
      console.error('Error scoring extra:', error);
      showMessage('Failed to score extra', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handlePlayerOut = async () => {
    setShowOutModal(false);
    setProcessing(true);

    try {
      const response = await matchesAPI.playerOut(matchId);

      if (response.data.success) {
        // Update team stats
        setLiveScore(prev => ({
          ...prev,
          [`innings${prev.currentInnings}`]: response.data.teamStats
        }));
        
        // Clear current player
        setCurrentPlayer(null);
        showMessage('Player is out!', 'info');

        if (response.data.shouldEndInnings) {
          setTimeout(() => {
            if (window.confirm(`${response.data.endReason}. End innings now?`)) {
              handleEndInnings();
            }
          }, 1500);
        } else {
          showMessage(`${response.data.remainingPlayers} player(s) remaining`, 'success');
          setTimeout(() => {
            fetchMatchData();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error marking player out:', error);
      showMessage('Failed to mark player out', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleEndInnings = async () => {
    const currentInnings = liveScore.currentInnings;
    const confirmMessage = currentInnings === 1 ?
      'Are you sure you want to end the 1st innings?' :
      'Are you sure you want to end the 2nd innings and complete the match?';

    if (!window.confirm(confirmMessage)) return;

    setProcessing(true);
    try {
      const response = await matchesAPI.endInnings(matchId);

      if (response.data.success) {
        showMessage(response.data.message, 'success');
        setTimeout(() => {
          if (response.data.matchComplete) {
            navigate(`/matches/${matchId}`);
          } else {
            fetchMatchData();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error ending innings:', error);
      showMessage('Failed to end innings', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const calculateOvers = (balls) => {
    if (!balls) return '0.0';
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
  };

  const calculateStrikeRate = (runs, balls) => {
    if (!balls || balls === 0) return '0.00';
    return ((runs / balls) * 100).toFixed(2);
  };

  const calculateRunRate = (runs, balls) => {
    if (!balls || balls === 0) return '0.00';
    return ((runs / balls) * 6).toFixed(2);
  };

  const showMessage = (message, type) => {
    // You can implement a toast notification here
    // For now, using console
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading match...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !match) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger" style={{
            background: 'rgba(220, 53, 69, 0.1)',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            color: '#dc3545'
          }}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error || 'Match not found'}
          </div>
          <div className="mt-3">
            <button className="btn btn-outline-light me-2" onClick={() => navigate('/match')}>
              <i className="fas fa-plus me-2"></i>New Match
            </button>
            <button className="btn btn-outline-light" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!liveScore) return null;

  const currentInnings = liveScore.currentInnings;
  const innings = `innings${currentInnings}`;
  const currentBattingTeam = currentInnings === 1 ? match.battingFirst : match.fieldingFirst;
  const matchComplete = match.status === 'completed';

  return (
    <>
      <Navbar />

      {/* Match Info Bar */}
      <div style={{
        background: 'rgba(26, 26, 46, 0.95)',
        borderBottom: '1px solid rgba(252, 184, 82, 0.3)',
        padding: '15px 0'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={currentBattingTeam?.logo} 
                  alt="Team Logo"
                  style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                />
                <span className="text-white">{currentBattingTeam?.name}</span>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <span className="badge bg-warning text-dark">
                {currentInnings === 1 ? '1st' : '2nd'} Innings
              </span>
            </div>
            <div className="col-md-4 text-end">
              <span className="text-white">
                {liveScore[innings].runs}/{liveScore[innings].wickets} ({calculateOvers(liveScore[innings].balls)} overs)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row">
          {/* Main Scoring Area */}
          <div className="col-lg-8">
            {!matchComplete ? (
              <>
                {/* Player Selection */}
                {!currentPlayer && (
                  <div className="mb-4" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px',
                    padding: '20px',
                    border: '1px solid rgba(252, 184, 82, 0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h5 style={{ color: '#fcb852', margin: 0 }}>
                        <i className="fas fa-user-check me-2"></i>
                        Select Next Batsman from {currentBattingTeam?.name}
                      </h5>
                      <button
                        className="btn btn-sm btn-outline-light"
                        onClick={() => fetchMatchData()}
                        disabled={processing}
                        title="Refresh players list"
                      >
                        <i className="fas fa-sync-alt me-1"></i>
                        Refresh
                      </button>
                    </div>

                    {availablePlayers.length > 0 ? (
                      <>
                        <select
                          className="form-select mb-3"
                          value={selectedPlayerId}
                          onChange={(e) => {
                            const newPlayerId = e.target.value;
                            console.log('🔵 Player dropdown changed:', newPlayerId);
                            setSelectedPlayerId(newPlayerId);
                          }}
                          style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            color: 'white',
                            border: '1px solid rgba(252, 184, 82, 0.3)'
                          }}
                          disabled={processing}
                        >
                          <option value="">Choose player...</option>
                          {availablePlayers.map(player => {
                            const playerId = player.id || player._id;
                            // FIXED: Try all possible field names for player name
                            const playerName = player.playerName || player.player_name || player.name || 'Unknown Player';
                            const position = player.position || 'Player';
                            
                            console.log('  - Dropdown option:', { 
                              playerId, 
                              playerName, 
                              position,
                              rawPlayer: player 
                            });
                            
                            return (
                              <option key={playerId} value={playerId}>
                                {playerName} ({position})
                              </option>
                            );
                          })}
                        </select>
                        <button
                          className="btn btn-warning"
                          onClick={handleSelectPlayer}
                          disabled={!selectedPlayerId || processing}
                        >
                          {processing ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Loading...</>
                          ) : (
                            <><i className="fas fa-check me-2"></i>Confirm Player</>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="alert alert-warning">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          No more players available. Please end this innings.
                        </div>
                        <button
                          className="btn btn-outline-light w-100"
                          onClick={handleEndInnings}
                          disabled={processing}
                        >
                          <i className="fas fa-exchange-alt me-2"></i>End Innings
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Scoreboard - Rest of the component remains the same... */}
                {currentPlayer && (
                  <div className="mb-4">
                    {/* Team Score Display */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '15px',
                      padding: '20px',
                      marginBottom: '20px',
                      border: '1px solid rgba(252, 184, 82, 0.2)'
                    }}>
                      <div className="row">
                        <div className="col-md-6">
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: '15px'
                          }}>
                            <img
                              src={currentBattingTeam?.logo}
                              alt="Team Logo"
                              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                            />
                            <div>
                              <h4 className="text-white mb-0">{currentBattingTeam?.name}</h4>
                              <span className="badge bg-success">BATTING</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fcb852' }}>
                            {liveScore[innings].runs}/{liveScore[innings].wickets}
                          </div>
                          <div className="text-muted">
                            ({calculateOvers(liveScore[innings].balls)} overs)
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="row text-center">
                            <div className="col-3">
                              <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {liveScore[innings].fours}
                              </div>
                              <small className="text-muted">Fours</small>
                            </div>
                            <div className="col-3">
                              <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {liveScore[innings].sixes}
                              </div>
                              <small className="text-muted">Sixes</small>
                            </div>
                            <div className="col-3">
                              <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {calculateRunRate(liveScore[innings].runs, liveScore[innings].balls)}
                              </div>
                              <small className="text-muted">Run Rate</small>
                            </div>
                            <div className="col-3">
                              <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {liveScore[innings].balls}
                              </div>
                              <small className="text-muted">Balls</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Player Card */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '15px',
                      padding: '20px',
                      marginBottom: '20px',
                      border: '1px solid rgba(252, 184, 82, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <img
                          src={currentPlayer.photo}
                          alt="Player"
                          style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #fcb852' }}
                        />
                        <div>
                          <h5 className="text-white mb-0">{currentPlayer.playerName}</h5>
                          <span className="text-muted">{currentPlayer.position}</span>
                        </div>
                      </div>
                      <div className="row text-center">
                        <div className="col">
                          <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {currentPlayer.stats?.runs || 0}
                          </div>
                          <small className="text-muted">Runs</small>
                        </div>
                        <div className="col">
                          <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {currentPlayer.stats?.balls || 0}
                          </div>
                          <small className="text-muted">Balls</small>
                        </div>
                        <div className="col">
                          <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {currentPlayer.stats?.fours || 0}
                          </div>
                          <small className="text-muted">4s</small>
                        </div>
                        <div className="col">
                          <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {currentPlayer.stats?.sixes || 0}
                          </div>
                          <small className="text-muted">6s</small>
                        </div>
                        <div className="col">
                          <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {calculateStrikeRate(currentPlayer.stats?.runs || 0, currentPlayer.stats?.balls || 0)}
                          </div>
                          <small className="text-muted">S/R</small>
                        </div>
                      </div>
                    </div>

                    {/* Scoring Panel */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '15px',
                      padding: '20px',
                      border: '1px solid rgba(252, 184, 82, 0.2)'
                    }}>
                      <h6 className="mb-3" style={{ color: '#fcb852' }}>
                        <i className="fas fa-calculator me-2"></i>Score Runs
                      </h6>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '15px' }}>
                        {[0, 1, 2, 3, 4, 6].map(runs => (
                          <button
                            key={runs}
                            className="btn btn-outline-light"
                            style={{
                              padding: '15px',
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              ...(runs === 4 && { background: 'rgba(40, 167, 69, 0.2)', borderColor: '#28a745' }),
                              ...(runs === 6 && { background: 'rgba(220, 53, 69, 0.2)', borderColor: '#dc3545' })
                            }}
                            onClick={() => handleScoreRuns(runs)}
                            disabled={processing}
                          >
                            {runs}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleScoreExtra('wide')}
                          disabled={processing}
                        >
                          <i className="fas fa-arrow-right me-1"></i>Wide
                        </button>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleScoreExtra('noball')}
                          disabled={processing}
                        >
                          <i className="fas fa-ban me-1"></i>No Ball
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const byeRuns = prompt('How many bye runs? (1-6)');
                            if (byeRuns && !isNaN(byeRuns) && byeRuns >= 1 && byeRuns <= 6) {
                              handleScoreExtra('bye', parseInt(byeRuns));
                            }
                          }}
                          disabled={processing}
                        >
                          <i className="fas fa-running me-1"></i>Bye
                        </button>
                      </div>

                      <button
                        className="btn btn-danger btn-lg w-100 mb-3"
                        onClick={() => setShowOutModal(true)}
                        disabled={processing}
                      >
                        <i className="fas fa-times me-2"></i>OUT
                      </button>

                      <button
                        className="btn btn-outline-light w-100"
                        onClick={handleEndInnings}
                        disabled={processing}
                      >
                        <i className="fas fa-exchange-alt me-2"></i>End Innings
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Match Summary - keeping original code */
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '15px',
                padding: '30px',
                border: '1px solid rgba(252, 184, 82, 0.2)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#fcb852', marginBottom: '20px' }}>
                  <i className="fas fa-trophy me-2"></i>Match Complete
                </h3>
                <h4 style={{ color: '#fcb852', marginBottom: '20px' }}>
                  {match.resultText}
                </h4>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                  <button
                    className="btn btn-warning"
                    onClick={() => navigate('/match')}
                  >
                    <i className="fas fa-plus me-2"></i>New Match
                  </button>
                  <button
                    className="btn btn-outline-light"
                    onClick={() => navigate('/dashboard')}
                  >
                    <i className="fas fa-chart-bar me-2"></i>Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side Scoreboard - keeping rest of the component as is */}
          <div className="col-lg-4">
            <div style={{
              position: 'sticky',
              top: '20px',
              background: 'rgba(26, 26, 46, 0.95)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto'
            }}>
              <h5 className="text-center mb-3" style={{ color: '#fcb852' }}>
                <i className="fas fa-list-alt me-2"></i>Match Scorecard
              </h5>

              {/* Innings Tabs */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  className={`btn ${activeInningsTab === 1 ? 'btn-warning' : 'btn-outline-light'}`}
                  style={{ flex: 1 }}
                  onClick={() => setActiveInningsTab(1)}
                >
                  1st Innings
                </button>
                <button
                  className={`btn ${activeInningsTab === 2 ? 'btn-warning' : 'btn-outline-light'}`}
                  style={{ flex: 1 }}
                  onClick={() => setActiveInningsTab(2)}
                >
                  2nd Innings
                </button>
              </div>

              {/* Innings Display */}
              {[1, 2].map(inningsNum => (
                <div
                  key={inningsNum}
                  style={{ display: activeInningsTab === inningsNum ? 'block' : 'none' }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px',
                    paddingBottom: '10px',
                    borderBottom: '2px solid rgba(139, 92, 246, 0.3)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={inningsNum === 1 ? match.battingFirst?.logo : match.fieldingFirst?.logo}
                        alt="Team"
                        style={{ width: '35px', height: '35px', borderRadius: '50%' }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '16px', color: '#fcb852' }}>
                        {inningsNum === 1 ? match.battingFirst?.name : match.fieldingFirst?.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                      {liveScore[`innings${inningsNum}`].runs}/{liveScore[`innings${inningsNum}`].wickets}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    fontSize: '13px'
                  }}>
                    <span className="text-muted">
                      Overs: <strong className="text-white">{calculateOvers(liveScore[`innings${inningsNum}`].balls)}</strong>
                    </span>
                    <span className="text-muted">
                      4s: <strong className="text-white">{liveScore[`innings${inningsNum}`].fours}</strong>
                    </span>
                    <span className="text-muted">
                      6s: <strong className="text-white">{liveScore[`innings${inningsNum}`].sixes}</strong>
                    </span>
                    <span className="text-muted">
                      R/R: <strong className="text-white">{calculateRunRate(liveScore[`innings${inningsNum}`].runs, liveScore[`innings${inningsNum}`].balls)}</strong>
                    </span>
                  </div>

                  {/* Batting Scorecard */}
                  <div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr',
                      gap: '8px',
                      padding: '10px 8px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#fcb852',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      <div>Batsman</div>
                      <div style={{ textAlign: 'center' }}>R</div>
                      <div style={{ textAlign: 'center' }}>B</div>
                      <div style={{ textAlign: 'center' }}>4s</div>
                      <div style={{ textAlign: 'center' }}>6s</div>
                      <div style={{ textAlign: 'center' }}>S/R</div>
                    </div>

                    {liveScore[`innings${inningsNum}`].completedPlayers?.length > 0 ? (
                      liveScore[`innings${inningsNum}`].completedPlayers.map((cp, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr',
                            gap: '8px',
                            padding: '12px 8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '8px',
                            marginBottom: '6px',
                            fontSize: '13px'
                          }}
                        >
                          <div className="text-white">{cp.player.playerName}</div>
                          <div className="text-center text-muted">{cp.stats.runs}</div>
                          <div className="text-center text-muted">{cp.stats.balls}</div>
                          <div className="text-center text-muted">{cp.stats.fours}</div>
                          <div className="text-center text-muted">{cp.stats.sixes}</div>
                          <div className="text-center text-muted">
                            {calculateStrikeRate(cp.stats.runs, cp.stats.balls)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontStyle: 'italic' }}>
                        {inningsNum === 2 && currentInnings === 1 ? 'Not started yet' : 'No batsmen yet'}
                      </div>
                    )}

                    {/* Current Batsman */}
                    {currentInnings === inningsNum && currentPlayer && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr',
                          gap: '8px',
                          padding: '12px 8px',
                          background: 'rgba(139, 92, 246, 0.15)',
                          borderRadius: '8px',
                          marginBottom: '6px',
                          fontSize: '13px',
                          borderLeft: '3px solid #fcb852'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#fcb852' }}>
                          {currentPlayer.playerName} *
                        </div>
                        <div style={{ textAlign: 'center', color: '#fcb852', fontWeight: 600 }}>
                          {currentPlayer.stats?.runs || 0}
                        </div>
                        <div style={{ textAlign: 'center', color: '#fcb852', fontWeight: 600 }}>
                          {currentPlayer.stats?.balls || 0}
                        </div>
                        <div style={{ textAlign: 'center', color: '#fcb852', fontWeight: 600 }}>
                          {currentPlayer.stats?.fours || 0}
                        </div>
                        <div style={{ textAlign: 'center', color: '#fcb852', fontWeight: 600 }}>
                          {currentPlayer.stats?.sixes || 0}
                        </div>
                        <div style={{ textAlign: 'center', color: '#fcb852', fontWeight: 600 }}>
                          {calculateStrikeRate(currentPlayer.stats?.runs || 0, currentPlayer.stats?.balls || 0)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Target Info for 2nd Innings */}
                  {inningsNum === 2 && (currentInnings === 2 || matchComplete) && (
                    <div style={{
                      background: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid rgba(255, 193, 7, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#ffc107', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Target
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginTop: '5px' }}>
                        {liveScore.innings1.runs + 1} runs
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Out Modal */}
      {showOutModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowOutModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ background: '#1a1a2e', color: 'white', border: '1px solid rgba(252, 184, 82, 0.3)' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h5 className="modal-title">
                  <i className="fas fa-times-circle me-2" style={{ color: '#dc3545' }}></i>
                  Player Out
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOutModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure <strong>{currentPlayer?.playerName}</strong> is out?</p>
                <div className="row text-center mt-3">
                  <div className="col-3">
                    <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {currentPlayer?.stats?.runs || 0}
                    </div>
                    <small className="text-muted">Runs</small>
                  </div>
                  <div className="col-3">
                    <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {currentPlayer?.stats?.balls || 0}
                    </div>
                    <small className="text-muted">Balls</small>
                  </div>
                  <div className="col-3">
                    <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {currentPlayer?.stats?.fours || 0}
                    </div>
                    <small className="text-muted">4s</small>
                  </div>
                  <div className="col-3">
                    <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {currentPlayer?.stats?.sixes || 0}
                    </div>
                    <small className="text-muted">6s</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOutModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handlePlayerOut}
                  disabled={processing}
                >
                  {processing ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                  ) : (
                    <><i className="fas fa-check me-2"></i>Confirm Out</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <i className="fas fa-cricket me-1"></i>
                <strong>Live Scoreboard:</strong> Real-time cricket match scoring and tracking.
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

export default Board;