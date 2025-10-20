import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { matchesAPI } from '../services/api';

const MatchDetails = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Match ID from params:', matchId);
    console.log('Type:', typeof matchId);
    
    // Validate matchId before making API call
    if (matchId && matchId !== 'undefined' && matchId !== 'null') {
      fetchMatchDetails();
    } else {
      setError('Invalid match ID - Please select a match from the dashboard');
      setLoading(false);
    }
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching match details for ID:', matchId);
      const response = await matchesAPI.getById(matchId);
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setMatch(response.data.match);
      } else {
        setError('Match not found');
      }
    } catch (error) {
      console.error('Error fetching match details:', error);
      setError(error.response?.data?.message || 'Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOvers = (balls) => {
    if (!balls) return '0.0';
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-success',
      live: 'bg-danger',
      setup: 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
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
            <p className="text-muted mt-3">Loading match details...</p>
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
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error || 'Match not found'}
          </div>
          <button 
            className="btn btn-outline-light"
            onClick={() => navigate('/dashboard')}
          >
            <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container py-5">
        {/* Back Button */}
        <div className="mb-4">
          <button 
            className="btn btn-outline-light"
            onClick={() => navigate('/dashboard')}
          >
            <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
          </button>
        </div>

        {/* Match Header */}
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(252, 184, 82, 0.1), rgba(252, 184, 82, 0.05))',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            border: '1px solid rgba(252, 184, 82, 0.3)'
          }}
        >
          <div className="row align-items-center">
            {/* Team 1 */}
            <div className="col-md-4 text-center">
              <img 
                src={match.team1?.logo || 'https://via.placeholder.com/80'}
                alt={match.team1?.name || 'Team 1'}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid #fcb852',
                  marginBottom: '10px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23fcb852%22 width=%2280%22 height=%2280%22/%3E%3Ctext x=%2240%22 y=%2250%22 text-anchor=%22middle%22 fill=%22%23000%22 font-size=%2240%22%3ET%3C/text%3E%3C/svg%3E';
                }}
              />
              <h5 className="text-white">{match.team1?.name || 'Team 1'}</h5>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fcb852' }}>
                {match.innings1Score?.runs || 0}/{match.innings1Score?.wickets || 0}
              </div>
              {match.innings1Score?.balls > 0 && (
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                  ({calculateOvers(match.innings1Score.balls)} overs)
                </div>
              )}
            </div>

            {/* VS & Status */}
            <div className="col-md-4 text-center">
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fcb852' }}>
                VS
              </div>
              <div className="mt-2">
                <span className={`badge ${getStatusBadge(match.status)}`}>
                  {match.status === 'live' && <i className="fas fa-circle fa-xs me-1"></i>}
                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                </span>
              </div>
              <small className="text-muted d-block mt-2">
                {formatDate(match.createdAt)}
              </small>
              {match.status === 'completed' && match.resultText && (
                <div 
                  className="mt-3"
                  style={{
                    background: 'rgba(252, 184, 82, 0.2)',
                    padding: '10px',
                    borderRadius: '8px'
                  }}
                >
                  <strong style={{ color: '#fcb852' }}>{match.resultText}</strong>
                  {match.winner && (
                    <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.85rem' }}>
                      Congratulations to {match.winner.name}!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div className="col-md-4 text-center">
              <img 
                src={match.team2?.logo || 'https://via.placeholder.com/80'}
                alt={match.team2?.name || 'Team 2'}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid #fcb852',
                  marginBottom: '10px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23fcb852%22 width=%2280%22 height=%2280%22/%3E%3Ctext x=%2240%22 y=%2250%22 text-anchor=%22middle%22 fill=%22%23000%22 font-size=%2240%22%3ET%3C/text%3E%3C/svg%3E';
                }}
              />
              <h5 className="text-white">{match.team2?.name || 'Team 2'}</h5>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fcb852' }}>
                {match.innings2Score?.runs || 0}/{match.innings2Score?.wickets || 0}
              </div>
              {match.innings2Score?.balls > 0 && (
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                  ({calculateOvers(match.innings2Score.balls)} overs)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(252, 184, 82, 0.2)'
              }}
            >
              <h4 style={{ color: '#fcb852', fontWeight: 600 }} className="mb-3">
                <i className="fas fa-info-circle me-2"></i>Match Information
              </h4>
              
              <div className="mb-3">
                <strong style={{ color: '#fcb852' }}>Toss Winner:</strong>
                <div className="text-white">
                  {match.tossWinner?.name || 'N/A'}
                </div>
              </div>

              <div className="mb-3">
                <strong style={{ color: '#fcb852' }}>Toss Decision:</strong>
                <div className="text-white">
                  Chose to {match.tossChoice || 'N/A'} first
                </div>
              </div>

              <div className="mb-3">
                <strong style={{ color: '#fcb852' }}>Coin Result:</strong>
                <div className="text-white">
                  {match.coinResult ? match.coinResult.toUpperCase() : 'N/A'}
                </div>
              </div>

              <div className="mb-3">
                <strong style={{ color: '#fcb852' }}>Batting First:</strong>
                <div className="text-white">
                  {match.battingFirst?.name || 'N/A'}
                </div>
              </div>

              <div className="mb-3">
                <strong style={{ color: '#fcb852' }}>Fielding First:</strong>
                <div className="text-white">
                  {match.fieldingFirst?.name || 'N/A'}
                </div>
              </div>

              {match.status === 'completed' && match.completedAt && (
                <div>
                  <strong style={{ color: '#fcb852' }}>Completed:</strong>
                  <div className="text-white">
                    {formatDate(match.completedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Innings Details */}
          <div className="col-md-6 mb-4">
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(252, 184, 82, 0.2)'
              }}
            >
              <h4 style={{ color: '#fcb852', fontWeight: 600 }} className="mb-3">
                <i className="fas fa-chart-bar me-2"></i>Innings Summary
              </h4>

              {/* 1st Innings */}
              <div className="mb-4">
                <h6 style={{ color: '#28a745' }}>1st Innings - {match.battingFirst?.name}</h6>
                <div className="row text-center">
                  <div className="col-3">
                    <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {match.innings1Score?.runs || 0}
                    </div>
                    <small className="text-muted">Runs</small>
                  </div>
                  <div className="col-3">
                    <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {match.innings1Score?.wickets || 0}
                    </div>
                    <small className="text-muted">Wickets</small>
                  </div>
                  <div className="col-3">
                    <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {match.innings1Score?.fours || 0}
                    </div>
                    <small className="text-muted">4s</small>
                  </div>
                  <div className="col-3">
                    <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {match.innings1Score?.sixes || 0}
                    </div>
                    <small className="text-muted">6s</small>
                  </div>
                </div>
              </div>

              {/* 2nd Innings */}
              {match.innings2Score && (
                <div>
                  <h6 style={{ color: '#dc3545' }}>2nd Innings - {match.fieldingFirst?.name}</h6>
                  <div className="row text-center">
                    <div className="col-3">
                      <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {match.innings2Score.runs || 0}
                      </div>
                      <small className="text-muted">Runs</small>
                    </div>
                    <div className="col-3">
                      <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {match.innings2Score.wickets || 0}
                      </div>
                      <small className="text-muted">Wickets</small>
                    </div>
                    <div className="col-3">
                      <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {match.innings2Score.fours || 0}
                      </div>
                      <small className="text-muted">4s</small>
                    </div>
                    <div className="col-3">
                      <div style={{ color: '#fcb852', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {match.innings2Score.sixes || 0}
                      </div>
                      <small className="text-muted">6s</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="row mt-4">
          <div className="col-12 text-center">
            {match.status === 'live' && (
              <button 
                className="btn btn-warning me-3"
                onClick={() => navigate(`/board/${match._id}`)}
              >
                <i className="fas fa-play me-2"></i>Continue Match
              </button>
            )}
            {match.status === 'completed' && (
              <button 
                className="btn btn-outline-light me-3"
                onClick={() => navigate('/match')}
              >
                <i className="fas fa-plus me-2"></i>New Match
              </button>
            )}
            <button 
              className="btn btn-outline-light"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-chart-bar me-2"></i>Dashboard
            </button>
          </div>
        </div>
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
                <i className="fas fa-info-circle me-1"></i>
                <strong>Match Details:</strong> View complete match information, scores, and results.
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

export default MatchDetails;