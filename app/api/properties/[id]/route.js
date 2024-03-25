// File Name: route.js
// File Function:
// This file contains functions to handle GET, DELETE, and PUT requests related to properties.

import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';

// Type of HTTP Method: GET
// Route: /api/properties/:id
// Function Explanation:
// This function handles a GET request to fetch a property by its ID.
export const GET = async (request, { params }) => {
  try {
    // Connect to the database
    await connectDB();

    // Find the property by its ID
    const property = await Property.findById(params.id);

    // If property not found, return a 404 response
    if (!property) return new Response('Property Not Found', { status: 404 });

    // Return the property as a JSON response with status 200 (OK)
    return new Response(JSON.stringify(property), {
      status: 200,
    });
  } catch (error) {
    // Log any errors that occur during the process
    console.log(error);
    // Return a generic error message as a response with status 500 (Internal Server Error)
    return new Response('Something Went Wrong', { status: 500 });
  }
};

// Type of HTTP Method: DELETE
// Route:  /api/properties/:id
// Function Explanation:
// This function handles a DELETE request to delete a property by its ID.
export const DELETE = async (request, { params }) => {
  try {
    // Extract property ID from request parameters
    const propertyId = params.id;

    // Get session user data
    const sessionUser = await getSessionUser();

    // Check if session user data or user ID is missing, return a 401 response
    if (!sessionUser || !sessionUser.userId) {
      return new Response('User ID is required', { status: 401 });
    }

    // Extract user ID from session user data
    const { userId } = sessionUser;

    // Connect to the database
    await connectDB();

    // Find the property by its ID
    const property = await Property.findById(propertyId);

    // If property not found, return a 404 response
    if (!property) return new Response('Property Not Found', { status: 404 });

    // Verify ownership by comparing property owner's ID with session user's ID
    if (property.owner.toString() !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Delete the property from the database
    await property.deleteOne();

    // Return a success message as a response with status 200 (OK)
    return new Response('Property Deleted', {
      status: 200,
    });
  } catch (error) {
    // Log any errors that occur during the process
    console.log(error);
    // Return a generic error message as a response with status 500 (Internal Server Error)
    return new Response('Something Went Wrong', { status: 500 });
  }
};

// Type of HTTP Method: PUT
// Route:  /api/properties/:id
// Function Explanation:
// This function  handles a PUT request to update a property by its ID.
export const PUT = async (request, { params }) => {
  try {
    // Connect to the database
    await connectDB();

    // Get session user data
    const sessionUser = await getSessionUser();

    // Check if session user data or user ID is missing, return a 401 response
    if (!sessionUser || !sessionUser.userId) {
      return new Response('User ID is required', { status: 401 });
    }

    // Extract property ID and user ID from request parameters and session user data respectively
    const { id } = params;
    const { userId } = sessionUser;

    // Parse form data from the request
    const formData = await request.formData();

    // Extract amenities from form data
    const amenities = formData.getAll('amenities');

    // Find the existing property by its ID
    const existingProperty = await Property.findById(id);

    // If property not found, return a 404 response
    if (!existingProperty) {
      return new Response('Property does not exist', { status: 404 });
    }

    // Verify ownership by comparing property owner's ID with session user's ID
    if (existingProperty.owner.toString() !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Create property data object for updating the property in the database
    const propertyData = {
      type: formData.get('type'),
      name: formData.get('name'),
      description: formData.get('description'),
      location: {
        street: formData.get('location.street'),
        city: formData.get('location.city'),
        state: formData.get('location.state'),
        zipcode: formData.get('location.zipcode'),
      },
      beds: formData.get('beds'),
      baths: formData.get('baths'),
      square_feet: formData.get('square_feet'),
      amenities,
      rates: {
        weekly: formData.get('rates.weekly'),
        monthly: formData.get('rates.monthly'),
        nightly: formData.get('rates.nightly.'),
      },
      seller_info: {
        name: formData.get('seller_info.name'),
        email: formData.get('seller_info.email'),
        phone: formData.get('seller_info.phone'),
      },
      owner: userId,
    };

    // Update the property in the database
    const updatedProperty = await Property.findByIdAndUpdate(id, propertyData);

    // Return the updated property as a JSON response with status 200 (OK)
    return new Response(JSON.stringify(updatedProperty), {
      status: 200,
    });
  } catch (error) {
    // Log any errors that occur during the process
    console.log(error);
    // Return a generic error message as a response with status 500 (Internal Server Error)
    return new Response('Failed to add property', { status: 500 });
  }
};
