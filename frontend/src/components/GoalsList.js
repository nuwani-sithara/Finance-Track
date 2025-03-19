import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../stylesheet/GoalsList.css';
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';

const GoalsList = () => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null); // Track the goal being edited
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility

  const navigate = useNavigate(); // Initialize useNavigate


  // Get the token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/goals', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        });
        setGoals(response.data);
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    fetchGoals();
  }, [token]); // Add token as a dependency

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/goals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });
      setGoals(goals.filter(goal => goal._id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleEditClick = (goal) => {
    setSelectedGoal(goal); // Set the goal to be edited
    setIsModalOpen(true); // Open the modal
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedGoal(null); // Clear the selected goal
  };

  const handleSaveChanges = async (updatedGoal) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/goals/${updatedGoal._id}`, updatedGoal, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the goals list with the edited goal
      setGoals(goals.map(goal => (goal._id === updatedGoal._id ? response.data : goal)));
      handleModalClose(); // Close the modal
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  return (
    <>
      <UserHeader />
      <div className="container">
        <h1>My Goals</h1>
        {goals.map(goal => (
          <div key={goal._id} className="goal-card">
            <h2>{goal.goalName}</h2>
            <p>Target Amount: ${goal.targetAmount}</p>
            <p>Current Amount: ${goal.currentAmount}</p>
            <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
              />
            </div>
            <div className="actions">
              <button onClick={() => handleEditClick(goal)}>Edit</button>
              <button onClick={() => handleDelete(goal._id)}>Delete</button>
            </div>
           
          </div>
        ))}

            <button
              className="action-button"
              onClick={() => navigate("/goal-form")} // Make Goals
            >
              Make Goals
            </button>
      </div>


      {/* Edit Goal Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Goal</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveChanges(selectedGoal);
              }}
            >
              <label>
                Goal Name:
                <input
                  type="text"
                  value={selectedGoal.goalName}
                  onChange={(e) =>
                    setSelectedGoal({ ...selectedGoal, goalName: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Target Amount:
                <input
                  type="number"
                  value={selectedGoal.targetAmount}
                  onChange={(e) =>
                    setSelectedGoal({ ...selectedGoal, targetAmount: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Current Amount:
                <input
                  type="number"
                  value={selectedGoal.currentAmount}
                  onChange={(e) =>
                    setSelectedGoal({ ...selectedGoal, currentAmount: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Deadline:
                <input
                  type="date"
                  value={new Date(selectedGoal.deadline).toISOString().split('T')[0]}
                  onChange={(e) =>
                    setSelectedGoal({ ...selectedGoal, deadline: e.target.value })
                  }
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={handleModalClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>

        </div>
        
      )}

      <div>
     
      </div>

      <UserFooter />
    </>
  );
};

export default GoalsList;