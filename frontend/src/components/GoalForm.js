import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../stylesheet/GoalForm.css';
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';

const GoalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState({
    goalName: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
  });

  // Get the token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (id) {
      const fetchGoal = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/goals/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setGoal(response.data);
        } catch (error) {
          console.error('Error fetching goal:', error);
        }
      };

      fetchGoal();
    }
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGoal({ ...goal, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (id) {
        await axios.put(`http://localhost:5000/api/goals/${id}`, goal, config);
      } else {
        await axios.post('http://localhost:5000/api/goals', goal, config);
      }
      navigate('/goals-list');
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  return (
    <>
      <UserHeader />
      <div className="form-container">
        <form onSubmit={handleSubmit} className="goal-form">
          <h1>{id ? 'Edit Goal' : 'Create Goal'}</h1>
          <div className="form-group">
            <label htmlFor="goalName">Goal Name:</label>
            <input
              type="text"
              id="goalName"
              name="goalName"
              value={goal.goalName}
              onChange={handleChange}
              placeholder="Enter your goal name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="targetAmount">Target Amount:</label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={goal.targetAmount}
              onChange={handleChange}
              placeholder="Enter target amount"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentAmount">Current Amount:</label>
            <input
              type="number"
              id="currentAmount"
              name="currentAmount"
              value={goal.currentAmount}
              onChange={handleChange}
              placeholder="Enter current amount"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Deadline:</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={goal.deadline}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            {id ? 'Update Goal' : 'Create Goal'}
          </button>
          <button
            type="button"
            className="action-button"
            onClick={() => navigate('/goals-list')}
          >
            My Goals
          </button>
        </form>
      </div>
      <UserFooter />
    </>
  );
};

export default GoalForm;