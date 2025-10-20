import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import { teamsAPI, playersAPI, imageToBase64 } from '../services/api';
import '../assets/css/TeamForm.css';

const TeamForm = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    playerName: '',
    position: '',
    contact: '',
    email: '',
    description: '',
    photo: null,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  // Fetch team and players on mount
  useEffect(() => {
    if (teamId) {
      fetchTeamAndPlayers();
    }
  }, [teamId]);

  // Fetch team details and players
  const fetchTeamAndPlayers = async () => {
    try {
      setLoading(true);
      
      // Fetch team details
      const teamResponse = await teamsAPI.getById(teamId);
      if (teamResponse.data.success) {
        setTeam(teamResponse.data.team);
      }
      
      // Fetch players
      const playersResponse = await playersAPI.getByTeam(teamId);
      if (playersResponse.data.success) {
        setPlayers(playersResponse.data.players);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, photo: 'File size must be less than 5MB' }));
        return;
      }
      
      setFormData((prev) => ({ ...prev, photo: file }));
      setFormErrors((prev) => ({ ...prev, photo: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.playerName.trim()) errors.playerName = 'Player name is required';
    if (!formData.position) errors.position = 'Position is required';
    
    // Photo required only for new players
    if (!editingPlayer && !formData.photo) {
      errors.photo = 'Player photo is required';
    }
    
    // Optional email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open modal for add/edit
  const openPlayerModal = (player = null) => {
    if (player) {
      // Editing existing player
      setEditingPlayer(player);
      setFormData({
        playerName: player.player_name,
        position: player.position,
        contact: player.contact || '',
        email: player.email || '',
        description: player.description || '',
        photo: null,
      });
      setPhotoPreview(player.photo);
    } else {
      // Adding new player
      setEditingPlayer(null);
      setFormData({
        playerName: '',
        position: '',
        contact: '',
        email: '',
        description: '',
        photo: null,
      });
      setPhotoPreview(null);
    }
    setFormErrors({});
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      let photoBase64 = null;
      
      // Convert photo to base64 if new file is selected
      if (formData.photo) {
        photoBase64 = await imageToBase64(formData.photo);
      }

      const playerData = {
        team_id: teamId,
        player_name: formData.playerName,
        position: formData.position,
        contact: formData.contact,
        email: formData.email,
        description: formData.description,
      };

      // Only include photo if new file was selected
      if (photoBase64) {
        playerData.photo = photoBase64;
      }

      let response;
      if (editingPlayer) {
        // Update existing player
        response = await playersAPI.update(editingPlayer.id, playerData);
      } else {
        // Create new player
        response = await playersAPI.create(playerData);
      }

      if (response.data.success) {
        alert(response.data.message);
        setShowModal(false);
        fetchTeamAndPlayers(); // Refresh players list
      }
    } catch (error) {
      console.error('Player operation error:', error);
      const message = error.response?.data?.message || 'Failed to save player';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete player
  const handleDelete = async (playerId, playerName) => {
    if (!window.confirm(`Are you sure you want to delete "${playerName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await playersAPI.delete(playerId);
      if (response.data.success) {
        alert(response.data.message);
        fetchTeamAndPlayers(); // Refresh players list
      }
    } catch (error) {
      console.error('Delete player error:', error);
      alert('Failed to delete player');
    }
  };

  // Handle export players
  const handleExport = async () => {
    try {
      const response = await playersAPI.export(teamId);
      if (response.data.success) {
        const dataStr = JSON.stringify(response.data.players, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${team.name}_players_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('Players data exported successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export players');
    }
  };

  // Handle clear all players
  const handleClearAll = async () => {
    if (!window.confirm(`Are you sure you want to delete ALL players from "${team?.name}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const response = await playersAPI.clearTeam(teamId);
      if (response.data.success) {
        alert(response.data.message);
        fetchTeamAndPlayers();
      }
    } catch (error) {
      console.error('Clear all error:', error);
      alert('Failed to clear players');
    }
  };

  return (
    <>
      <Navbar />

      <section className="container py-4">
        {/* Team Header */}
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
            {loading ? (
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm text-warning me-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h2 className="mb-0" style={{ color: 'var(--accent)' }}>Loading...</h2>
              </div>
            ) : team ? (
              <div className="d-flex align-items-center">
                <img 
                  src={team.logo} 
                  alt="Team Logo" 
                  className="team-header-logo me-3"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23fcb852%22 width=%2280%22 height=%2280%22/%3E%3Ctext x=%2240%22 y=%2250%22 text-anchor=%22middle%22 fill=%22%23000%22 font-size=%2240%22%3ET%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div>
                  <h2 className="mb-1" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {team.name}
                  </h2>
                  <p className="mb-0 text-muted">
                    {team.description} | Captain: {team.captain}
                  </p>
                </div>
              </div>
            ) : (
              <h2 className="mb-0 text-muted">Team not found</h2>
            )}
          </div>
          <div className="col-auto">
            <span className="badge bg-secondary">
              {players.length} Player{players.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Players Section */}
        {team && (
          <>
            <div className="row align-items-center mb-4">
              <div className="col-md-8">
                <h4 style={{ color: 'var(--accent)', fontWeight: 600 }}>Team Players</h4>
                <p className="text-muted mb-0">Manage team roster and player details</p>
              </div>
              <div className="col-md-4 text-end">
                <Dropdown>
                  <Dropdown.Toggle variant="outline-light" size="sm">
                    <i className="fas fa-cog"></i> Manage
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item onClick={handleExport}>
                      <i className="fas fa-download"></i> Export Players
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item className="text-danger" onClick={handleClearAll}>
                      <i className="fas fa-trash"></i> Clear All Players
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            {/* Players Table */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-users fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No players added yet</h5>
                <p className="text-muted">Click the + button to add your first player to this team</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover">
                  <thead>
                    <tr style={{ color: 'var(--accent)' }}>
                      <th><i className="fas fa-image me-1"></i> Photo</th>
                      <th><i className="fas fa-user me-1"></i> Name</th>
                      <th><i className="fas fa-baseball-ball me-1"></i> Position</th>
                      <th><i className="fas fa-phone me-1"></i> Contact</th>
                      <th><i className="fas fa-info-circle me-1"></i> Description</th>
                      <th><i className="fas fa-calendar me-1"></i> Added</th>
                      <th><i className="fas fa-cogs me-1"></i> Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr key={player.id}>
                        <td>
                          <img 
                            src={player.photo} 
                            alt={player.player_name} 
                            className="player-photo"
                            onError={(e) => {
                              const initial = player.player_name.charAt(0).toUpperCase();
                              e.target.src = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Ccircle cx=%2225%22 cy=%2225%22 r=%2225%22 fill=%22%23fcb852%22/%3E%3Ctext x=%2225%22 y=%2230%22 text-anchor=%22middle%22 fill=%22%23000%22 font-size=%2220%22%3E${initial}%3C/text%3E%3C/svg%3E`;
                            }}
                          />
                        </td>
                        <td>
                          <div className="player-name">{player.player_name}</div>
                          {player.email && (
                            <small className="text-muted">{player.email}</small>
                          )}
                        </td>
                        <td>
                          <span className="position-badge">{player.position}</span>
                        </td>
                        <td>
                          <span className="contact-text">
                            {player.contact || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="description-text" 
                            title={player.description}
                          >
                            {player.description || 'No description'}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {player.createdDate || 'N/A'}
                          </small>
                        </td>
                        <td>
                          <button 
                            className="btn action-btn btn-edit me-2"
                            onClick={() => openPlayerModal(player)}
                            title="Edit Player"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn action-btn btn-delete"
                            onClick={() => handleDelete(player.id, player.player_name)}
                            title="Delete Player"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Floating Add Button */}
            <button 
              className="btn rounded-circle shadow-lg"
              onClick={() => openPlayerModal()}
              title="Add New Player"
              style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '60px',
                height: '60px',
                backgroundColor: '#fcb852',
                color: '#000',
                border: 'none',
                fontSize: '24px',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(252, 184, 82, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
              }}
            >
              <i className="fas fa-plus"></i>
            </button>
          </>
        )}
      </section>

      {/* Add/Edit Player Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header 
          closeButton 
          style={{ 
            background: 'var(--card)', 
            borderBottom: '1px solid rgba(255,255,255,0.1)' 
          }}
        >
          <Modal.Title style={{ color: 'var(--accent)' }}>
            <i className={`fas ${editingPlayer ? 'fa-edit' : 'fa-user-plus'} me-2`}></i>
            {editingPlayer ? 'Edit Player' : 'Add New Player'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--card)', color: 'white' }}>
          <form onSubmit={handleSubmit} id="playerForm">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-user me-1"></i>
                    Player Name *
                  </label>
                  <input
                    type="text"
                    name="playerName"
                    className="form-control"
                    maxLength="50"
                    placeholder="Enter player name"
                    value={formData.playerName}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {formErrors.playerName && (
                    <small className="text-danger">{formErrors.playerName}</small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-baseball-ball me-1"></i>
                    Position/Role *
                  </label>
                  <select
                    name="position"
                    className="form-select"
                    value={formData.position}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">Select position...</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                    <option value="Captain">Captain</option>
                    <option value="Vice-Captain">Vice-Captain</option>
                  </select>
                  {formErrors.position && (
                    <small className="text-danger">{formErrors.position}</small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-phone me-1"></i>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    className="form-control"
                    maxLength="15"
                    placeholder="Enter contact number"
                    value={formData.contact}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-envelope me-1"></i>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {formErrors.email && (
                    <small className="text-danger">{formErrors.email}</small>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-image me-1"></i>
                    Player Photo {!editingPlayer && '*'}
                  </label>
                  <input
                    type="file"
                    name="photo"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={submitting}
                  />
                  {formErrors.photo && (
                    <small className="text-danger d-block">{formErrors.photo}</small>
                  )}
                  <small className="text-muted">Max file size: 5MB</small>
                  
                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="mt-2">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="preview-img"
                        style={{
                          width: '100%',
                          maxWidth: '200px',
                          height: 'auto',
                          borderRadius: '10px',
                          border: '2px solid var(--accent)'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-info-circle me-1"></i>
                    Description/Notes
                  </label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    maxLength="200"
                    placeholder="Brief description about the player"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={submitting}
                  ></textarea>
                  <small className="text-muted">Maximum 200 characters</small>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer 
          style={{ 
            background: 'var(--card)', 
            borderTop: '1px solid rgba(255,255,255,0.1)' 
          }}
        >
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)} 
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            variant="warning" 
            onClick={handleSubmit} 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {editingPlayer ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                {editingPlayer ? 'Update Player' : 'Save Player'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Info Footer */}
      <div className="container-fluid mt-5 py-3" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <small className="text-muted">
                <i className="fas fa-database me-1"></i>
                <strong>Player Management:</strong> Add, edit, and manage individual players for each team.
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

export default TeamForm;