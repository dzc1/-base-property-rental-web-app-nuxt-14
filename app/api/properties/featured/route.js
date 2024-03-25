// File Name: route.js
// File Function:
// This file contains a function that handles a GET request to fetch featured properties.
import connectDB from '@/config/database';
import Property from '@/models/Property';

// Type of HTTP Method: GET
// Route: /api/properties/featured
// Function Explanation:
// This function handles a GET request to fetch featured properties. It connects to the database, queries properties marked as featured, and returns them as a JSON response.// Function Explanation: This function handles a GET request to fetch featured properties. It connects to the database, queries properties marked as featured, and returns them as a JSON response.
export const GET = async (request) => {
  try {
    // Connect to the database
    await connectDB();

    // Query the database to find properties marked as featured
    const properties = await Property.find({
      is_featured: true,
    });

    // Return the fetched properties as a JSON response with status 200 (OK)
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
