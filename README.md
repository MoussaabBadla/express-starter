# My Express Starter Api

## Project Overview:
This is my express starter for building rest api with typescript , JWT , mongodb



## Architecture:
The project follows a modular architecture, with components organized into the following directories inside the `src` folder:

1. **config**: Contains configuration files for the application, such as environment variables and database configurations.
2. **controller**: Handles incoming requests, processes them, and returns appropriate responses.
3. **db**: Manages database interactions, including connecting to the database, defining models, and executing queries.
4. **middleware**: Contains middleware functions that intercept requests before they reach the route handlers, used for authentication, error handling, etc.
5. **routes**: Defines the routes for different API endpoints, mapping them to corresponding controller functions.
6. **services**: Contains business logic for various functionalities of the application, separating it from the controller layer.
7. **test**: Houses test files for unit and integration testing, ensuring the reliability and correctness of the code.
8. **types**: Contains TypeScript type definitions for better code readability and maintainability.
9. **utils**: Holds utility functions used across different parts of the application, promoting code reusability.


## Packages Used:
- [Express](https://expressjs.com/) (4.18.2): Web framework for Node.js, used for building the backend server.
- [Mongoose](https://mongoosejs.com/) (7.4.0): MongoDB object modeling tool designed to work in an asynchronous environment.
- [Jest](https://jestjs.io/) (29.7.0): JavaScript testing framework used for writing and running tests.
- [Supertest](https://github.com/visionmedia/supertest) (6.3.3): HTTP assertion library, used with Jest for testing HTTP endpoints.
- [JWT](https://jwt.io/) (9.0.1): JSON Web Token implementation for user authentication.
- [Nodemailer](https://nodemailer.com/) (6.9.4): Module for sending emails, used for notification purposes.
- [Winston](https://github.com/winstonjs/winston) (3.11.0): Logging library for Node.js, used for logging application events and errors.
- [Cors](https://www.npmjs.com/package/cors) (2.8.5): Middleware for enabling Cross-Origin Resource Sharing (CORS) in Express.js.
- [Express Validator](https://express-validator.github.io/docs/) (7.0.1): Middleware for validating request data in Express.js applications.
- [Cloudinary](https://cloudinary.com/documentation/node_integration) (2.0.1): Media management solution for handling image and video uploads.

## Documentation:
### Scripts : 
   - `npm run build`: "Transpile TypeScript files into JavaScript using TypeScript compiler.",
   - `npm run dev`: "Start development server with live reloading for TypeScript files.",
   - `npm run doc`: "Generate documentation using TypeDoc.",
   - `npm run seed`: Seed the database with initial data after transpiling TypeScript files.",
   - `npm run start`: "Start the production server.",
   - `npm run test`: "Run tests using Jest with environment setup and cache disabled.",
   - `npm run lint`: "Lint TypeScript files for code quality issues.",
   - `npm run lint:fix`: "Automatically fix linting errors in TypeScript files."
## Getting Started:
Follow these steps to set up and run the project locally:

1. Clone the repository: `git clone https://github.com/MicroClub-USTHB/challenges-platform-rest-api`
2. Navigate to the project directory: `cd express-starter`
3. Install dependencies: `npm install` or `yarn install`
4. Set up environment variables ( database connection string, JWT secret) you can find it in .env.example
5. Start the backend server: `npm start` or `yarn start`
