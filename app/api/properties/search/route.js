// File Name: route.js
// File Function:
// This file contains a function that handles a GET request to search for properties based on location and property type.
// It connects to the database, constructs a query based on the search parameters provided in the request URL,
// executes the query, and returns the matching properties as a JSON response.
import connectDB from '@/config/database';
import Property from '@/models/Property';

// Type of HTTP Method: GET
// Route: /api/properties/search
// Function Explanation:
// This function handles a GET request to search for properties based on location and property type.
// This function serves as a route handler for a GET request to search for properties based on location and property type. It constructs a query based on the search parameters provided in the request URL, executes the query against the database, and returns the matching properties as a JSON response. If any errors occur during this process, it logs the error and returns a generic error message with an appropriate status code.
export const GET = async (request) => {
  try {
    // Connect to the database
    await connectDB();

    // Extract search parameters from the request URL
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');

    // Create a regular expression pattern for the location search
    const locationPattern = new RegExp(location, 'i');

    // Construct a query object to match against database fields
    let query = {
      $or: [
        { name: locationPattern },
        { description: locationPattern },
        { 'location.street': locationPattern },
        { 'location.city': locationPattern },
        { 'location.state': locationPattern },
        { 'location.zipcode': locationPattern },
      ],
    };

    // Only include property type in the query if it's specified and not 'All'
    if (propertyType && propertyType !== 'All') {
      const typePattern = new RegExp(propertyType, 'i');
      query.type = typePattern;
    }

    // Find properties in the database that match the constructed query
    const properties = await Property.find(query);

    // Return matching properties as a JSON response with status 200 (OK)
    return new Response(JSON.stringify(properties), {
      status: 200,
    });
  } catch (error) {
    // Log any errors that occur during the process
    console.log(error);
    // Return a generic error message as a response with status 500 (Internal Server Error)
    return new Response('Something went wrong', { status: 500 });
  }
};
