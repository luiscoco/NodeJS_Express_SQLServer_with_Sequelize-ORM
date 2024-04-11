const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");

const swaggerJSDoc = require('swagger-jsdoc');

const swaggerUi = require('swagger-ui-express');

const app = express();

const port = process.env.PORT || 8080; 

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());  /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

// Swagger configuration
// (Same as your original setup, no changes needed here)

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tutorials API",
      version: "1.0.0",
      description: "A simple API to manage tutorials",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Tutorial: {
          type: "object",
          required: ['title', 'description', 'published'], // assuming these fields are required
          properties: {
            id: {
              type: "integer",
              format: "int32",
              description: "Unique identifier for the tutorial",
            },
            title: {
              type: "string",
              description: "Title of the tutorial",
            },
            description: {
              type: "string",
              description: "Description of the tutorial",
            },
            published: {
              type: "boolean",
              description: "Published status of the tutorial",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Date and time when the tutorial was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Date and time when the tutorial was last updated",
            },
          },
        },
      },
    },
  },
  apis: ['./app/routes/*.routes.js', './app/controllers/*.controller.js'], // Patterns to find Swagger annotations
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//Database configuration and models

const db = require("./app/models");

db.sequelize.sync();
// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/turorial.routes")(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
