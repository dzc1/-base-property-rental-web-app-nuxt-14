// File Name: route.js
// File Function:
// This file has 2 routes [GET , POST]
// GET
// This file exports a function named GET that handles GET requests. This function connects to the database, retrieves properties, and returns them as a JSON response. It supports pagination by retrieving a specified number of properties per page.
// POST
// This file also exports a function named POST that handles POST requests. It connects to the database, validates session user information, uploads images to Cloudinary, and saves property data to the database. It ensures that only valid image files are uploaded and associates the uploaded images with the property data.
// ------------------------------------
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';

// Type of HTTP Method: GET
// Route: /api/properties
// Function Explanation:
// This function handles a GET request. It retrieves properties from the database, paginates the results,
// and returns them along with total property count as a JSON response.
export const GET = async (request) => {
  try {
    // Connect to the database
    await connectDB();

    // Get page number and page size from the request URL parameters, default to 1 and 6 respectively
    const page = request.nextUrl.searchParams.get('page') || 1;
    const pageSize = request.nextUrl.searchParams.get('pageSize') || 6;

    // Calculate how many documents to skip based on page number and page size
    const skip = (page - 1) * pageSize;

    // Count total number of properties in the database
    // The countDocuments({}) function is a method provided by MongoDB's Node.js
    // method used to count the number of documents that match a given query criteria. When an empty object {} is passed as the query, it effectively means "count all documents in the collection", because an empty query matches all documents.
    const total = await Property.countDocuments({});

    // Retrieve properties from the database with pagination
    const properties = await Property.find({}).skip(skip).limit(pageSize);

    // Create a result object containing total count and properties array
    const result = {
      total,
      properties,
    };

    // Return the result as a JSON response with status 200 (OK)
    return new Response(JSON.stringify(result), {
      status: 200,
    });
  } catch (error) {
    // Log any errors that occur during the process
    console.log(error);
    // Return a generic error message as a response with status 500 (Internal Server Error)
    return new Response('Something Went Wrong', { status: 500 });
  }
};

// Type of HTTP Method: POST
// Route: /api/properties
// Function Explanation:
// This function handles a POST request to add a new property. It extracts data from the request,
// validates the session user, uploads images to Cloudinary, and then saves the property to the database.
export const POST = async (request) => {
  try {
    // Connect to the database
    await connectDB();

    // Retrieve session user information
    const sessionUser = await getSessionUser();

    // Check if session user or user ID is missing, return error response if so
    if (!sessionUser || !sessionUser.userId) {
      return new Response('User ID is required', { status: 401 });
    }

    // Extract user ID from session user
    const { userId } = sessionUser;

    // Parse form data from the request
    const formData = await request.formData();

    // Access all values from amenities and images
    // The getAll() method retrieves all values associated with a specific form field, in this case, 'amenities'.
    const amenities = formData.getAll('amenities');
    // This variable is assigned the result of calling formData.getAll('images') followed by a .filter() operation. Similar to amenities, formData.getAll('images') retrieves all values associated with the 'images' form field, which typically contains the uploaded image files. However, in this case, .filter() is applied to remove any empty or invalid images. The filter function checks if the name property of each image object is not an empty string (image.name !== ''). This ensures that only valid image files are included in the images array.
    const images = formData
      .getAll('images')
      .filter((image) => image.name !== '');

    // Create propertyData object for database
    const propertyData = {
      // Extract property details from form data
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
      owner: userId, // Assign the property owner as the current user
    };

    // Upload image(s) to Cloudinary
    const imageUploadPromises = [];

    // Iterate through each image, convert to base64, and upload to Cloudinary
    for (const image of images) {
      const imageBuffer = await image.arrayBuffer();
      const imageArray = Array.from(new Uint8Array(imageBuffer));
      const imageData = Buffer.from(imageArray);

      // Convert the image data to base64
      const imageBase64 = imageData.toString('base64');

      // Make request to upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:image/png;base64,${imageBase64}`,
        {
          folder: 'propertypulse', // Specify folder for storing images in Cloudinary
        }
      );

      imageUploadPromises.push(result.secure_url); // Store the secure URL of the uploaded image

      // Wait for all images to upload
      const uploadedImages = await Promise.all(imageUploadPromises);
      // Add uploaded images to the propertyData object
      propertyData.images = uploadedImages;
    }

    // Create a new Property instance with propertyData and save it to the database
    const newProperty = new Property(propertyData);
    await newProperty.save();
    // Redirect the user to the newly created property page
    return Response.redirect(
      `${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`
    );

    // return new Response(JSON.stringify({ message: 'Success' }), {
    //   status: 200,
    // });
  } catch (error) {
    // Return error response if any exception occurs during property addition
    return new Response('Failed to add property', { status: 500 });
  }
};

// OLD VERSION OF POST ROUTE
// export const POST = async (request) => {
//   try {
//     await connectDB();

//     const sessionUser = await getSessionUser();

//     if (!sessionUser || !sessionUser.userId) {
//       return new Response("User ID is required", { status: 401 });
//     }

//     const { userId } = sessionUser;

//     const formData = await request.formData();
//     // Access all values from amenities and images
//     const amenities = formData.getAll("amenities");
//     const images = formData
//       .getAll("images")
//       .filter((image) => image.name !== "");

//     // Create propertyData object for database
//     const propertyData = {
//       type: formData.get("type"),
//       name: formData.get("name"),
//       description: formData.get("description"),
//       location: {
//         street: formData.get("location.street"),
//         city: formData.get("location.city"),
//         state: formData.get("location.state"),
//         zipcode: formData.get("location.zipcode"),
//       },
//       beds: formData.get("beds"),
//       baths: formData.get("baths"),
//       square_feet: formData.get("square_feet"),
//       amenities,
//       rates: {
//         weekly: formData.get("rates.weekly"),
//         monthly: formData.get("rates.monthly"),
//         nightly: formData.get("rates.nightly."),
//       },
//       seller_info: {
//         name: formData.get("seller_info.name"),
//         email: formData.get("seller_info.email"),
//         phone: formData.get("seller_info.phone"),
//       },
//       owner: userId,
//     };

//     // Upload image(s) to Cloudinary
//     const imageUploadPromises = [];

//     for (const image of images) {
//       const imageBuffer = await image.arrayBuffer();
//       const imageArray = Array.from(new Uint8Array(imageBuffer));
//       const imageData = Buffer.from(imageArray);

//       // Convert the image data to base64
//       const imageBase64 = imageData.toString("base64");

//       // Make request to upload to Cloudinary
//       const result = await cloudinary.uploader.upload(
//         `data:image/png;base64,${imageBase64}`,
//         {
//           folder: "propertypulse",
//         }
//       );

//       imageUploadPromises.push(result.secure_url);

//       // Wait for all images to upload
//       const uploadedImages = await Promise.all(imageUploadPromises);
//       // Add uploaded images to the propertyData object
//       propertyData.images = uploadedImages;
//     }

//     const newProperty = new Property(propertyData);
//     await newProperty.save();

//     return Response.redirect(
//       `${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`
//     );

//     // return new Response(JSON.stringify({ message: 'Success' }), {
//     //   status: 200,
//     // });
//   } catch (error) {
//     return new Response("Failed to add property", { status: 500 });
//   }
// };
