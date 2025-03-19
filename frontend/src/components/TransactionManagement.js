import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheet/TransactionManagement.css'; // Import your stylesheet
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: 0,
    category: '',
    tags: [],
    recurring: false,
    recurrencePattern: '',
    endDate: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Predefined categories with colors
  const categories = [
    { name: 'Food', color: '#FF6B6B' },
    { name: 'Transportation', color: '#4ECDC4' },
    { name: 'Entertainment', color: '#FFD166' },
    { name: 'Utilities', color: '#06D6A0' },
    { name: 'Rent', color: '#118AB2' },
    { name: 'Salary', color: '#073B4C' },
  ];

  // Fetch transactions from the backend
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions based on search term (tags)
  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(transaction =>
        transaction.tags.some(tag =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [transactions, searchTerm]);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle tag changes (remove color logic)
  const handleTagChange = (e) => {
    const tags = e.target.value.split(',').map(tag => ({ name: tag.trim() }));
    setFormData({ ...formData, tags });
  };

  // Handle form submission (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingTransaction
        ? `http://localhost:5000/api/transactions/${editingTransaction._id}`
        : 'http://localhost:5000/api/transactions';
      const method = editingTransaction ? 'put' : 'post';
      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(editingTransaction ? 'Transaction updated:' : 'Transaction created:', response.data);
      fetchTransactions(); // Refresh the list
      setEditingTransaction(null); // Reset editing state
      setFormData({
        type: 'expense',
        amount: 0,
        category: '',
        tags: [],
        recurring: false,
        recurrencePattern: '',
        endDate: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      }); // Reset form
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  };

  // Handle transaction deletion
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Handle Edit Button Click
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      tags: transaction.tags,
      recurring: transaction.recurring,
      recurrencePattern: transaction.recurrencePattern || '',
      endDate: transaction.endDate || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description,
    });
  };

  // Group transactions by category
  const groupTransactionsByCategory = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(transaction);
      return acc;
    }, {});
  };

  const groupedTransactions = groupTransactionsByCategory(filteredTransactions);

  return (
    <>
      <UserHeader />
      <div className="transaction-management">
        <h1>Transaction Management</h1>
        <form onSubmit={handleSubmit}>
          <select name="type" value={formData.type} onChange={handleInputChange} required>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleInputChange}
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>Select Category</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated, e.g., vacation, work)"
            value={formData.tags.map(tag => tag.name).join(',')}
            onChange={handleTagChange}
          />
          <label>
            <input
              type="checkbox"
              name="recurring"
              checked={formData.recurring}
              onChange={handleInputChange}
            />
            Recurring
          </label>
          {formData.recurring && (
            <>
              <select
                name="recurrencePattern"
                value={formData.recurrencePattern}
                onChange={handleInputChange}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </>
          )}
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
          />
          <button type="submit">{editingTransaction ? 'Update Transaction' : 'Add Transaction'}</button>
          {editingTransaction && (
            <button type="button" onClick={() => setEditingTransaction(null)}>Cancel</button>
          )}
        </form>

        <div className="transactions-list">
          <input
            type="text"
            placeholder="Search by tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {Object.entries(groupedTransactions).map(([category, transactions]) => {
            const categoryColor = categories.find(cat => cat.name === category)?.color || '#cccccc';
            return (
              <div key={category} className="category-group">
                <h2 style={{ backgroundColor: categoryColor, padding: '10px', color: 'white', borderRadius: '5px' }}>
                  {category}
                </h2>
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="transaction-item" style={{ borderLeft: `5px solid ${categoryColor}` }}>
                    <h3>{transaction.category}</h3>
                    <p>Type: {transaction.type}</p>
                    <p>Amount: ${transaction.amount}</p>
                    <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
                    <p>Tags: {transaction.tags.map(tag => (
                      <span key={tag.name} style={{ backgroundColor: '#f0f0f0', padding: '2px 5px', borderRadius: '3px', marginRight: '5px' }}>
                        {tag.name}
                      </span>
                    ))}</p>
                    <p>Recurring: {transaction.recurring ? 'Yes' : 'No'}</p>
                    {transaction.recurring && (
                      <>
                        <p>Recurrence Pattern: {transaction.recurrencePattern}</p>
                        <p>End Date: {new Date(transaction.endDate).toLocaleDateString()}</p>
                      </>
                    )}
                    <p>Description: {transaction.description}</p>
                    <button className="delete-btn" onClick={() => handleDelete(transaction._id)}>Delete</button>
                    <button className="edit-btn" onClick={() => handleEdit(transaction)}>Edit</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default TransactionManagement;