'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Alert,
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  AccessTime,
  AttachMoney,
  Person,
  MoreVert,
  Refresh,
  FilterList,
  Search,
  EventSeat,
  ArrowUpward,
  ArrowDownward,
  Star,
  History,
  Logout,
  PendingActions,
} from '@mui/icons-material';
import Image from 'next/image';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [pendingRides, setPendingRides] = useState([]);
  const [showPendingRides, setShowPendingRides] = useState(false);
  const [pendingRidesLoading, setPendingRidesLoading] = useState(false);
  const [approvedRides, setApprovedRides] = useState([]);
  const [showApprovedRides, setShowApprovedRides] = useState(false);
  const [approvedRidesLoading, setApprovedRidesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('departureTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      router.push('/Signin');
    } else {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      fetchBookings();
    }
  }, [router]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
        }
      });
      
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRides = async () => {
    setPendingRidesLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/pendingRides", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
        }
      });
      
      console.log("API Response:", response.data); // Debug the response
      
      // Use response.data.rides instead of response.data.pendingRides
      setPendingRides(response.data.pendingRides || []);
      
      setShowPendingRides(true);
    } catch (error) {
      console.error('Error fetching pending rides:', error);
      setError('Failed to load pending rides. Please try again.');
    } finally {
      setPendingRidesLoading(false);
    }
  };

  const fetchApprovedRides = async () => {
    setApprovedRidesLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/approvedRides", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
        }
      });
      
      console.log("Approved Rides API Response:", response.data);
      
      setApprovedRides(response.data.approvedRides || []);
      setShowApprovedRides(true);
      setShowPendingRides(false);
    } catch (error) {
      console.error('Error fetching approved rides:', error);
      setError('Failed to load approved rides. Please try again.');
    } finally {
      setApprovedRidesLoading(false);
    }
  };

  const handleShowApprovedRides = () => {
    fetchApprovedRides();
  };

  const handleBackToBookings = () => {
    setShowPendingRides(false);
    setShowApprovedRides(false);
  };

  const handleShowBookings = () => {
    setShowPendingRides(false);
    setShowApprovedRides(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    router.push('/Signin');
  };

  const handleBookRide = (rideId) => {
    router.push(`/Booking/${rideId}`);
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  const handleCancelBooking = () => {
    // Implement cancel booking functionality
    handleMenuClose();
  };

  const handleViewDetails = () => {
    if (selectedBooking) {
      router.push(`/BookingDetails/${selectedBooking.id}`);
    }
    handleMenuClose();
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortField === 'price') {
      return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
    } else if (sortField === 'departureTime') {
      return sortDirection === 'asc'
        ? new Date(a.departureTime) - new Date(b.departureTime)
        : new Date(b.departureTime) - new Date(a.departureTime);
    } else if (sortField === 'seats') {
      return sortDirection === 'asc' ? a.seats - b.seats : b.seats - a.seats;
    }
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !user) {
    return (
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Typography variant="h6" color="textSecondary">Loading...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                User Dashboard
              </Typography>
              <Typography variant="subtitle1">Welcome, {user?.name || 'User'}</Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<DirectionsCar />}
                onClick={() => handleBookRide()}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  px: 3,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                Book a Ride
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Paper>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            {showPendingRides ? "Pending Rides" : showApprovedRides ? "Approved Rides" : "Your Bookings"}
          </Typography>
          <Box display="flex" gap={1}>
            {showPendingRides || showApprovedRides ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleBackToBookings}
                startIcon={<History />}
              >
                Back to Bookings
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={fetchPendingRides}
                  startIcon={<PendingActions />}
                >
                  Show Pending Rides
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleShowApprovedRides}
                  startIcon={<Star />}
                >
                  Show Approved Rides
                </Button>
              </>
            )}
            <Tooltip title="Refresh bookings">
              <IconButton onClick={handleRefresh} color="primary" sx={{ bgcolor: 'white', boxShadow: 1 }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter bookings">
              <IconButton color="primary" sx={{ bgcolor: 'white', boxShadow: 1 }}>
                <FilterList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Search bookings">
              <IconButton color="primary" sx={{ bgcolor: 'white', boxShadow: 1 }}>
                <Search />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  bgcolor: 'white',
                  height: '100%',
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 40, height: 40 }}>
                    <DirectionsCar />
                  </Avatar>
                  <Typography variant="h6" fontWeight="medium">
                    Total Bookings
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? <Skeleton width={60} /> : bookings.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  bgcolor: 'white',
                  height: '100%',
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
                    <Person />
                  </Avatar>
                  <Typography variant="h6" fontWeight="medium">
                    Active Bookings
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? (
                    <Skeleton width={60} />
                  ) : (
                    bookings.filter((booking) => booking.status.toLowerCase() === 'active').length
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  bgcolor: 'white',
                  height: '100%',
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 40, height: 40 }}>
                    <Star />
                  </Avatar>
                  <Typography variant="h6" fontWeight="medium">
                    Your Rating
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {loading ? (
                    <Skeleton width={60} />
                  ) : (
                    user?.rating || '4.5'
                  )}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box mb={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              bgcolor: 'white',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold">
                Sort by:
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  variant={sortField === 'departureTime' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleSort('departureTime')}
                  endIcon={
                    sortField === 'departureTime' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUpward fontSize="small" />
                      ) : (
                        <ArrowDownward fontSize="small" />
                      )
                    ) : null
                  }
                >
                  Date
                </Button>
                <Button
                  size="small"
                  variant={sortField === 'price' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleSort('price')}
                  endIcon={
                    sortField === 'price' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUpward fontSize="small" />
                      ) : (
                        <ArrowDownward fontSize="small" />
                      )
                    ) : null
                  }
                >
                  Price
                </Button>
                <Button
                  size="small"
                  variant={sortField === 'seats' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleSort('seats')}
                  endIcon={
                    sortField === 'seats' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUpward fontSize="small" />
                      ) : (
                        <ArrowDownward fontSize="small" />
                      )
                    ) : null
                  }
                >
                  Seats
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={handleRefresh}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {showPendingRides ? (
          pendingRidesLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : pendingRides.length > 0 ? (
            <Grid container spacing={3}>
              {pendingRides.map((ride) => {
              console.log("Ride:", ride); // Proper logging

    return (
      <Grid item xs={12} sm={6} md={4} key={ride.ride.id}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
            },
            position: 'relative',
          }}
        >
          <Box
            sx={{
              height: 8,
              width: '100%',
              bgcolor: (theme) => theme.palette.warning.main,
            }}
          />
        <CardContent sx={{ pt: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Chip
              label="Pending"
              color="warning"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {ride.ride.startLocation} → {ride.ride.endLocation}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {formatDate(ride.ride.departureTime)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <DirectionsCar fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {ride.carModel || "Car"} ({ride.carColor || "N/A"})
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <EventSeat fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {ride.ride.availableSeats} seat{ride.ride.availableSeats !== 1 ? 's' : ''} available
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold" color="primary">
              ${ride.ride.price}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
})}

            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                bgcolor: 'white',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No pending rides found
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                There are no pending rides available at the moment.
              </Typography>
            </Paper>
          )
        ) : showApprovedRides ? (
          approvedRidesLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : approvedRides.length > 0 ? (
            <Grid container spacing={3}>
              {approvedRides.map((ride) => (
                <Grid item xs={12} sm={6} md={4} key={ride.ride.id}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                      },
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        height: 8,
                        width: '100%',
                        bgcolor: (theme) => theme.palette.success.main,
                      }}
                    />
                    <CardContent sx={{ pt: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip
                          label="Approved"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>

                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {ride.ride.startLocation} → {ride.ride.endLocation}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(ride.ride.departureTime)}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <DirectionsCar fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {ride.ride.carModel || "Car"} ({ride.ride.carColor || "N/A"})
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <EventSeat fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {ride.ride.availableSeats} seat{ride.ride.availableSeats !== 1 ? 's' : ''} available
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          ${ride.ride.price}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                bgcolor: 'white',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No approved rides found
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                There are no approved rides available at the moment.
              </Typography>
            </Paper>
          )
        ) : (
          <Grid container spacing={3}>
            {sortedBookings.map((booking) => (
              <Grid item xs={12} sm={6} md={4} key={booking.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                    },
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      height: 8,
                      width: '100%',
                      bgcolor: (theme) => theme.palette[getStatusColor(booking.status)].main,
                    }}
                  />
                  <CardContent sx={{ pt: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, booking)} sx={{ mt: -1, mr: -1 }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {booking.startLocation} → {booking.endLocation}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(booking.departureTime)}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        Driver: {booking.driverName}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Star fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        Driver Rating: {booking.driverRating}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <EventSeat fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {booking.seats} seat{booking.seats !== 1 ? 's' : ''} booked
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        ${booking.price}
                      </Typography>
                      <Chip label={`Ride #${booking.rideId}`} size="small" variant="outlined" color="primary" />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button size="small" variant="outlined" fullWidth>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
          <MenuItem onClick={handleCancelBooking}>Cancel Booking</MenuItem>
          <MenuItem onClick={handleMenuClose}>Contact Driver</MenuItem>
        </Menu>
      </Container>
    </Box>
  );
}
