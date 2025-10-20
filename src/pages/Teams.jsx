import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import { teamsAPI, imageToBase64 } from '../services/api';
import '../assets/css/Team.css';

const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    captain: '',
    description: '',
    logo: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch all teams
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
        setFormErrors((prev) => ({ ...prev, logo: 'File size must be less than 5MB' }));
        return;
      }
      setFormData((prev) => ({ ...prev, logo: file }));
      setFormErrors((prev) => ({ ...prev, logo: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Team name is required';
    if (!formData.captain.trim()) errors.captain = 'Captain name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.logo) errors.logo = 'Team logo is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Convert logo to base64
      const logoBase64 = await imageToBase64(formData.logo);

      const teamData = {
        name: formData.name,
        captain: formData.captain,
        description: formData.description,
        logo: logoBase64,
      };

      const response = await teamsAPI.create(teamData);

      if (response.data.success) {
        alert(response.data.message);
        setShowModal(false);
        setFormData({ name: '', captain: '', description: '', logo: null });
        fetchTeams(); // Refresh teams list
      }
    } catch (error) {
      console.error('Create team error:', error);
      const message = error.response?.data?.message || 'Failed to create team';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete team
  const handleDelete = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to delete "${teamName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await teamsAPI.delete(teamId);
      if (response.data.success) {
        alert(response.data.message);
        fetchTeams(); // Refresh teams list
      }
    } catch (error) {
      console.error('Delete team error:', error);
      alert('Failed to delete team');
    }
  };

  // Handle view team (navigate to players page)
  const handleViewTeam = (teamId) => {
    navigate(`/teams/${teamId}/players`);
  };

  // Handle export teams
  const handleExport = async () => {
    try {
      const response = await teamsAPI.export();
      if (response.data.success) {
        const dataStr = JSON.stringify(response.data.teams, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cricket_teams_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('Teams data exported successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export teams');
    }
  };

  // Handle clear all teams
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL teams?\n\nThis action cannot be undone!')) {
      return;
    }
    if (!window.confirm('This will permanently delete all team data. Are you absolutely sure?')) {
      return;
    }

    try {
      const response = await teamsAPI.clearAll();
      if (response.data.success) {
        alert(response.data.message);
        fetchTeams();
      }
    } catch (error) {
      console.error('Clear all error:', error);
      alert('Failed to clear teams');
    }
  };

  return (
    <>
      <Navbar />

      <section className="container py-5 position-relative">
        {/* Header */}
        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <h2 className="mb-2" style={{ color: 'var(--accent)', fontWeight: 700 }}>
              Our Cricket Teams
            </h2>
            <p className="mb-0" style={{ color: 'var(--muted)' }}>
              Explore all registered teams, their players, and match stats.
              <span className="badge bg-secondary ms-2">
                {teams.length} Team{teams.length !== 1 ? 's' : ''}
              </span>
            </p>
          </div>
          <div className="col-md-6 text-end">
            <div className="dropdown d-inline-block">
              <button
                className="btn btn-outline-light dropdown-toggle btn-sm"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-cog"></i> Manage
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExport(); }}>
                    <i className="fas fa-download"></i> Export Teams
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleClearAll(); }}>
                    <i className="fas fa-trash"></i> Clear All Teams
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="col-12 text-center">
            <div className="py-5">
              <h4 style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
                No teams added yet
              </h4>
              <p style={{ color: 'var(--muted)' }}>
                Click the + button to add your first team
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-4" id="teamContainer">
            {teams.map((team) => (
              <div className="col-md-6 col-lg-4 mb-4" key={team.id}>
                <div className="card h-100 d-flex flex-row align-items-center position-relative">
                  <img
                    src={team.logo}
                    className="team-logo me-3"
                    alt="Team Logo"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Crect width=%2260%22 height=%2260%22 fill=%22%23fcb852%22/%3E%3Ctext x=%2230%22 y=%2235%22 text-anchor=%22middle%22 fill=%22%23000%22 font-size=%2220%22%3ET%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="card-body p-2">
                    <h5 className="card-title">{team.name}</h5>
                    <p className="card-text">Captain: {team.captain}</p>
                    <p className="card-text" style={{ fontSize: '0.9rem' }}>
                      {team.description}
                    </p>
                    <div className="d-flex gap-2 mt-2">
                      <button
                        className="btn btn-sm btn-primary-acc"
                        onClick={() => handleViewTeam(team.id)}
                      >
                        View Team
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger delete-btn"
                        onClick={() => handleDelete(team.id, team.name)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    {team.createdDate && (
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Added: {team.createdDate}
                      </small>
                    )}
                  </div>
                  <button
                    className="position-absolute top-0 end-0 btn btn-sm text-muted p-1"
                    style={{ background: 'none', border: 'none' }}
                    onClick={() => handleDelete(team.id, team.name)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating + Button */}
        <button
          id="addTeamBtn"
          className="btn btn-accent rounded-circle shadow-lg"
          title="Add New Team"
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-plus"></i>
        </button>
      </section>

      {/* Add Team Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--card)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Modal.Title style={{ color: 'var(--accent)' }}>
            <i className="fas fa-plus-circle me-2"></i>
            Add New Team
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--card)', color: 'white' }}>
          <form onSubmit={handleSubmit} id="teamForm">
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-users me-1"></i>
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                maxLength="50"
                placeholder="Enter team name"
                value={formData.name}
                onChange={handleChange}
                disabled={submitting}
              />
              {formErrors.name && (
                <small className="text-danger">{formErrors.name}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-crown me-1"></i>
                Captain *
              </label>
              <input
                type="text"
                name="captain"
                className="form-control"
                maxLength="50"
                placeholder="Enter captain name"
                value={formData.captain}
                onChange={handleChange}
                disabled={submitting}
              />
              {formErrors.captain && (
                <small className="text-danger">{formErrors.captain}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-info-circle me-1"></i>
                Description *
              </label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                maxLength="200"
                placeholder="Enter team description"
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
              ></textarea>
              {formErrors.description && (
                <small className="text-danger">{formErrors.description}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-image me-1"></i>
                Team Logo *
              </label>
              <input
                type="file"
                name="logo"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
                disabled={submitting}
              />
              {formErrors.logo && (
                <small className="text-danger">{formErrors.logo}</small>
              )}
              <small className="text-muted">Max file size: 5MB</small>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--card)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Create Team
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Teams;