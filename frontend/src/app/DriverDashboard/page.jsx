"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
} from "@mui/material"
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
  ArrowBack,
} from "@mui/icons-material"
import axios from "axios"

export default function DriverDashboard() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRide, setSelectedRide] = useState(null)
  const [showBookings, setShowBookings] = useState(false)
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [approvedRides, setApprovedRides] = useState([])
  const [showApprovedRides, setShowApprovedRides] = useState(false)
  const [approvedRidesLoading, setApprovedRidesLoading] = useState(false)
  const router = useRouter();

  useEffect(() => {
    fetchRides();
  }, [])

  const fetchRides = async () => {
    setLoading(true)
    setError(null)
    try {
      // const response = await axios.get("http://localhost:5000/driverRides", {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
      //   }
      // })
      // setRides(response.data.rides)
      // setLoading(false)
    } catch (error) {
      console.error("Error fetching rides:", error)
      setError("Failed to load rides. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRide = () => {
    router.push("/CreateRide")
  }

  const handleRefresh = () => {
    fetchRides()
  }

  const handleMenuOpen = (event, ride) => {
    setAnchorEl(event.currentTarget)
    setSelectedRide(ride)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRide(null)
  }

  const handleEditRide = () => {
    if (selectedRide) {
      router.push(`/EditRide/${selectedRide.id}`)
    }
    handleMenuClose()
  }

  const handleCancelRide = () => {
    // Implement cancel ride functionality
    handleMenuClose()
  }
  const user = JSON.parse(localStorage.getItem('user'));
  const handleViewBookings = async () => {
    setBookingsLoading(true)
    try {
      const response = await axios.post("http://localhost:5000/driver/bookings",{user},  {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      
      })
      setBookings(response.data.data)
      setShowBookings(true)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError("Failed to load bookings. Please try again.")
    } finally {
      setBookingsLoading(false)
    }
  }

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    console.log(bookingId);
    console.log(newStatus);
    try {
      await axios.patch(
        `http://localhost:5000/bookings/${bookingId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      )
      // Refresh bookings after status update
      handleViewBookings()
    } catch (error) {
      console.error("Error updating booking status:", error)
      setError("Failed to update booking status. Please try again.")
    }
  }

  const handleViewApprovedRides = async () => {
    setApprovedRidesLoading(true)
    setError(null)
    // const user = JSON.parse(localStorage.getItem('user')); 
    try {
      const response = await axios.post("http://localhost:5000/driverApprovedRides", {user},{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
        }
      })
      
      console.log("Approved Rides API Response:", response.data)
      
      setApprovedRides(response.data.approvedRides || [])
      setShowApprovedRides(true)
      setShowBookings(false)
    } catch (error) {
      console.error("Error fetching approved rides:", error)
      setError("Failed to load approved rides. Please try again.")
    } finally {
      setApprovedRidesLoading(false)
    }
  }

  const handleBackToRides = () => {
    setShowApprovedRides(false)
    setShowBookings(false)
  }

  const sortedRides = [...rides]

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success"
      case "pending":
        return "warning"
      case "completed":
        return "info"
      case "cancelled":
        return "error"
      default:
        return "default"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            background: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
            color: "white",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Driver Dashboard
              </Typography>
              <Typography variant="subtitle1">Manage your rides and track your earnings</Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<DirectionsCar />}
                onClick={handleCreateRide}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                Create New Ride
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<EventSeat />}
                onClick={handleViewBookings}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                View Bookings
              </Button>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<ArrowUpward />}
                onClick={handleViewApprovedRides}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                View Approved Rides
              </Button>
            </Box>
          </Box>
        </Paper>

        {showApprovedRides ? (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Approved Rides
              </Typography>
              <Button
                variant="outlined"
                onClick={handleBackToRides}
                startIcon={<ArrowBack />}
              >
                Back to Rides
              </Button>
            </Box>

            {approvedRidesLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : approvedRides.length > 0 ? (
              <Grid container spacing={3}>
                {approvedRides.map((ride) => (
                  <Grid item xs={12} sm={6} md={4} key={ride.id}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                        },
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          height: 8,
                          width: "100%",
                          bgcolor: (theme) => theme.palette.success.main,
                        }}
                      />
                      <CardContent sx={{ pt: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {ride.startLocation} → {ride.endLocation}
                        </Typography>

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(ride.departureTime)}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            {ride.distance || "N/A"} km
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <EventSeat fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            {ride.availableSeats} seats available
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            ${ride.price}
                          </Typography>
                          <Chip label={`${ride.bookedSeats || 0} booked`} size="small" variant="outlined" color="primary" />
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
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  bgcolor: "white",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No approved rides found
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  You don't have any approved rides yet.
                </Typography>
              </Paper>
            )}
          </Box>
        ) : showBookings ? (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Bookings & Baggage Details
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setShowBookings(false)}
                startIcon={<ArrowBack />}
              >
                Back to Rides
              </Button>
            </Box>

            {bookingsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : bookings.length > 0 ? (
              <Grid container spacing={3}>
                {bookings.map((booking) => (
                  <Grid item xs={12} key={booking.bookingId}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
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
                            Passenger: {booking.passenger.name} ({booking.passenger.email})
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            Pickup: {booking.location} at {booking.time}
                          </Typography>
                        </Box>

                        {booking.baggage && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Baggage Details:
                            </Typography>
                            <Box display="flex" gap={2}>
                              <Typography variant="body2">
                                Number of Bags: {booking.baggage.numberOfBags}
                              </Typography>
                              <Typography variant="body2">
                                Total Weight: {booking.baggage.totalWeight} kg
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            ${booking.fare}
                          </Typography>
                          {booking.status === "PENDING" && (
                            <Box display="flex" gap={1}>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleUpdateBookingStatus(booking.bookingId, "ACCEPTED")}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleUpdateBookingStatus(booking.bookingId, "REJECTED")}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
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
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  bgcolor: "white",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No bookings found
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  You don't have any bookings yet.
                </Typography>
              </Paper>
            )}
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Your Rides
              </Typography>
              <Box display="flex" gap={1}>
                <Tooltip title="Refresh rides">
                  <IconButton onClick={handleRefresh} color="primary" sx={{ bgcolor: "white", boxShadow: 1 }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Filter rides">
                  <IconButton color="primary" sx={{ bgcolor: "white", boxShadow: 1 }}>
                    <FilterList />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Search rides">
                  <IconButton color="primary" sx={{ bgcolor: "white", boxShadow: 1 }}>
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
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      bgcolor: "white",
                      height: "100%",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar sx={{ bgcolor: "#4caf50", width: 40, height: 40 }}>
                        <DirectionsCar />
                      </Avatar>
                      <Typography variant="h6" fontWeight="medium">
                        Total Rides
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {loading ? <Skeleton width={60} /> : rides.length}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      bgcolor: "white",
                      height: "100%",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
                        <Person />
                      </Avatar>
                      <Typography variant="h6" fontWeight="medium">
                        Active Rides
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {loading ? (
                        <Skeleton width={60} />
                      ) : (
                        rides.filter((ride) => ride.status.toLowerCase() === "active").length
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
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      bgcolor: "white",
                      height: "100%",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                        <AttachMoney />
                      </Avatar>
                      <Typography variant="h6" fontWeight="medium">
                        Total Earnings
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {loading ? (
                        <Skeleton width={80} />
                      ) : (
                        `$${rides.reduce((sum, ride) => sum + (ride.price || 0), 0).toFixed(2)}`
                      )}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={handleRefresh}>Retry</Button>}>
                {error}
              </Alert>
            )}

            {!loading && rides.length === 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  bgcolor: "white",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No rides found
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  You haven't created any rides yet. Click the button below to create your first ride.
                </Typography>
                <Button variant="contained" color="primary" onClick={handleCreateRide} startIcon={<DirectionsCar />}>
                  Create New Ride
                </Button>
              </Paper>
            )}

            <Grid container spacing={3}>
              {sortedRides.map((ride) => (
                <Grid item xs={12} sm={6} md={4} key={ride.id}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                      },
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        height: 8,
                        width: "100%",
                        bgcolor: (theme) => theme.palette[getStatusColor(ride.status)].main,
                      }}
                    />
                    <CardContent sx={{ pt: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip
                          label={ride.status}
                          color={getStatusColor(ride.status)}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, ride)} sx={{ mt: -1, mr: -1 }}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>

                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {ride.startLocation} → {ride.endLocation}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(ride.departureTime)}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {ride.distance || "N/A"} km
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <EventSeat fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {ride.availableSeats} seats available
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          ${ride.price}
                        </Typography>
                        <Chip label={`${ride.bookedSeats || 0} booked`} size="small" variant="outlined" color="primary" />
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

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleEditRide}>Edit Ride</MenuItem>
              <MenuItem onClick={handleCancelRide}>Cancel Ride</MenuItem>
              <MenuItem onClick={handleMenuClose}>View Passengers</MenuItem>
            </Menu>
          </>
        )}
      </Container>
    </Box>
  )
}
