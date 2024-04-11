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
