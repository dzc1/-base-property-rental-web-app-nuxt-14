// File Name: route.js
// File Function:
// This file contains a function that handles a GET request to retrieve properties owned by a specific user.
// It connects to the database, retrieves properties associated with the given user ID, and returns them as a JSON response.
// ------------------------------------
import connectDB from '@/config/database';
import Property from '@/models/Property';

// GET
// Type of HTTP Method: GET
// Route: /api/properties/user/:userId
// Function Explanation:
// This function handles a GET request to retrieve properties owned by a specific user.
// This function serves as a route handler for a GET request to retrieve properties owned by a specific user. It ensures that the user ID is provided, queries the database for properties associated with that user, and returns them as a JSON response. If any errors occur during this process, it logs the error and returns a generic error message with an appropriate status code.
export const GET = async (request, { params }) => {
  try {
    // Connect to the database
    await connectDB();

    // Extract user ID from request parameters
    const userId = params.userId;

    // Check if user ID is missing, return error response if so
    if (!userId) {
      return new Response('User ID is required', { status: 400 });
    }

    // Find properties associated with the given user ID
    const properties = await Property.find({ owner: userId });

    // Return properties as a JSON response with status 200 (OK)
    return new Response(JSON.stringify(properties), {
      status: 200,
    });
  } catch (error) {
    // Log any errors that occur during the process
    console.log(error);
    // Return a generic error message as a response with status 500 (Internal Server Error)
    return new Response('Something Went Wrong', { status: 500 });
  }
};
