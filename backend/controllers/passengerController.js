import prisma from "../config/db.config.js";



export const getPendingRequests = async (req, res) => {
    try {
      const passengerId = req.user.id;
  
      const pendingRides = await prisma.booking.findMany({
        where: {
          passengerId,
          status: "PENDING"
        },
        include: {
          ride: true, 
        }
      });
  
      res.status(200).json({
        message: "Requests Found Successfully",
        pendingRides
      });
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({
        message: "Failed to fetch pending requests",
        error: error.message,
      });
    }
  };
  
export const getApprovedRides = async (req,res) =>{
  try {
    const passengerId = req.user.id;

    const approvedRides = await prisma.booking.findMany({
      where: {
        passengerId,
        status: "ACCEPTED"
      },
      include: {
        ride: true, 
      }
    });

    res.status(200).json({
      message: "Requests Found Successfully",
      approvedRides
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({
      message: "Failed to fetch pending requests",
      error: error.message,
    });
  }
}