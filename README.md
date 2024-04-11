# Node.js CRUD example with SQL Server (MSSQL) - Express Rest APIs and Sequelize(ORM)

## How to run the SQL Server Docker container

## How to create the Database and the Table

We run this SQL query for creating the database **bezkoder_db** and a new a table **Tutorials**

```SQL
CREATE DATABASE bezkoder_db
GO

CREATE TABLE Tutorials (
    id INT IDENTITY PRIMARY KEY,
    title NVARCHAR(255),
    description NVARCHAR(255),
    published BIT,
    createdAt DATETIME,
    updatedAt DATETIME
);
```

## Project folders and files structure

This is the project folders and files structure

![image](https://github.com/luiscoco/node-js-mssql-crud-example-master-advance-sample-/assets/32194879/5ac0a698-38a8-4c26-ae21-98fc83d164df)

## Project dependencies

**package.json**

```json
{
  "name": "node-js-crud-sql-server",
  "version": "1.0.0",
  "description": "Node.js CRUD example with SQL Server",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "node js",
    "sql server",
    "mssql",
    "crud",
    "express",
    "sequelize",
    "rest api"
  ],
  "author": "bezkoder",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "sequelize": "^6.28.0",
    "tedious": "^15.1.2",
    "swagger-jsdoc": "^6.0.0",
    "swagger-ui-express": "^4.1.6"
  }
}
```

## Source code explained

**server.js**

```javascript
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
```

**db.config.js**

```javascript
module.exports = {
  HOST: "localhost",
  PORT: "1433",
  USER: "sa",
  PASSWORD: "Luiscoco123456",
  DB: "bezkoder_db",
  dialect: "mssql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
```

**tutorial.controller.js**

```javascript
const db = require("../models");
const Tutorial = db.tutorials;
const Op = db.Sequelize.Op;

/**
 * @swagger
 * /api/tutorials:
 *   post:
 *     summary: Create a new tutorial
 *     description: Add a tutorial to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Returns the created tutorial.
 *       400:
 *         description: Content can not be empty.
 *       500:
 *         description: Server error.
 */
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Tutorial
  const tutorial = {
    title: req.body.title,
    description: req.body.description,
    published: req.body.published ? req.body.published : false
  };

  // Save Tutorial in the database
  Tutorial.create(tutorial)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial."
      });
    });
};

/**
 * @swagger
 * /api/tutorials:
 *   get:
 *     summary: Retrieve all tutorials
 *     description: Get a list of all tutorials, optionally filtered by title.
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Title to filter by.
 *     responses:
 *       200:
 *         description: A list of tutorials.
 *       500:
 *         description: Server error.
 */
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Tutorial.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};

/**
 * @swagger
 * /api/tutorials/{id}:
 *   get:
 *     summary: Retrieve a single tutorial by ID
 *     description: Get a tutorial by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tutorial ID.
 *     responses:
 *       200:
 *         description: A tutorial object.
 *       500:
 *         description: Error retrieving tutorial.
 */
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tutorial.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id
      });
    });
};

/**
 * @swagger
 * /api/tutorials/{id}:
 *   put:
 *     summary: Update a tutorial
 *     description: Update a tutorial by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tutorial ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tutorial was updated successfully.
 *       400:
 *         description: Request body is empty.
 *       500:
 *         description: Error updating tutorial.
 */

exports.update = (req, res) => {
  const id = req.params.id;

  Tutorial.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tutorial was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Tutorial with id=" + id
      });
    });
};

/**
 * @swagger
 * /api/tutorials/{id}:
 *   delete:
 *     summary: Delete a tutorial
 *     description: Delete a tutorial by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tutorial ID.
 *     responses:
 *       200:
 *         description: Tutorial was deleted successfully.
 *       404:
 *         description: Tutorial not found.
 *       500:
 *         description: Error deleting tutorial.
 */
exports.delete = (req, res) => {
  const id = req.params.id;

  Tutorial.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tutorial was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Tutorial with id=" + id
      });
    });
};

/**
 * @swagger
 * /api/tutorials:
 *   delete:
 *     summary: Delete all tutorials
 *     tags: [Tutorials]
 *     responses:
 *       200:
 *         description: All tutorials were deleted successfully.
 *       500:
 *         description: Some error occurred while removing all tutorials.
 */
exports.deleteAll = (req, res) => {
  Tutorial.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Tutorials were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};

/**
 * @swagger
 * /api/tutorials/published:
 *   get:
 *     summary: Retrieve all published tutorials
 *     tags: [Tutorials]
 *     responses:
 *       200:
 *         description: A list of published tutorials.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tutorial'
 *       500:
 *         description: Some error occurred while retrieving tutorials.
 */
exports.findAllPublished = (req, res) => {
  Tutorial.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};
```

**index.js**

```javascript
const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  logging: console.log,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);

module.exports = db;
```

**tutorial.model.js**

```javascript
module.exports = (sequelize, Sequelize) => {
  const Tutorial = sequelize.define("tutorial", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    published: {
      type: Sequelize.BOOLEAN
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    // If you want Sequelize to automatically update the timestamps
    // you don't need to pass anything here. However, if you are going
    // to update them manually, you should set `timestamps: false`
    // timestamps: false
  });

  return Tutorial;
};
```

**tutorial.routes.js**

```javascript
module.exports = app => {
  const tutorials = require("../controllers/tutorial.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", tutorials.create);

  // Retrieve all Tutorials
  router.get("/", tutorials.findAll);

  // Retrieve all published Tutorials
  router.get("/published", tutorials.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", tutorials.findOne);

  // Update a Tutorial with id
  router.put("/:id", tutorials.update);

  // Delete a Tutorial with id
  router.delete("/:id", tutorials.delete);

  // Delete all Tutorials
  router.delete("/", tutorials.deleteAll);

  app.use('/api/tutorials', router);
};
```

## How to run the application

We first install the application dependencies

```
npm i
```

Then we run the application

```
node server.js
```

We access the Swagger OpenAPI docs: **http://localhost:8080/api-docs/#/**

![image](https://github.com/luiscoco/NodeJS_Express_SQLServer_with_Sequelize-ORM/assets/32194879/6a970751-c665-4113-82ac-fbd1377abb72)

We send a **POST** request for creating a new item in the database

![image](https://github.com/luiscoco/NodeJS_Express_SQLServer_with_Sequelize-ORM/assets/32194879/b1c2416f-8135-46a1-9463-cedb0693b667)

We verify the new entry sending a **GET** request

![image](https://github.com/luiscoco/NodeJS_Express_SQLServer_with_Sequelize-ORM/assets/32194879/71ae455c-c600-47f8-a51d-fe2585e8ed1e)

We also verify in SQL Sever Management Studio **SSMS**

![image](https://github.com/luiscoco/NodeJS_Express_SQLServer_with_Sequelize-ORM/assets/32194879/736904e0-709f-4150-b606-85e1e8bfd5e4)



