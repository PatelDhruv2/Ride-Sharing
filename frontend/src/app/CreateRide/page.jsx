"use client";
import React, { useState, useEffect } from 'react';

const CreateRide = () => {
  const [formData, setFormData] = useState({
    userId: '', // will be updated on component mount
    startLocation: '',
    endLocation: '',
    route: '',
    departureTime: '',
    availableSeats: '',
    model: '',
    licenseNo: '',
    color: '',
    capacity: '',
    price: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Use useEffect to retrieve userId from localStorage on component mount
  useEffect(() => {
    // const userId = localStorage.getItem('user.id');
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user.id;
    if (userId) {
      setFormData((prevData) => ({
        ...prevData,
        userId: userId,
      }));
    } else {
      setErrorMessage('User not logged in.');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    // Convert availableSeats, capacity to integers and price to a float
    const formDataToSend = {
      ...formData,
      availableSeats: parseInt(formData.availableSeats, 10),
      capacity: parseInt(formData.capacity, 10),
      price: parseFloat(formData.price), // Parse price as a float
    };

    try {
      const response = await fetch('http://localhost:5000/create-ride', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message);
        setFormData({
          userId: '',
          startLocation: '',
          endLocation: '',
          route: '',
          departureTime: '',
          availableSeats: '',
          model: '',
          licenseNo: '',
          color: '',
          capacity: '',
          price: ''
        });
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('Error creating ride. Please try again.');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Create Ride</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>User ID</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
            disabled // Prevent user from editing userId
          />
        </div>
        <div>
          <label>Start Location</label>
          <input
            type="text"
            name="startLocation"
            value={formData.startLocation}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>End Location</label>
          <input
            type="text"
            name="endLocation"
            value={formData.endLocation}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Route</label>
          <input
            type="text"
            name="route"
            value={formData.route}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Departure Time</label>
          <input
            type="datetime-local"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Available Seats</label>
          <input
            type="number"
            name="availableSeats"
            value={formData.availableSeats}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Vehicle Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>License Number</label>
          <input
            type="text"
            name="licenseNo"
            value={formData.licenseNo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Capacity</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create Ride</button>
      </form>
    </div>
  );
};

export default CreateRide;
